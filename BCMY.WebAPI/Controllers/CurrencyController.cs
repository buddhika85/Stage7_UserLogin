using BCMY.WebAPI.Models.UnityDI;
using DataAccess_EF.EntityFramework;
using GenericRepository_UnitOfWork.GR;
using GenericRepository_UnitOfWork.UOW;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace BCMY.WebAPI.Controllers
{
    [EnableCors(origins: "https://localhost:44301", headers: "*", methods: "*")]
    public class CurrencyController : ApiController
    {
        ObjectProvider objectProvider = null;
        UnitOfWork unitOfWork = null;
        GenericRepository<TblCurrency> currencyRepository = null;

        // constructor
        public CurrencyController()
        {
            objectProvider = objectProvider == null ? new ObjectProvider() : objectProvider;
            unitOfWork = unitOfWork == null ? objectProvider.UnitOfWork : unitOfWork;
            currencyRepository = currencyRepository == null ? unitOfWork.CurrencyRepository : currencyRepository;
        }


        // GET: api/Currency
        public IList<TblCurrency> Get()
        {
            try
            {
                //var currencies = currencyRepository.GetAll().ToList<TblCurrency>();
                // call stored procedure via repository
                IList<TblCurrency> currencies = currencyRepository.SQLQuery<TblCurrency>("SP_GetAllCurrencies").ToList<TblCurrency>();
                return currencies;
            }
            catch (Exception)
            {
                return null;
            }
        }

        // GET: api/Currency/5
        public TblCurrency Get(int id)
        {
            try
            {
                return currencyRepository.GetByPrimaryKey(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        // POST: api/Currency
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/Currency/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Currency/5
        public void Delete(int id)
        {
        }
    }
}
