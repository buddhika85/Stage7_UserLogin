using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Web;

namespace BCMY.WebAPI.Util
{
    /// <summary>
    /// A helper class to send emails
    /// </summary>
    public static class Emailer
    {
        /// <summary>
        /// method to send emails
        /// </summary>
        public static void InformViaEmail(string subject, string message, string source, string innerExcMessage, string receiverEmail)
        {
            try
            {
                string sender = ConfigurationManager.AppSettings["SenderEmail"];
                string senderPassword = ConfigurationManager.AppSettings["SenderEmailPassword"];
                if ((innerExcMessage == null && source == null) || (innerExcMessage == string.Empty && source == string.Empty))
                {
                    // information email
                    SendEmail(subject, message, sender, receiverEmail, senderPassword);
                }
                else
                {
                    // exception email - for the developer of the system
                    SendEmail(subject, message, source, innerExcMessage, sender, receiverEmail, senderPassword);
                }

            }
            catch (Exception exc)
            {
                //Logger.LogExceptions("Email Sending failed", exc);
                throw exc;
            }
        }


        /// <summary>
        /// Used to send an informative email
        /// </summary>
        private static void SendEmail(string subject, string message, string sender, string receiver, string senderPassword)
        {
            try
            {
                SmtpClient client = new SmtpClient();
                client.Port = int.Parse(ConfigurationManager.AppSettings["EmailClientPort"]);
                client.Host = ConfigurationManager.AppSettings["EmailClientHost"];
                client.EnableSsl = bool.Parse(ConfigurationManager.AppSettings["EnableEmailSsl"]);
                client.Timeout = int.Parse(ConfigurationManager.AppSettings["EmailTimeout"]);
                client.DeliveryMethod = SmtpDeliveryMethod.Network;
                client.UseDefaultCredentials = false;
                client.Credentials = new System.Net.NetworkCredential(sender, senderPassword);

                MailMessage mm = new MailMessage(sender, receiver, subject, message);
                mm.BodyEncoding = Encoding.UTF8;
                mm.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;

                client.Send(mm);

            }
            catch (Exception exc)
            {
                //Logger.LogExceptions(string.Format("Email Sending failed - {0}", DateTime.Now), exc);
                throw exc;
            }
        }




        /// <summary>
        /// Used to email about an exception
        /// </summary>
        private static void SendEmail(string subject, string message, string source, string innerExcMessage, string sender, string receiver, string senderPassword)
        {
            try
            {
                SmtpClient client = new SmtpClient();
                client.Port = int.Parse(ConfigurationManager.AppSettings["EmailClientPort"]);
                client.Host = ConfigurationManager.AppSettings["EmailClientHost"];
                client.EnableSsl = bool.Parse(ConfigurationManager.AppSettings["EnableEmailSsl"]);
                client.Timeout = int.Parse(ConfigurationManager.AppSettings["EmailTimeout"]);
                client.DeliveryMethod = SmtpDeliveryMethod.Network;
                client.UseDefaultCredentials = false;
                client.Credentials = new System.Net.NetworkCredential(sender, senderPassword);

                message = string.Format("Message - {0} <br />Source - {1} <br />Inner exception message - {2}<br />Please contact IT Support as the exchange rate calcuations are not accurate for the current day",
                    message, source, innerExcMessage);

                MailMessage mm = new MailMessage(sender, receiver, subject, message);
                mm.BodyEncoding = Encoding.UTF8;
                mm.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;

                client.Send(mm);

            }
            catch (Exception exc)
            {
                //Logger.LogExceptions(string.Format("Email Sending failed - {0}", DateTime.Now), exc);
                throw exc;
            }
        }

    }
}