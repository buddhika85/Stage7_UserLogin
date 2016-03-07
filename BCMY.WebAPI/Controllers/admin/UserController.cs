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

namespace BCMY.WebAPI.Controllers.admin
{
    /// <summary>
    /// Used to expose chart related data
    /// </summary>
    [EnableCors(origins: "https://localhost:44301", headers: "*", methods: "*")]
    //[Authorize]
    public class UserController : ApiController
    {
        ApplicationRoleManager roleManager = null;
        ApplicationUserManager userManager = null;        

        public UserController()
        {
            roleManager = HttpContext.Current.GetOwinContext().Get<ApplicationRoleManager>();    
            userManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
        }


        // used to retreive all the user roles
        //[Authorize(Roles = "Director")]
        public IList<ApplicationUserViewModel> GetUsers()
        {
            IList<ApplicationUserViewModel> userVms = new List<ApplicationUserViewModel>();
            try
            {
                IQueryable<ApplicationRole> roles = roleManager.Roles;
                IQueryable<ApplicationUser> users = userManager.Users;
                
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
                                    vm.UserRoles += string.Format(", {0}", userRole.Name);
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
            //return userVms.OrderBy(u => u.EmploymentDate).
            //    ThenBy(u => u.RegistrationDate).
            //    ThenBy(u => u.LastName).
            //    ThenBy(u => u.FirstName).
            //    ToList<ApplicationUserViewModel>();
            return userVms;
        }



    }
}
