using BCMY.WebAPI.Models.UnityDI;
using DataAccess_EF.EntityFramework;
using GenericRepository_UnitOfWork.GR;
using GenericRepository_UnitOfWork.UOW;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System.Threading.Tasks;
using BCMY.WebAPI.Models;
using System.Configuration;
using BCMY.WebAPI.Util;

namespace BCMY.WebAPI.Controllers.admin
{
    /// <summary>
    /// Used to expose user related data
    /// </summary>
    [EnableCors(origins: "https://localhost:44301", headers: "*", methods: "*")]
    public class ProfileController : ApiController
    {
        ApplicationRoleManager roleManager = null;
        ApplicationUserManager userManager = null;

        ObjectProvider objectProvider = null;
        UnitOfWork unitOfWork = null;
        GenericRepository<AspNetUser> aspNetUsersRepository = null;

        public ProfileController()
        {
            roleManager = HttpContext.Current.GetOwinContext().Get<ApplicationRoleManager>();    
            userManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();

            objectProvider = objectProvider == null ? new ObjectProvider() : objectProvider;
            unitOfWork = unitOfWork == null ? objectProvider.UnitOfWork : unitOfWork;
            aspNetUsersRepository = aspNetUsersRepository == null ? unitOfWork.AspNetUserRepository : aspNetUsersRepository;
        }

        [HttpPost, Route("api/EditProfileAsync")]
        public async Task<string> EditProfileAsync(string username, string firstname, string lastname, string telephone, int? extension)
        {
            string message = string.Empty;
            try
            {
                ApplicationUser userToUpdate = userManager.FindByEmail(username);
                userToUpdate.FirstName = firstname;
                userToUpdate.LastName = lastname;
                userToUpdate.DirectDial = telephone;
                userToUpdate.Extension = extension;

                IdentityResult result = await userManager.UpdateAsync(userToUpdate);
                if (result != null && result.Succeeded == true)
                {
                    message = "Success - user profile update successful";
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
                message = "Error - user profile update unsuccessful - Contact IT support";
            }
            return message;
        }


        [HttpPost, Route("api/ChangePasswordAsync")]
        public async Task<string> ChangePasswordAsync(string username, string currentPassword, string newPassword)
        {
            string message = string.Empty;
            try
            {
                ApplicationUser userToUpdate = userManager.FindByEmail(username);
                IdentityResult result = await userManager.ChangePasswordAsync(userToUpdate.Id, currentPassword, newPassword);                
                if (result != null && result.Succeeded == true)
                {
                    bool wasEmailed = SendPasswordChangeEmail(username, newPassword);
                    if (wasEmailed)
                    {
                        message = "Success - user password change successful and user notified via email";
                    }
                    else
                    {
                        message = string.Format("Error - user password change successful, but unable to send the notification email to {0}. Please contact IT-support", username);
                    }
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
                message = "Error - user password change unsuccessful - Contact IT support";
            }
            return message;
        }


        // A helper method to email and inform new user that the user is created and could be logged in with temporary password
        private bool SendPasswordChangeEmail(string username, string newPassword)
        {
            bool isUserEmailed = false;
            try
            {
                string message = string.Format("You have changed your password on BCMY Stock management system - {0} at {1} \nNew Password : {2}", ConfigurationManager.AppSettings["WwwUrl"], DateTime.Now, newPassword);
                Emailer.InformViaEmail("BCMY Stock Management System - Password Change", message, null, null, username);
                isUserEmailed = true;
            }
            catch (Exception)
            {
                isUserEmailed = false;
            }
            return isUserEmailed;
        }
    }
}
