using BCMY.WebAPI.Models.UnityDI;
using BCMY.WebAPI.Util;
using DataAccess_EF.EntityFramework;
using GenericRepository_UnitOfWork.GR;
using GenericRepository_UnitOfWork.UOW;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Script.Serialization;
using System.Data;
using System.Data.SqlClient;
using DataAccess_EF.ViewModels;

namespace BCMY.WebAPI.Controllers
{
    [EnableCors(origins: "https://localhost:44301", headers: "*", methods: "*")]
    public class NegotiationController : ApiController
    {
        ObjectProvider objectProvider = null;
        UnitOfWork unitOfWork = null;
        GenericRepository<TblNegotiation> negotiationRepository = null;

        // constructor
        public NegotiationController()
        {
            objectProvider = objectProvider == null ? new ObjectProvider() : objectProvider;
            unitOfWork = unitOfWork == null ? objectProvider.UnitOfWork : unitOfWork;
            negotiationRepository = negotiationRepository == null ? unitOfWork.NegotiationRepository : negotiationRepository;
        }

        /// <summary>
        /// Filters and exposes all the negotiations by order Id and product list Id
        /// </summary>
        /// http://localhost:61945/api/Negotiation?orderId=28&productListId=100608
        [HttpGet, ActionName("GetNegotiationsByOrderProductIds")]
        public IEnumerable<NegotiationViewModel> GetNegotiationsByOrderProductIds(int orderId, int productListId)
        {
            try
            {
                // call stored procedure via repository
                var result = negotiationRepository.SQLQuery<TblNegotiation>("SP_GetNegotiationsByOrderProductIds @orderId, @productListId",
                    new SqlParameter("orderId", SqlDbType.Int) { Value = orderId },
                    new SqlParameter("productListId", SqlDbType.Int) { Value = productListId });

                // convert the result to a negotiation View Model list
                IList<TblNegotiation> negotiations = result.ToList<TblNegotiation>();
                IList<NegotiationViewModel> negotiationVms = new List<NegotiationViewModel>();
                foreach (TblNegotiation item in negotiations)
                {
                    negotiationVms.Add(ViewModelConvertor.ConvertToVm(item));
                }
                //return negotiations
                return negotiationVms;
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// Filters and exposes all the negotiations by order Id and product list Id, and status = confirmed
        /// </summary>
        /// http://localhost:61945/api/Negotiation?orderId=30&productListId=107233&confirmed=true
        [HttpGet, ActionName("GetSuccessNegotiationsByOrderProductIds")]
        public IEnumerable<NegotiationViewModel> GetLast3SuccessNegotiationsByOrderProductIds(int orderId, int productListId, bool confirmed)
        {
            try
            {
                // call stored procedure via repository
                var result = negotiationRepository.SQLQuery<NegotiationViewModel>("SP_GetSuccessNegotiationsByProductId @orderId, @productListId",
                    new SqlParameter("orderId", SqlDbType.Int) { Value = orderId },
                    new SqlParameter("productListId", SqlDbType.Int) { Value = productListId });

                // convert the result to a negotiation View Model list
                IList<NegotiationViewModel> negotiationVms = result.ToList<NegotiationViewModel>();
                
                //return negotiations
                return negotiationVms;
            }
            catch (Exception)
            {
                return null;
            }
        }


        /// <summary>
        /// Filters and exposes all the negotiations by order Id and product list Id, and status = confirmed
        /// </summary>
        /// http://localhost:61945/api/Negotiation?orderId=30&productListId=107233&confirmed=true&custSupName=UniOfBrighton&count=10
        [HttpGet, ActionName("GetSuccessNegotiationsByOrderProductIds")]
        public IEnumerable<NegotiationViewModel> GetSuccessNegotiationsByProductId(int orderId, int productListId, bool confirmed, string custSupName, int count, string selectedCurrency)
        {
            try
            {
                // call stored procedure via repository
                //var result = negotiationRepository.SQLQuery<NegotiationViewModel>("SP_GetSuccessNumOfNegotiationsByProductId @orderId, @productListId, @count",
                //    new SqlParameter("orderId", SqlDbType.Int) { Value = orderId },
                //    new SqlParameter("productListId", SqlDbType.Int) { Value = productListId },
                //    new SqlParameter("count", SqlDbType.Int) { Value = count });
                // call stored procedure via repository
                var result = negotiationRepository.SQLQuery<NegotiationViewModel>("SP_GetSuccessNegotiationsByProductId @orderId, @productListId, @selectedCurrency",
                    new SqlParameter("orderId", SqlDbType.Int) { Value = orderId },
                    new SqlParameter("productListId", SqlDbType.Int) { Value = productListId },
                    new SqlParameter("selectedCurrency", SqlDbType.VarChar) { Value = selectedCurrency });

                // convert the result to a negotiation View Model list
                IList<NegotiationViewModel> negotiationVms = result.ToList<NegotiationViewModel>();

                // ordering logic - order by customerSupplier name
                negotiationVms = SortNegotations(negotiationVms, custSupName, 5, 10);

                //return negotiations
                return negotiationVms;
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// Used to save a negotiation record
        /// </summary>
        /// http://localhost:61945/api/Negotiation?productListId=107233&quantityVal=3&pricePerItem=5.0&totalAmountVal=15.0&status=2&orderIdVal=26
        [HttpGet, ActionName("SaveNegotiation")]
        public string SaveNegotiation(int productListId, decimal quantityVal, decimal pricePerItem, decimal totalAmountVal, int status, int orderIdVal)
        {
            string message = string.Empty;
            try
            {               
                // validation 
                if (OrderLineNegotiationValidator.ValidateOrderLineOrNegotiation(productListId, quantityVal, pricePerItem, totalAmountVal, status, orderIdVal))
                {
                    TblNegotiation negotiation = new TblNegotiation() {
                        productId = productListId,
                        quantity = quantityVal,
                        negotiatedPricePerItem = pricePerItem,
                        totalAmount = totalAmountVal,
                        status = CommonBehaviour.GetCommonStatusString(status),
                        negotiationDateTime = DateTime.Now,
                        orderId = orderIdVal
                    };
                    negotiationRepository.Insert(negotiation);
                    unitOfWork.Save();
                    message = "success";
                }
                else
                {
                    message = "Error - Please fill all the mandatory fields";
                }
            }
            catch (Exception ex)
            {
                message = "Error - Server side - Saving negotiation. Please contact IT Support";
            }
            return message; 
        }

        /// <summary>
        /// A helper method which sorts all the successful negotiations by same company first then time
        /// Current company 5
        /// Other companies 10
        /// </summary>
        private IList<NegotiationViewModel> SortNegotations(IList<NegotiationViewModel> negotiationVms, string custSupName, int currCompanyCount, int otherCompanyCount)
        {
            // first sort same company by time - last first
            IEnumerable<NegotiationViewModel> vmsSorted = negotiationVms.Where(n => n.cusomerSupplierName.ToLower() == custSupName.ToLower()).
                OrderByDescending(n => n.negotiationDateTime).Take<NegotiationViewModel>(currCompanyCount);
            // then get other company negotations and sort by time - last first
            IEnumerable<NegotiationViewModel> othersSorted = negotiationVms.Where(n => n.cusomerSupplierName.ToLower() != custSupName.ToLower()).
                OrderByDescending(n => n.negotiationDateTime).Take<NegotiationViewModel>(otherCompanyCount);
            //foreach (NegotiationViewModel item in othersSorted)
            //{
            //    vmsSorted.Add(item);
            //}
            vmsSorted = vmsSorted.Concat<NegotiationViewModel>(othersSorted);
            return vmsSorted.ToList<NegotiationViewModel>();
        } 

    }
}
