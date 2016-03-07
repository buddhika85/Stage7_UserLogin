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
                    vm.DirectDial = user.DirectDial;
                    vm.Extension = user.Extension;
                    vm.EmploymentDate = user.EmploymentDate;
                    vm.RegistrationDate = user.RegistrationDate;
                    vm.LastLogInTime = user.LastLogInTime;
                    vm.LastLogoutTime = user.LastLogoutTime;
                    vm.IsLoggedIn = user.IsLoggedIn;
                    vm.InvalidLoginAttemptCount = user.InvalidLoginAttemptCount;
                    vm.LastInvalidLoginAttemptTime = user.LastInvalidLoginAttemptTime;
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
                                vm.Roles.Add(applicationRole);
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



    }
}
