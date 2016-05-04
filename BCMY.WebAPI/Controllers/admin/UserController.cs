using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

using Microsoft.AspNet.Identity.Owin;
using BCMY.WebAPI.Models;
using BCMY.WebAPI.Util;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using System.Configuration;
using GenericRepository_UnitOfWork.UOW;
using GenericRepository_UnitOfWork.GR;
using DataAccess_EF.EntityFramework;
using BCMY.WebAPI.Models.UnityDI;
using System.Data.SqlClient;
using System.Data;
using BCMY.WebAPI.Util.Encryption;

namespace BCMY.WebAPI.Controllers.admin
{
    /// <summary>
    /// Used to expose user related data
    /// </summary>
    [EnableCors(origins: "https://localhost:44301", headers: "*", methods: "*")]
    //[Authorize]
    public class UserController : ApiController
    {
        ApplicationRoleManager roleManager = null;
        ApplicationUserManager userManager = null;

        ObjectProvider objectProvider = null;
        UnitOfWork unitOfWork = null;
        GenericRepository<AspNetUser> aspNetUsersRepository = null;

        public UserController()
        {
            roleManager = HttpContext.Current.GetOwinContext().Get<ApplicationRoleManager>();    
            userManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();

            objectProvider = objectProvider == null ? new ObjectProvider() : objectProvider;
            unitOfWork = unitOfWork == null ? objectProvider.UnitOfWork : unitOfWork;
            aspNetUsersRepository = aspNetUsersRepository == null ? unitOfWork.AspNetUserRepository : aspNetUsersRepository;
        }


        // used to retreive all the user roles
        //[Authorize(Roles = "Director")]
        public IList<ApplicationUserViewModel> GetUsers()
        {
            IList<ApplicationUserViewModel> userVms = null;
            try
            {
                IList<ApplicationRole> roles = roleManager.Roles.ToList<ApplicationRole>();
                IList<ApplicationUser> users = userManager.Users.ToList<ApplicationUser>();

                userVms = ConvertToApplicationUserViewModels(roles, users);
            }
            catch (Exception)
            {
                userVms = null;
            }
            //return userVms.OrderBy(u => u.EmploymentDate).
            //    ThenBy(u => u.RegistrationDate).
            //    ThenBy(u => u.LastName).
            //    ThenBy(u => u.FirstName).
            //    ToList<ApplicationUserViewModel>();
            return userVms;
        }

