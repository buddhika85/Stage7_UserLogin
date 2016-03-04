using BCMY.WebAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

using Microsoft.AspNet.Identity.Owin;
using System.Threading.Tasks;           // to get OWIN context

namespace BCMY.WebAPI.Controllers.admin
{
    /// <summary>
    /// Used to expose chart related data
    /// </summary>
    [EnableCors(origins: "https://localhost:44301", headers: "*", methods: "*")]
    //[Authorize]
    public class RoleController : ApiController
    {
        ApplicationRoleManager roleManager = null;

        public RoleController ()
	    {            
            roleManager = HttpContext.Current.GetOwinContext().Get<ApplicationRoleManager>();           
	    }

        // used to retreive all the user roles
        //[Authorize(Roles = "Director")]
        public IQueryable<ApplicationRole> Get()
        {
            IQueryable<ApplicationRole> roles = null;
            try
            {
                roles = roleManager.Roles;
            }
            catch (Exception)
            {
                roles = null;
            }
            return roles;
        }

        // used to create a user role
        //[Authorize(Roles = "Director")]
        [HttpPost, Route("api/CreateRoleAsync")]
        public async Task<string> CreateRoleAsync(string roleName, string desc)
        {
            string message = string.Empty;
            try
            {
                bool roleExists = await roleManager.RoleExistsAsync(roleName);

                if (!roleExists)
                {
                    ApplicationRole role = new ApplicationRole(roleName);
                    role.Description = desc;
                    await roleManager.CreateAsync(role);
                    message = string.Format("Success : {0} role created successfuly", roleName);
                }
                else
                {
                    message = string.Format("Error : Role already exists with the same name - {0}", roleName);
                }
            }
            catch (Exception ex)
            {
                message = string.Format("Error : Exception occured at role creation {0}", ex.Message);
            }
            return message;
        }

        // used to edit a user role
        //[Authorize(Roles = "Director")]
        [HttpPost, Route("api/EditRoleAsync")]
        public async Task<string> EditRoleAsync(string roleName, string desc)
        {
            string message = string.Empty;
            try
            {
                ApplicationRole role = await roleManager.FindByNameAsync(roleName);

                if (role != null)
                {                    
                    role.Description = desc;
                    await roleManager.UpdateAsync(role);
                    message = string.Format("Success : {0} role updated successfuly", roleName);
                }
                else
                {
                    message = string.Format("Error : Role with such name - {0} does not exist", roleName);
                }
            }
            catch (Exception ex)
            {
                message = string.Format("Error : Exception occured at updating role {0}", ex.Message);
            }
            return message;
        }

        // used to delete a user role
        //[Authorize(Roles = "Director")]
        [HttpPost, Route("api/DeleteRoleAsync")]
        public async Task<string> DeleteRoleAsync(string roleName)
        {
            string message = string.Empty;
            try
            {
                ApplicationRole role = await roleManager.FindByNameAsync(roleName);                

                if (role != null)
                {
                    // check whether the role is assigned to any existing users
                    if (role.Users.Count == 0)
                    {
                        await roleManager.DeleteAsync(role);
                        message = string.Format("Success : {0} role deleted successfuly", roleName);
                    }
                    else
                    {
                        message = string.Format("Warning : Role {0} cannot be deleted, as the role is assigned to {1} users", roleName, role.Users.Count);
                    }                    
                }
                else
                {
                    message = string.Format("Error : Role with such name - {0} does not exist", roleName);
                }
            }
            catch (Exception ex)
            {
                message = string.Format("Error : Exception occured at deleting role {0}", ex.Message);
            }
            return message;
        }
    }
}
