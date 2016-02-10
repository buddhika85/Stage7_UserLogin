using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using BCMY.WebAPI.Models;
using System.Data.Entity;
using System.Web;
using System.Collections.Generic;
using BCMY.WebAPI.Util;
using System;
using System.Linq;

namespace BCMY.WebAPI
{
    public class ApplicationUserManager
        : UserManager<ApplicationUser, string>
    {
        public ApplicationUserManager(IUserStore<ApplicationUser, string> store)
            : base(store)
        {
        }

        public static ApplicationUserManager Create(
            IdentityFactoryOptions<ApplicationUserManager> options,
            IOwinContext context)
        {
            var manager = new ApplicationUserManager(
                new UserStore<ApplicationUser, ApplicationRole, string,
                    ApplicationUserLogin, ApplicationUserRole,
                    ApplicationUserClaim>(context.Get<ApplicationDbContext>()));

            // Configure validation logic for usernames
            manager.UserValidator = new UserValidator<ApplicationUser>(manager)
            {
                AllowOnlyAlphanumericUserNames = false,
                RequireUniqueEmail = true
            };
            // Configure validation logic for passwords
            manager.PasswordValidator = new PasswordValidator
            {
                RequiredLength = 6,
                RequireNonLetterOrDigit = true,
                RequireDigit = true,
                RequireLowercase = true,
                RequireUppercase = true,
            };            
            var dataProtectionProvider = options.DataProtectionProvider;
            if (dataProtectionProvider != null)
            {
                manager.UserTokenProvider =
                    new DataProtectorTokenProvider<ApplicationUser>(
                        dataProtectionProvider.Create("ASP.NET Identity"));
            }
            
            return manager;
        }
    }


    public class ApplicationRoleManager : RoleManager<ApplicationRole>
    {
        public ApplicationRoleManager(IRoleStore<ApplicationRole, string> roleStore)
            : base(roleStore)
        {
        }

        public static ApplicationRoleManager Create(
            IdentityFactoryOptions<ApplicationRoleManager> options,
            IOwinContext context)
        {
            return new ApplicationRoleManager(
                new ApplicationRoleStore(context.Get<ApplicationDbContext>()));
        }
    }


