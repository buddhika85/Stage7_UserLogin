using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace BCMY.WebAPI.Controllers
{
    //[EnableCors(origins: "*", headers: "*", methods: "*")]
    [EnableCors(origins: "https://localhost:44301", headers: "*", methods: "*")]
    [Authorize]
    public class RoleTestController : ApiController
    {
        [Authorize(Roles = "Director")]  // Executive
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }
    }
}