        [Authorize]
        [HttpPost, Route("api/GetUserByEmail")]
        public ApplicationUserViewModel GetUser(string username)
        {
            try
            {                
                ApplicationUser user = userManager.FindByEmail(username);
                if (user != null)
                {
                    IList<ApplicationRole> roles = roleManager.Roles.ToList<ApplicationRole>();
                    ApplicationUserViewModel applicationUserViewModel = ConvertToApplicationUserViewModel(user, roles);
                    return applicationUserViewModel;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {                
                return null;
            }
        }

        // Returns a list of ApplicationUserViewModels 
        private IList<ApplicationUserViewModel> ConvertToApplicationUserViewModels(IList<ApplicationRole> roles, IList<ApplicationUser> users)
        {
            IList<ApplicationUserViewModel> userVms = new List<ApplicationUserViewModel>();
            try
            {
                foreach (ApplicationUser user in users)
                {
                    ApplicationUserViewModel vm = ConvertToApplicationUserViewModel(user, roles);
                    userVms.Add(vm);
                }
            }
            catch (Exception ex)
            {                
                throw ex;
            }
            return userVms;
        }

        // Used to convert an ApplicationUser to ApplicationUserViewModel
        private static ApplicationUserViewModel ConvertToApplicationUserViewModel(ApplicationUser user, IList<ApplicationRole> roles)
        {
            ApplicationUserViewModel vm = new ApplicationUserViewModel();
            vm.Title = user.Title;
            vm.FirstName = user.FirstName;
            vm.LastName = user.LastName;
            vm.Position = user.Position;
            vm.DirectDial = (user.DirectDial == null || user.DirectDial == "") ? "-" : user.DirectDial;
            vm.Extension = (user.Extension == null || user.Extension.ToString() == "") ? "-" : user.Extension.ToString();
            vm.EmploymentDate = (user.EmploymentDate == null) ? "never" : user.EmploymentDate.Value.ToShortDateString();
            vm.RegistrationDate = (user.RegistrationDate == null) ? "never" : string.Format("{0} - {1}", user.RegistrationDate.Value.ToShortDateString(), user.RegistrationDate.Value.ToShortTimeString());
            vm.LastLogInTime = (user.LastLogInTime == null) ? "never" : string.Format("{0} - {1}", user.LastLogInTime.Value.ToShortDateString(), user.LastLogInTime.Value.ToShortTimeString());
            vm.LastLogoutTime = (user.LastLogoutTime == null) ? "never" : string.Format("{0} - {1}", user.LastLogoutTime.Value.ToShortDateString(), user.LastLogoutTime.Value.ToShortTimeString());
            vm.IsLoggedIn = user.IsLoggedIn;
            vm.InvalidLoginAttemptCount = user.InvalidLoginAttemptCount;
            vm.LastInvalidLoginAttemptTime = (user.LastInvalidLoginAttemptTime == null) ? "never" : string.Format("{0} - {1}", user.LastInvalidLoginAttemptTime.Value.ToShortDateString(), user.LastInvalidLoginAttemptTime.Value.ToShortTimeString());
            vm.Locked = user.Locked;
            vm.Id = user.Id;
            vm.UserName = user.UserName;
            vm.Roles = new List<ApplicationRole>();
            foreach (ApplicationUserRole role in user.Roles)
            {
                foreach (ApplicationRole applicationRole in roles)
                {
                    if (applicationRole.Id == role.RoleId)
                    {
                        ApplicationRole userRole = new ApplicationRole();
                        userRole.Id = applicationRole.Id;
                        userRole.Name = applicationRole.Name;
                        userRole.Description = applicationRole.Description;
                        vm.Roles.Add(userRole);

                        if (vm.UserRoles == null || vm.UserRoles == string.Empty)
                        {
                            vm.UserRoles = userRole.Name;
                        }
                        else
                        {
                            vm.UserRoles += string.Format(",{0}", userRole.Name);
                        }
                    }
                }
            }
            return vm;
        }

        // Updates a user asynchronously    //,    
        [HttpPost, Route("api/UpdateUserAsync")]
        public async Task<string> UpdateUserAsync(string username, string firstname, string lastname, string position, string telephone, int? extension, string employmentDate, string registrationDate, string locked)
        {
            string message = string.Empty;
            try
            {
                ApplicationUser userToUpdate = userManager.FindByEmail(username);                                             
                userToUpdate.FirstName = firstname;
                userToUpdate.LastName = lastname;
                userToUpdate.Position = position;
                userToUpdate.DirectDial = telephone;
                userToUpdate.Extension = extension;
                userToUpdate.EmploymentDate = CommonBehaviour.ConvertStrToDateTime(employmentDate);
                userToUpdate.RegistrationDate = CommonBehaviour.ConvertStrToDateTime(registrationDate);                  
                userToUpdate.Locked = locked == "Yes" ? true:false;                               
                IdentityResult result = await userManager.UpdateAsync(userToUpdate);                  
                if (result != null && result.Succeeded == true)
                {                   
                    message = "Success - user update successful";
                }
                else
                {
                    string errors = string.Empty;
                    foreach (string error in result.Errors)
                    {
                        errors += error + " ";
                    }
                    message = string.Format("Error : {0}", errors);
                }
            }
            catch (Exception)
            {
                message = "Error - user update unsuccessful - Contact IT support";
            }
            return message;
        }
                        

        // Updates a user asynchronously    //,    
        [HttpPost, Route("api/LockUnlockUserAsync")]
        public async Task<string> LockUnlockUserAsync(string username, string lockUnlock)
        {
            string message = string.Empty;
            try
            {
                ApplicationUser userToUpdate = userManager.FindByEmail(username);
                userToUpdate.Locked = lockUnlock == "lock" ? true : false;
                IdentityResult result = await userManager.UpdateAsync(userToUpdate);
                if (result != null && result.Succeeded == true)
                {
                    message = string.Format("Success - user update ({0}) successful", lockUnlock);
                }
                else
                {
                    string errors = string.Empty;
                    foreach (string error in result.Errors)
                    {
                        errors += error + " ";
                    }
                    message = string.Format("Error : {0}", errors);
                }
            }
            catch (Exception)
            {
                message = "Error - user update unsuccessful - Contact IT support";
            }
            return message;
        }
        


        // Creates a user asynchronously    //,    
        [HttpPost, Route("api/CreateUserAsync")]
        public async Task<string> CreateUserAsync(string username, string firstname, string lastname, string position, string telephone, int? extension, string employmentDate, string registrationDate)
        {
            string message = string.Empty;

            try
            {                   
                ApplicationUser newUser = new ApplicationUser()
                {                    
                    UserName = username,
                    Email = username,
                    EmailConfirmed = true,
                    Title = Enums.Titles.Mr,
                    FirstName = firstname,
                    LastName = lastname,
                    Position = position,
                    DirectDial = telephone,
                    Extension = extension,
                    EmploymentDate = CommonBehaviour.ConvertStrToDateTime(employmentDate),
                    RegistrationDate = CommonBehaviour.ConvertStrToDateTime(registrationDate),
                    LastLogInTime = null,
                    LastLogoutTime = null,
                    IsLoggedIn = false,
                    InvalidLoginAttemptCount = 0,
                    LastInvalidLoginAttemptTime = null,
                    Locked = false
                };
                
                string temporaryPassword = CommonBehaviour.GenerateTempPassword();
                IdentityResult result = await userManager.CreateAsync(newUser, CommonBehaviour.GenerateTempPassword());                 // user creation 
                if (result != null && result.Succeeded == true)
                {
                    SendUserCreationEmail(username, temporaryPassword);
                    message = "Success - user creation successful";
                }
                else
                {                    
                    string errors = string.Empty;
                    foreach (string error in result.Errors)
                    {
                        errors += error + " ";
                    }
                    message = string.Format("Error : {0}", errors);
                }
            }
            catch (Exception)
            {
                message = "Error - user creation unsuccessful";
            }
            return message;
        }

        // A helper method to email and inform new user that the user is created and could be logged in with temporary password
        private bool SendUserCreationEmail(string username, string temporaryPassword)
        {
            bool isUserEmailed = false;
            try
            {
                string message = string.Format("A new user created with \nUsername : {0}\nTemporary password : {1}\n\nPlease login to the system - {2}", username, temporaryPassword, ConfigurationManager.AppSettings["WwwUrl"]);
                Emailer.InformViaEmail("BCMY Stock Management System - User created", message, null, null, username);
                isUserEmailed = true;
            }
            catch (Exception)
            {
                isUserEmailed = false;
            }
            return isUserEmailed;
        }

        // used to assign the roles to the created user
        [HttpPost, Route("api/AssignRolesAsync")]
        public async Task<string> AssignRolesAsync(string username, string rolescsv)
        {
            string message = string.Empty;
            try
            {
                string[] roles = rolescsv.Split(',');                
                ApplicationUser user = await userManager.FindByNameAsync(username);
                List<string> userAssignedRoles = new List<string>();
                foreach (ApplicationUserRole aur in user.Roles)
                {                    
                    ApplicationRole applicationRole = await roleManager.FindByIdAsync(aur.RoleId);
                    userAssignedRoles.Add(applicationRole.Name);
                }
                IdentityResult result = await userManager.RemoveFromRolesAsync(user.Id, userAssignedRoles.ToArray());
                result = await userManager.UpdateAsync(user);
                result = await userManager.AddToRolesAsync(user.Id, roles);
                result = await userManager.UpdateAsync(user);
                message = "Success - Role assignment successful";
            }
            catch (Exception ex)
            {
                message = string.Format("Error - Role assignment to user {0} unsuccessful, role names {1}", username, rolescsv);
                throw ex;
            }
            return message;
        }

        // used to search users 
        [HttpPost, Route("api/SearchUsersSQL")]
        public IList<ApplicationUserViewModel> SearchUsersSQL(string username, string userRolesCsv, string firstname, string lastname, string position, string employmentDate, string registrationDate, string lastLoginDateTime, string lastInvalidLoginDateTime) 
        {
            IList<ApplicationUserViewModel> userVms = null;
            try
            {
                //username = username == null ? DBNull.Value.ToString() : username;
                // call stored procedure via repository
                var result = aspNetUsersRepository.SQLQuery<AspNetUser>("SP_SearchAspNetUsers @username, @userRolesCsv, @firstname, @lastname, @position, @employmentDate, @registrationDate, @lastLoginDateTime, @lastInvalidLoginDateTime",
                    new SqlParameter("username", SqlDbType.NVarChar) { Value = username == null ? (object)DBNull.Value : username },
                    new SqlParameter("userRolesCsv", SqlDbType.NVarChar) { Value = userRolesCsv == null ? (object)DBNull.Value : userRolesCsv },
                    new SqlParameter("firstname", SqlDbType.NVarChar) { Value = firstname == null ? (object)DBNull.Value : firstname },
                    new SqlParameter("lastname", SqlDbType.NVarChar) { Value = lastname == null ? (object)DBNull.Value : lastname },
                    new SqlParameter("position", SqlDbType.NVarChar) { Value = position == null ? (object)DBNull.Value : position },
                    new SqlParameter("employmentDate", SqlDbType.DateTime) { Value = employmentDate == null ? (object)DBNull.Value : employmentDate },
                    new SqlParameter("registrationDate", SqlDbType.DateTime) { Value = registrationDate == null ? (object)DBNull.Value : registrationDate },
                    new SqlParameter("lastLoginDateTime", SqlDbType.DateTime) { Value = lastLoginDateTime == null ? (object)DBNull.Value : lastLoginDateTime },
                    new SqlParameter("lastInvalidLoginDateTime", SqlDbType.DateTime) { Value = lastInvalidLoginDateTime == null ? (object)DBNull.Value : lastInvalidLoginDateTime });
                IList<AspNetUser> usersSearched = result.ToList<AspNetUser>();
                IList<ApplicationUser> users = ConvertAspNetUsersToApplicationUsers(usersSearched);
                IList<ApplicationRole> roles = roleManager.Roles.ToList<ApplicationRole>();
                userVms = ConvertToApplicationUserViewModels(roles, users);
            }
            catch (Exception ex)
            {
                userVms = null;
            }
            return userVms;
        }

        // converts a list of AspNetUsers to a list of ApplicationUsers
        private IList<ApplicationUser> ConvertAspNetUsersToApplicationUsers(IList<AspNetUser> usersSearched)
        {
            IList<ApplicationUser> applicationUsers = new List<ApplicationUser>();
            IQueryable<ApplicationUser> users = userManager.Users;  // all the users          
            try
            {
                foreach (AspNetUser aspNetUser in usersSearched)
                {
                    foreach (var applicationUser in users)
                    {
                        if (aspNetUser.Id == applicationUser.Id)
                        {
                            applicationUsers.Add(applicationUser);  // user found
                        }
                    }
                }
            }
            catch (Exception exc)
            {
                applicationUsers = null;
                throw exc;
            }
            return applicationUsers;
        } 


        // used to search the users
        [HttpPost, Route("api/SearchUsers")]
        public IList<ApplicationUserViewModel> SearchUsers(string username, string userRolesCsv, string firstname, string lastname, string position, string employmentDate, string registrationDate, string lastLoginDateTime, string lastInvalidLoginDateTime)
        {
            IList<ApplicationUserViewModel> userVms = new List<ApplicationUserViewModel>();
            try
            {                
                // filter roles
                IQueryable<ApplicationRole> roles = roleManager.Roles;
                //IList<ApplicationRole> rolesToSearch = new List<ApplicationRole>();
                //string [] searchRoles = userRolesCsv.Split(',');
                //foreach (string sr in searchRoles)
                //{
                //    foreach (ApplicationRole role in roles)
                //    {
                //        if ()
                //    }
                //}
                
                // search users based on search criteria
                IList<ApplicationUser> users = userManager.Users.ToList<ApplicationUser>();
                //users = SearchUsersHelper(users, roles, userRolesCsv, username, firstname, lastname, position, employmentDate, registrationDate, lastLoginDateTime, lastInvalidLoginDateTime);
                  
                // create the view model
                foreach (ApplicationUser user in users)
                {
                    ApplicationUserViewModel vm = new ApplicationUserViewModel();
                    vm.Title = user.Title;
                    vm.FirstName = user.FirstName;
                    vm.LastName = user.LastName;
                    vm.Position = user.Position;
                    vm.DirectDial = (user.DirectDial == null || user.DirectDial == "") ? "-" : user.DirectDial;
                    vm.Extension = (user.Extension == null || user.Extension.ToString() == "") ? "-" : user.Extension.ToString();
                    vm.EmploymentDate = (user.EmploymentDate == null) ? "never" : user.EmploymentDate.Value.ToShortDateString();
                    vm.RegistrationDate = (user.RegistrationDate == null) ? "never" : string.Format("{0} - {1}", user.RegistrationDate.Value.ToShortDateString(), user.RegistrationDate.Value.ToShortTimeString());
                    vm.LastLogInTime = (user.LastLogInTime == null) ? "never" : string.Format("{0} - {1}", user.LastLogInTime.Value.ToShortDateString(), user.LastLogInTime.Value.ToShortTimeString());
                    vm.LastLogoutTime = (user.LastLogoutTime == null) ? "never" : string.Format("{0} - {1}", user.LastLogoutTime.Value.ToShortDateString(), user.LastLogoutTime.Value.ToShortTimeString());
                    vm.IsLoggedIn = user.IsLoggedIn;
                    vm.InvalidLoginAttemptCount = user.InvalidLoginAttemptCount;
                    vm.LastInvalidLoginAttemptTime = (user.LastInvalidLoginAttemptTime == null) ? "never" : string.Format("{0} - {1}", user.LastInvalidLoginAttemptTime.Value.ToShortDateString(), user.LastInvalidLoginAttemptTime.Value.ToShortTimeString());
                    vm.Locked = user.Locked;
                    vm.Id = user.Id;
                    vm.UserName = user.UserName;
                    vm.Roles = new List<ApplicationRole>();
                    foreach (ApplicationUserRole role in user.Roles)
                    {
                        foreach (ApplicationRole applicationRole in roles)
                        {
                            if (applicationRole.Id == role.RoleId)
                            {
                                ApplicationRole userRole = new ApplicationRole();
                                userRole.Id = applicationRole.Id;
                                userRole.Name = applicationRole.Name;
                                userRole.Description = applicationRole.Description;
                                vm.Roles.Add(userRole);

                                if (vm.UserRoles == null || vm.UserRoles == string.Empty)
                                {
                                    vm.UserRoles = userRole.Name;
                                }
                                else
                                {
                                    vm.UserRoles += string.Format(",{0}", userRole.Name);
                                }
                            }
                        }
                    }
                    userVms.Add(vm);
                }
            }
            catch (Exception)
            {
                userVms = null;
            }
            return userVms;
        }

        // used to encrypt a string
        //[HttpGet, Route("api/EncryptValue")]
        //[Authorize]
        [HttpPost, Route("api/EncryptValue")]        
        public string Encrypt(string value)
        {
            try
            {  
                //byte[] key = { 251, 9, 67, 117, 237, 158, 138, 150, 255, 97, 103, 128, 183, 65, 76, 161, 7, 79, 244, 225, 146, 180, 51, 123, 118, 167, 45, 10, 184, 181, 202, 190 };
                //byte[] vector = { 214, 11, 221, 108, 210, 71, 14, 15, 151, 57, 241, 174, 177, 142, 115, 137 };

                //using (var rijndaelHelper = new RijndaelHelper(key, vector))
                //{
                //    var encrypt = rijndaelHelper.Encrypt(value);
                //    string encryptedValue = ByteArryStrConvertor.GetString(encrypt);
                //    return encryptedValue;
                //}
                string encrypt = CustomEncryptDecrypt.CustomEncrypt(value);
                return encrypt;
            }
            catch (Exception)
            {
                return null;
            }
        }

        // used to decrypt a string
        //[Authorize]
        //[HttpGet, Route("api/DecryptValue")]
        [HttpPost, Route("api/DecryptValue")]        
        public string Decrypt(string value)
        {
            try
            {                
                string decryptedValue = CustomEncryptDecrypt.CustomDecrypt(value);
                return decryptedValue;
            }
            catch (Exception)
            {
                return null;
            }
        }

        // A helper method to do the user search 
        private IList<ApplicationUser> SearchUsersHelper(IQueryable<ApplicationUser> users, IQueryable<ApplicationRole> roles, string userRolesCsv, string username, string firstname, string lastname, string position, string employmentDate, string registrationDate, string lastLoginDateTime, string lastInvalidLoginDateTime)
        {
            try
            {
                IList<ApplicationUser> searchedUsers = new List<ApplicationUser>();
                if (GeneralValidator.IsStringNotEmpty(username))
                {
                    users = users.Where(u => u.UserName.Contains(username));
                }
                if (GeneralValidator.IsStringNotEmpty(firstname))
                {
                    users = users.Where(u => u.FirstName.Contains(firstname));
                }
                if (GeneralValidator.IsStringNotEmpty(lastname))
                {
                    users = users.Where(u => u.LastName.Contains(lastname));
                }
                if (GeneralValidator.IsStringNotEmpty(position))
                {
                    users = users.Where(u => u.Position.Contains(position));
                }
                if (employmentDate != null)
                {
                    users = users.Where(u => u.EmploymentDate == CommonBehaviour.ConvertStrToDateTime(employmentDate));
                }
                if (registrationDate != null)
                {
                    users = users.Where(u => u.RegistrationDate == CommonBehaviour.ConvertStrToDateTime(registrationDate));
                }
                if (lastLoginDateTime != null)
                {
                    users = users.Where(u => u.LastLogInTime == CommonBehaviour.ConvertStrToDateTime(lastLoginDateTime));
                }
                if (lastInvalidLoginDateTime != null)
                {
                    users = users.Where(u => u.LastLogInTime == CommonBehaviour.ConvertStrToDateTime(lastInvalidLoginDateTime));
                }

                if (users.Count() > 0)
                {
                    // filter roles
                    string[] searchRoles = userRolesCsv.Split(',');
                    IList<ApplicationRole> searchAppRoles = new List<ApplicationRole>();
                    foreach (ApplicationRole role in roles)
                    {                        
                        foreach (string searchRole in searchRoles)
                        {
                            if (searchRole == role.Name)
                            {
                                searchAppRoles.Add(role);
                            }
                        }
                    }

                    // filter users based on searched roles
                    foreach (ApplicationUser user in users)
                    {
                        //UserRoleLoop:
                        foreach (ApplicationUserRole userRole in user.Roles)
                        {
                            foreach (ApplicationRole searchRole in searchAppRoles)
                            {
                                if (userRole.RoleId == searchRole.Id)
                                {
                                    searchedUsers.Add(user);
                                    //goto UserRoleLoop;
                                }
                            }
                        }                        
                    }
                }
                return searchedUsers;
            }
            catch (Exception ex)
            {                
                throw ex;
            }           
        }

    }
}
