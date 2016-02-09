using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Console_AuthTokenTester
{
    class Program
    {
        // You will need to substitute your own host Url here:
        static string host =  "https://localhost:44302/"; //"http://localhost:61945/";

        static void Main(string[] args)
        {
            Console.WriteLine("Attempting to Log in with Director role user");

            // Get hold of a Dictionary representing the JSON in the response Body:
            var responseDictionary =
                GetResponseAsDictionary("simon@bcmy.ac.uk", "Test123$");
            DisplayTokenInfo(responseDictionary);

            responseDictionary =
                GetResponseAsDictionary("jeremy@bcmy.ac.uk", "Test123$");
            DisplayTokenInfo(responseDictionary);

            responseDictionary =
                GetResponseAsDictionary("buddhika@bcmy.ac.uk", "Test123$");
            DisplayTokenInfo(responseDictionary);

            Console.Read();
        }

        private static void DisplayTokenInfo(Dictionary<string, string> responseDictionary)
        {
            foreach (var kvp in responseDictionary)
            {
                Console.WriteLine("{0}: {1}", kvp.Key, kvp.Value);
            }
            Console.WriteLine();
        }


        static Dictionary<string, string> GetResponseAsDictionary(
            string userName, string password)
        {
            HttpClient client = new HttpClient();
            var pairs = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>( "grant_type", "password" ), 
                    new KeyValuePair<string, string>( "username", userName ), 
                    new KeyValuePair<string, string> ( "Password", password )
                };
            var content = new FormUrlEncodedContent(pairs);

            // Attempt to get a token from the token endpoint of the Web Api host:
            HttpResponseMessage response =
                client.PostAsync(host + "Token", content).Result;



            var result = response.Content.ReadAsStringAsync().Result;
            // De-Serialize into a dictionary and return:
            Dictionary<string, string> tokenDictionary =
                JsonConvert.DeserializeObject<Dictionary<string, string>>(result);
            return tokenDictionary;
        }
    }
}
