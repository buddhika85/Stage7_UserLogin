using DataAccess_EF.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BCMY.WebAPI.Util
{
    public static class OrderLineNegotiationValidator
    {
        /// <summary>
        /// Validates negotiations or orderline records related fields
        /// </summary>
        public static bool ValidateOrderLineOrNegotiation(int productListId, decimal quantityVal, decimal pricePerItem, decimal totalAmountVal, int status, int orderIdVal)
        {
            bool isValid = false;
            try
            {
                isValid = GeneralValidator.IsNumeric(productListId) &&
                    GeneralValidator.IsDecimalNumber(quantityVal) &&
                    GeneralValidator.IsDecimalNumber(pricePerItem) &&
                    GeneralValidator.IsDecimalNumber(totalAmountVal) &&
                    GeneralValidator.IsNumeric(status) &&
                    GeneralValidator.IsNumeric(orderIdVal);
            }
            catch (Exception)
            {
                return isValid;
            }
            return isValid;
        }


        /// <summary>
        /// Orderline validation
        /// </summary>
        public static bool ValidateOrderLineOrNegotiation(TblOrderLine orderLine)
        {
            bool isValid = false;
            try
            {
                isValid = GeneralValidator.IsNumeric(orderLine.productId) &&
                    GeneralValidator.IsDecimalNumber(orderLine.quantity) &&
                    GeneralValidator.IsDecimalNumber(orderLine.negotiatedPricePerItem) &&
                    GeneralValidator.IsDecimalNumber(orderLine.totalAmount) &&
                    GeneralValidator.IsStringNotEmpty(orderLine.status) &&
                    GeneralValidator.IsNumeric(orderLine.orderId);
            }
            catch (Exception)
            {
                return isValid;
            }
            return isValid;
        }

        /// <summary>
        /// Negotiation validation
        /// </summary>
        public static bool ValidateOrderLineOrNegotiation(TblNegotiation negotiation)
        {
            bool isValid = false;
            try
            {
                isValid = GeneralValidator.IsNumeric(negotiation.productId) &&
                    GeneralValidator.IsDecimalNumber(negotiation.quantity) &&
                    GeneralValidator.IsDecimalNumber(negotiation.negotiatedPricePerItem) &&
                    GeneralValidator.IsDecimalNumber(negotiation.totalAmount) &&
                    GeneralValidator.IsStringNotEmpty(negotiation.status) &&
                    GeneralValidator.IsNumeric(negotiation.orderId);
            }
            catch (Exception)
            {
                return isValid;
            }
            return isValid;
        }

    }    
}