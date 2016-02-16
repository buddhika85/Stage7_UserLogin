using BCMY.WebAPI.Models.UnityDI;
using DataAccess_EF.EntityFramework;
using DataAccess_EF.ViewModels.ChartsViewModels;
using GenericRepository_UnitOfWork.GR;
using GenericRepository_UnitOfWork.UOW;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace BCMY.WebAPI.Controllers
{
    /// <summary>
    /// Used to expose chart related data
    /// </summary>
    [EnableCors(origins: "https://localhost:44301", headers: "*", methods: "*")]
    public class ChartController : ApiController
    {
        ObjectProvider objectProvider = null;
        UnitOfWork unitOfWork = null;
        GenericRepository<TblCurrency> currencyRepository = null;

        // constructor
        public ChartController()
        {
            objectProvider = objectProvider == null ? new ObjectProvider() : objectProvider;
            unitOfWork = unitOfWork == null ? objectProvider.UnitOfWork : unitOfWork;
            currencyRepository = currencyRepository == null ? unitOfWork.CurrencyRepository : currencyRepository;
        }

        // GET: api/Chart
        public string Get(string chartName)
        {
            string resultJson = null;
            JavaScriptSerializer jss = new JavaScriptSerializer();
            try
            {
                switch (chartName)
                {
                    case "EXCHANGE_RATE_DEVIATION":
                        {
                            IEnumerable<ExchangeRateDeviationVm> chartData = currencyRepository.SQLQuery<ExchangeRateDeviationVm>("SP_GetChartsExchangeRatesDeviation").
                                ToList<ExchangeRateDeviationVm>();
                            resultJson = jss.Serialize(chartData);
                            break;
                        }
                    default:
                        {
                            break;
                        }                        
                }
            }
            catch (Exception)
            {                
                resultJson = null;
            }
            return resultJson;
        }

        // GET: api/Chart/5
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/Chart
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/Chart/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Chart/5
        public void Delete(int id)
        {
        }
    }
}