    // This is useful if you do not want to tear down the database each time you run the application.
    // public class ApplicationDbInitializer : DropCreateDatabaseAlways<ApplicationDbContext>
    // This example shows you how to create a new database if the Model changes
    public class ApplicationDbInitializer
        : DropCreateDatabaseIfModelChanges<ApplicationDbContext>
    {
        static ApplicationUserManager userManager = null;
        static ApplicationRoleManager roleManager = null;
                

        protected override void Seed(ApplicationDbContext context)
        {
            userManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
            roleManager = HttpContext.Current.GetOwinContext().Get<ApplicationRoleManager>();

            InitializeIdentityForEF(context);
            base.Seed(context);
        }

        //Create User=Admin@Admin.com with password=Admin@123456 in the Admin role        
        public static void InitializeIdentityForEF(ApplicationDbContext db)
        {
            try
            {               
                AddInitialRoles();
                AddInitialUsers();
                AssignRolesToUsers();
            }
            catch (System.Exception)
            {                
                throw;
            }
        }

        /// <summary>
        /// Used to assign initial roles to initial users
        /// </summary>
        public static void AssignRolesToUsers()
        {
            try
            {                     
                IList<ApplicationUser> users = userManager.Users.ToList<ApplicationUser>();
                foreach (ApplicationUser item in users)
                {
                    if (item.UserName.Equals("simon@bcmy.co.uk") || item.UserName.Equals("jeremy@bcmy.co.uk"))
                    {
                        userManager.AddToRole(item.Id, "Director");
                    }
                    else {
                        userManager.AddToRole(item.Id, "Executive");
                    }
                }
            }
            catch (Exception)
            {                
                throw;
            }
        }

        /// <summary>
        /// Used to populate database with initial users
        /// </summary>
        public static void AddInitialUsers()
        {
            try
            {
                IList<ApplicationUser> users = new List<ApplicationUser>() { 
                    new ApplicationUser() {
                        UserName = "simon@bcmy.co.uk",
                        Email = "simon@bcmy.co.uk",
                        
                        EmailConfirmed = true,
                        Title = Enums.Titles.Mr,
                        FirstName = "Simon",
                        LastName = "Gilchrist",
                        Position = "Director",
                        DirectDial = null,
                        Extension = null,
                        EmploymentDate = new DateTime(2005, 04, 22),
                        RegistrationDate = DateTime.Now,
                        LastLogInTime = null,
                        LastLogoutTime = null,
                        IsLoggedIn = false,
                        InvalidLoginAttemptCount = 0,
                        LastInvalidLoginAttemptTime = null,
                        Locked = false
                    },
                    new ApplicationUser() {
                        UserName = "jeremy@bcmy.co.uk",
                        Email = "jeremy@bcmy.co.uk",
                        EmailConfirmed = true,
                        Title = Enums.Titles.Mr,
                        FirstName = "Jeremy",
                        LastName = "Gilchrist",
                        Position = "Director",
                        DirectDial = null,
                        Extension = null,
                        EmploymentDate = new DateTime(2005, 04, 22),
                        RegistrationDate = DateTime.Now,
                        LastLogInTime = null,
                        LastLogoutTime = null,
                        IsLoggedIn = false,
                        InvalidLoginAttemptCount = 0,
                        LastInvalidLoginAttemptTime = null,
                        Locked = false
                    },
                    new ApplicationUser() {
                        UserName = "buddhika@bcmy.co.uk",
                        Email = "buddhika@bcmy.co.uk",
                        EmailConfirmed = true,
                        Title = Enums.Titles.Mr,
                        FirstName = "Buddhika",
                        LastName = "Gunasekera",
                        Position = "KTP-Associate",
                        DirectDial = null,
                        Extension = null,
                        EmploymentDate = new DateTime(2015, 04, 22),
                        RegistrationDate = DateTime.Now,
                        LastLogInTime = null,
                        LastLogoutTime = null,
                        IsLoggedIn = false,
                        InvalidLoginAttemptCount = 0,
                        LastInvalidLoginAttemptTime = null,
                        Locked = false
                    }
                };
                InsertUsers(userManager, users);
            }
            catch (Exception)
            {                
                throw;
            }
        }
        
        /// <summary>
        /// Used to populate database with initial roles
        /// </summary>
        public static void InsertUsers(ApplicationUserManager userManager, IList<ApplicationUser> users)
        {
            foreach (ApplicationUser item in users)
            {
                ApplicationUser user = userManager.FindByName(item.UserName);
                if (user == null)
                {                   
                    userManager.Create(item, "Test123$");
                    userManager.SetLockoutEnabled(item.Id, false);
                }
            }            
        }
        
        /// <summary>
        /// Used to populate database with initial roles
        /// </summary>
        public static void AddInitialRoles()
        {
            try
            {
                // role info list
                IList<ApplicationRole> roles = new List<ApplicationRole>() { 
                    new ApplicationRole() {
                       Name = "Director",
                       Description = "Highest Privilage User Role - Level 1"
                    },
                    new ApplicationRole() {
                       Name = "Management",
                       Description = "Second Highest Privilage User Role - Level 2"
                    },
                    new ApplicationRole() {
                       Name = "Executive",
                       Description = "Third Highest Privilage User Role - Level 3"
                    },
                    new ApplicationRole() {
                       Name = "Support",
                       Description = "Fourth Privilage User Role - Level 4"
                    }
                };

                InsertRoles(roleManager, roles);

            }
            catch (System.Exception)
            {                
                throw;
            }
        }

        /// <summary>
        /// A helper to insert a role at a time
        /// </summary>
        public static void InsertRoles(ApplicationRoleManager roleManager, IList<ApplicationRole> roles)
        {
            foreach (ApplicationRole item in roles)
            {
                ApplicationRole role = roleManager.FindByName(item.Name);
                if (role == null)
                {
                    role = new ApplicationRole(item.Name);
                    role.Description = item.Description;
                    roleManager.Create(role);
                }
            }            
        }


    }
}
