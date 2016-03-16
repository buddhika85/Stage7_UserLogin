using DataAccess_EF.ViewModels;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace BCMY.WebAPI.Util
{
    /// <summary>
    /// Has methods on common behaviours that can used
    /// </summary>
    public static class CommonBehaviour
    {

        /// <summary>
        ///  Replace ^ character with a space
        /// </summary>
        public static string CleanContactFulName(string fulNameUnCleaned)
        {
            fulNameUnCleaned = StringReplace(fulNameUnCleaned, "^", " ");
            return StringReplace(fulNameUnCleaned, "_", " ");
        }

        /// <summary>
        /// string replace
        /// </summary>
        public static string StringReplace(string str, string oldReplace, string newReplace)
        {
            return str.Replace(oldReplace, newReplace);
        }

        /// <summary>
        /// converts a string dd/mm/yyyy format to DateTime POCO
        /// </summary>
        public static DateTime? ConvertStrToDateTime(string dateTime)
        {
            try
            {
                IFormatProvider culture = new System.Globalization.CultureInfo("fr-FR", true);  // dd/mm/yyyy
                DateTime? date = dateTime != null ? DateTime.Parse(dateTime, culture, System.Globalization.DateTimeStyles.AssumeLocal) : (DateTime?)null;
                return date;
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// Returns status string value by its Id value
        /// </summary>
        public static string GetCommonStatusString(int idVal)
        {
            IList<Status> statuses = GetStatusList();
            try
            {
                return statuses.Where(s => s.Id == idVal).SingleOrDefault().StatusStr;
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// Returns all the statuses as a list
        /// </summary>
        public static IList<Status> GetStatusList()
        {
            try
            {
                string allStatuses = ConfigurationManager.AppSettings["StockStatuses"];
                string statusValues = ConfigurationManager.AppSettings["StockStatusValues"];
                string[] allStatusArr = allStatuses.Split(',');
                string[] allStatuValuesArr = statusValues.Split(',');

                if (allStatusArr.Length == allStatuValuesArr.Length)
                {
                    IList<Status> statusList = new List<Status>();
                    for (int i = 0; i < allStatuValuesArr.Length; i++)
                    {
                        statusList.Add(new Status()
                        {
                            Id = int.Parse(allStatuValuesArr[i]),
                            StatusStr = allStatusArr[i]
                        });
                    }
                    return statusList;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception)
            {
                return null;
            }
        }

        ///// <summary>
        ///// Used to create a 3 D array
        ///// </summary>
        //public static object[][][] Create3DArray(IEnumerable<object> data)
        //{
        //    object[][][] threeDArray = null;
        //    try
        //    {

        //    }
        //    catch (Exception)
        //    {
        //        threeDArray = null;
        //    }
        //    return threeDArray;
        //}

        /// <summary>
        /// Fixes date and time null issue
        /// </summary>
        public static IList<OrderLineViewModel> FixDateTime(IList<OrderLineViewModel> orderLinesOfOrder)
        {
            foreach (OrderLineViewModel ol in orderLinesOfOrder)
            {
                ol.Date = ol.orderlineDateTime.Date.ToShortDateString();
                ol.Time = ol.orderlineDateTime.ToString("hh:mm tt");
            }
            return orderLinesOfOrder;
        }

        /// <summary>
        /// Generates a temporary password
        /// </summary>
        /// <returns></returns>
        public static string GenerateTempPassword()
        {
            string tempPassword = null;
            tempPassword = string.Format("{0}fH%1", System.Web.Security.Membership.GeneratePassword(6, 1));
            return tempPassword;
        }
    }
}