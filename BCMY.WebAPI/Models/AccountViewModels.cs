using System;
using System.Collections.Generic;

namespace BCMY.WebAPI.Models
{
    // Models returned by AccountController actions.

    public class ExternalLoginViewModel
    {
        public string Name { get; set; }

        public string Url { get; set; }

        public string State { get; set; }
    }

    public class ManageInfoViewModel
    {
        public string LocalLoginProvider { get; set; }

        public string Email { get; set; }

        public IEnumerable<UserLoginInfoViewModel> Logins { get; set; }

        public IEnumerable<ExternalLoginViewModel> ExternalLoginProviders { get; set; }
    }

    public class UserInfoViewModel
    {
       
        public bool HasRegistered { get; set; }
        public string LoginProvider { get; set; }
       
        public string Username { get; set; }
        public string Email { get; set; }
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
    }

    public class UserLoginInfoViewModel
    {
        public string LoginProvider { get; set; }

        public string ProviderKey { get; set; }
    }
}
