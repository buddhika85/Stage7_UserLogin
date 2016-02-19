using BCMY.WebAPI.Models.UnityDI;
using DataAccess_EF.EntityFramework;
using GenericRepository_UnitOfWork.GR;
using GenericRepository_UnitOfWork.UOW;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace BCMY.WebAPI.Controllers
{
    [EnableCors(origins: "https://localhost:44301", headers: "*", methods: "*")]
    public class ExchangeRateController : ApiController
    {
        ObjectProvider objectProvider = null;
        UnitOfWork unitOfWork = null;
        GenericRepository<TblExchangeRate> exchangeRateRepository = null;

        // constructor
        public ExchangeRateController()
        {
            objectProvider = objectProvider == null ? new ObjectProvider() : objectProvider;
            unitOfWork = unitOfWork == null ? objectProvider.UnitOfWork : unitOfWork;
            exchangeRateRepository = exchangeRateRepository == null ? unitOfWork.ExchangeRateRepository : exchangeRateRepository;
        }

        // GET: api/ExchangeRate
        // http://localhost:61945/api/exchangerate
        public IEnumerable<TblExchangeRate> Get()
        {
            IEnumerable<TblExchangeRate> ers = null;
            try
            {
                ers = exchangeRateRepository.GetAll().OrderBy(e => e.dateER);
            }
            catch (Exception)
            {
                ers = null;
            }
            return ers;           
        }

        // Used to save past exchange rates
        // http://localhost:61945/api/exchangerate?date=30/10/2014&euro=1.3&usd=1.5
        [HttpGet, ActionName("SavePastExchangeRates")]
        public string SavePastExchangeRates(string date, decimal euro, decimal usd)
        {
            string insertStatus = string.Empty;
            try
            {
                var result = exchangeRateRepository.SQLQuery<string>("SP_ValidateAndSavePastExchangeRates @dateStr, @euroVal, @usdVal",
                    new SqlParameter("dateStr", SqlDbType.VarChar) { Value = date, Direction = ParameterDirection.Input },
                    new SqlParameter("euroVal", SqlDbType.Decimal) { Value = euro, Direction = ParameterDirection.Input },
                    new SqlParameter("usdVal", SqlDbType.Decimal) { Value = usd, Direction = ParameterDirection.Input });
                insertStatus = result.ToList<string>().FirstOrDefault<string>();
            }
            catch (Exception)
            {
                insertStatus = "Error - past exchange rate save failed";
            }
            return insertStatus;
        }

        // GET: api/ExchangeRate/5
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/ExchangeRate
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/ExchangeRate/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/ExchangeRate/5
        public void Delete(int id)
        {
        }
    }
}
