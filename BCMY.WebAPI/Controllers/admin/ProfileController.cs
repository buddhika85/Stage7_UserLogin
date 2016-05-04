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

        [HttpPost, Route("api/GetPasswordResetTokenAsync")]
        public async Task<string> GetPasswordResetTokenAsync(string username)
        {
            string message = string.Empty;
            try
            {
                ApplicationUser userToUpdate = userManager.FindByEmail(username);
                if (userToUpdate != null)
                {                    
                    string resetPasswordToken = await userManager.GeneratePasswordResetTokenAsync(userToUpdate.Id);

                    if (resetPasswordToken != null && resetPasswordToken != string.Empty)
                    {
                        bool wasEmailed = SendPasswordResetInstructionsEmail(username, resetPasswordToken);
                        if (wasEmailed)
                        {
                            message = "Success - password reset instructions are notified via email";
                        }
                        else
                        {
                            message = string.Format("Error - Unable to send the password reset instructions email to {0}. Please contact IT-support", username);
                        }
                    }
                    else
                    {
                        message = "Error - user password reset unsuccessful. Token error. Please contact IT-support";
                    }
                }
                else
                {
                    // user not found 
                    message = "Error - user password reset unsuccessful";
                }
            }
            catch (Exception)
            {
                message = "Error - user password reset unsuccessful - Contact IT support";
            }
            return message;
        }

        [HttpPost, Route("api/ResetPasswordWithTokenAsync")]
        public async Task<string> ResetPasswordWithTokenAsync(string username, string token)
        {
            string message = string.Empty;
            try
            {
                ApplicationUser userToUpdate = userManager.FindByEmail(username);
                if (userToUpdate != null)
                {
                    string temporaryPassword = CommonBehaviour.GenerateTempPassword();
                    IdentityResult result = await userManager.ResetPasswordAsync(userToUpdate.Id, token.Trim(), temporaryPassword);
                    if (result != null && result.Succeeded == true)
                    {
                        bool wasEmailed = SendPasswordResetEmail(username, temporaryPassword);
                        if (wasEmailed)
                        {
                            message = "Success - user password reset successful and user notified via email";
                        }
                        else
                        {
                            message = string.Format("Error - user password reset successful, but unable to send the notification email to {0}. Please contact IT-support", username);
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
                else
                {
                    // user not found 
                    message = "Error - user password reset unsuccessful";
                }
            }
            catch (Exception)
            {
                message = "Error - user password reset unsuccessful - Contact IT support";
            }
            return message;
        }


        [HttpPost, Route("api/ResetPasswordAsync")]
        public async Task<string> ResetPasswordAsync(string username)
        {
            string message = string.Empty;
            try
            {
                ApplicationUser userToUpdate = userManager.FindByEmail(username);
                if (userToUpdate != null)
                {
                    string temporaryPassword = CommonBehaviour.GenerateTempPassword();
                    string resetPasswordToken = await userManager.GeneratePasswordResetTokenAsync(userToUpdate.Id);
                    IdentityResult result = await userManager.ResetPasswordAsync(userToUpdate.Id, resetPasswordToken, temporaryPassword);
                    if (result != null && result.Succeeded == true)
                    {
                        bool wasEmailed = SendPasswordResetEmail(username, temporaryPassword);
                        if (wasEmailed)
                        {
                            message = "Success - user password reset successful and user notified via email";
                        }
                        else
                        {
                            message = string.Format("Error - user password reset successful, but unable to send the notification email to {0}. Please contact IT-support", username);
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
                else
                {
                    // user not found 
                    message = "Error - user password reset unsuccessful";
                }
            }
            catch (Exception)
            {
                message = "Error - user password reset unsuccessful - Contact IT support";
            }
            return message;
        }

        // A helper method to email and inform user that the password reset instractions with password reset token and password reset link
        private bool SendPasswordResetInstructionsEmail(string username, string resetPasswordToken)
        {
            bool isUserEmailed = false;
            try
            {
                string message = string.Format("You have requested to reset your password on BCMY Stock management system - {0} at {1}\n\n\n\n Your password reset token : {2} \n\n\nPlease visit : {3} to proceed", ConfigurationManager.AppSettings["WwwUrl"], DateTime.Now, resetPasswordToken, ConfigurationManager.AppSettings["resetPasswordPage"] + "?user=" + username);
                Emailer.InformViaEmail("BCMY Stock Management System - Password Reset Instructions", message, null, null, username);
                isUserEmailed = true;
            }
            catch (Exception)
            {
                isUserEmailed = false;
            }
            return isUserEmailed;
        }

        // A helper method to email and inform user that the password reset is complete and temporary password can be used to login to the system
        private bool SendPasswordResetEmail(string username, string temporaryPassword)
        {
            bool isUserEmailed = false;
            try
            {
                string message = string.Format("You have reset your password on BCMY Stock management system - {0} at {1} \nTemporary Password : {2}", ConfigurationManager.AppSettings["WwwUrl"], DateTime.Now, temporaryPassword);
                Emailer.InformViaEmail("BCMY Stock Management System - Forgotten Password reset", message, null, null, username);
                isUserEmailed = true;
            }
            catch (Exception)
            {
                isUserEmailed = false;
            }
            return isUserEmailed;
        }


        // A helper method to email and inform user about the password change
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
