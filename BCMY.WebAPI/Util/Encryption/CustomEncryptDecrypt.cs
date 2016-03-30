using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BCMY.WebAPI.Util.Encryption
{
    public static class CustomEncryptDecrypt
    {

        public static string CustomEncrypt(string value)
        {
            try
            {
                char[] charArray = value.ToCharArray();
                Array.Reverse(charArray);
                value = new string(charArray);
                value = value.Replace('a', '"');
                return value;                
            }
            catch (Exception ex)
            {                
                throw ex;
            }
        }


        public static string CustomDecrypt(string value)
        {
            try
            {
                char[] charArray = value.ToCharArray();
                Array.Reverse(charArray);
                value = new string(charArray);
                value = value.Replace('"', 'a');
                return value;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }
}