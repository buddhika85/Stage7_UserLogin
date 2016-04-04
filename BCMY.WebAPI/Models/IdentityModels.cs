using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Data.Entity;
using System.Web;
using System.Collections.Generic;

namespace BCMY.WebAPI.Models
{
    // Ref - http://johnatten.com/2014/10/26/asp-net-web-api-and-identity-2-0-customizing-identity-models-and-implementing-role-based-authorization/

    // You will not likely need to customize there, but it is necessary/easier to create our own 
    // project-specific implementations, so here they are:
    public class ApplicationUserLogin : IdentityUserLogin<string> { }
    public class ApplicationUserClaim : IdentityUserClaim<string> { }
    public class ApplicationUserRole : IdentityUserRole<string> { }

    // a view model to represent application users with their roles
    public class ApplicationUserViewModel
    {        
        public Util.Enums.Titles Title { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Position { get; set; }
        public string DirectDial { get; set; }
        public string Extension { get; set; }
        public string EmploymentDate { get; set; }       // start date
        public string RegistrationDate { get; set; }
        public string LastLogInTime { get; set; }
        public string LastLogoutTime { get; set; }
        public bool IsLoggedIn { get; set; }
        public int InvalidLoginAttemptCount { get; set; }
        public string LastInvalidLoginAttemptTime { get; set; }
        public bool Locked { get; set; }
        public string Id { get; set; }
        public string UserName { get; set; }
        public List<ApplicationRole> Roles { get; set; }       // roles assigned to the user
        public string UserRoles { get; set; }
    }

    // Must be expressed in terms of our custom Role and other types:
    public class ApplicationUser
        : IdentityUser<string, ApplicationUserLogin,
        ApplicationUserRole, ApplicationUserClaim>
    {
        public Util.Enums.Titles Title { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Position { get; set; }
        public string DirectDial { get; set; }
        public int? Extension { get; set; }
        public DateTime? EmploymentDate { get; set; }       // start date
        public DateTime? RegistrationDate { get; set; }
        public DateTime? LastLogInTime { get; set; }
        public DateTime? LastLogoutTime { get; set; }
        public bool IsLoggedIn { get; set; }
        public int InvalidLoginAttemptCount { get; set; }
        public DateTime? LastInvalidLoginAttemptTime { get; set; }
        public bool Locked { get; set; }

        public ApplicationUser()
        {
            this.Id = Guid.NewGuid().ToString();
        }

        // ** Add authenticationtype as method parameter:
        public async Task<ClaimsIdentity>
            GenerateUserIdentityAsync(ApplicationUserManager manager, string authenticationType)
        {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            ClaimsIdentity  userIdentity = await manager.CreateIdentityAsync(this, authenticationType);

            // store login custom info
            StoreCustomInfo(userIdentity);

            // Add custom user claims here
            return userIdentity;
        }

        /// <summary>
        /// used to store 
        /// </summary>
        private void StoreCustomInfo(ClaimsIdentity userIdentity)
        {
            try
            {
                if (userIdentity != null && userIdentity.IsAuthenticated)
                {                    
                    string username = userIdentity.GetUserName();
                    ApplicationUserManager userManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
                    ApplicationUser user = userManager.FindByName(username);
                    if (user != null)
                    {
                        user.IsLoggedIn = true;
                        user.Locked = false;
                        user.LastLogInTime = DateTime.Now;
                        user.InvalidLoginAttemptCount = 0;  // clear out invalid user login attempts, as this login attempt is successful
                        userManager.Update(user);                        
                    }
                    else
                    {
                        throw new Exception() { Source = string.Format("Error - user {0} not found", username) };
                    }
                }
            }
            catch (Exception ex)
            {                
                throw;
            }
        } 

    }


    // Must be expressed in terms of our custom UserRole:
    public class ApplicationRole : IdentityRole<string, ApplicationUserRole>
    {   
        public ApplicationRole()
        {
            this.Id = Guid.NewGuid().ToString();
        }

        public ApplicationRole(string name)
            : this()
        {
            this.Name = name;
        }

        public string Description { get; set; }        
    }


    // Must be expressed in terms of our custom types:
    public class ApplicationDbContext
        : IdentityDbContext<ApplicationUser, ApplicationRole,
        string, ApplicationUserLogin, ApplicationUserRole, ApplicationUserClaim>
    {
        public ApplicationDbContext()
            : base("DefaultConnection")
        {            
        }

        static ApplicationDbContext()
        {
            Database.SetInitializer<ApplicationDbContext>(new ApplicationDbInitializer());
        }

        public static ApplicationDbContext Create()
        {            
            return new ApplicationDbContext();
        }

        // Add additional items here as needed
    }

    // Most likely won't need to customize these either, but they were needed because we implemented
    // custom versions of all the other types:
    public class ApplicationUserStore
        : UserStore<ApplicationUser, ApplicationRole, string,
            ApplicationUserLogin, ApplicationUserRole,
            ApplicationUserClaim>, IUserStore<ApplicationUser, string>,
        IDisposable
    {
        public ApplicationUserStore()
            : this(new IdentityDbContext())
        {
            base.DisposeContext = true;
        }

        public ApplicationUserStore(DbContext context)
            : base(context)
        {
        }
    }


    public class ApplicationRoleStore
    : RoleStore<ApplicationRole, string, ApplicationUserRole>,
    IQueryableRoleStore<ApplicationRole, string>,
    IRoleStore<ApplicationRole, string>, IDisposable
    {
        public ApplicationRoleStore()
            : base(new IdentityDbContext())
        {
            base.DisposeContext = true;
        }

        public ApplicationRoleStore(DbContext context)
            : base(context)
        {
        }
    }
}