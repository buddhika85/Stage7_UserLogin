using BCMY.WebAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

using Microsoft.AspNet.Identity.Owin;           // to get OWIN context

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
    }
}
