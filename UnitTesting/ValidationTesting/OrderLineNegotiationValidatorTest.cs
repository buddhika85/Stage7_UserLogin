using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using DataAccess_EF.EntityFramework;
using Moq;
using BCMY.WebAPI.Util;

namespace UnitTesting.ValidationTesting
{
    [TestClass]
    public class OrderLineNegotiationValidatorTest
    {
        [TestMethod]
        public void ValidateOrderLineOrNegotiation()
        {
            try
            {
                // Arrange
                // MOQ object creation
                // Ref - https://github.com/Moq/moq4/wiki/Quickstart
                //Mock<TblOrderLine> orderLineMock = new Mock<TblOrderLine>();
                //orderLineMock.SetupSet(ol => { 
                //    ol.productId = 1; 
                //    ol.orderId = 1; 
                //    ol.negotiatedPricePerItem = 2.223M;
                //    ol.quantity = 1.1M;
                //    ol.totalAmount = 10.99M;
                //    ol.status = "in negotiation";
                //});

                //// Act
                //bool actualOutput = OrderLineNegotiationValidator.ValidateOrderLineOrNegotiation(orderLineMock.Object);
               
                //// Assert
                //Assert.IsTrue(actualOutput);
                //Mock<Itest> mock = new Mock<Itest>();
                //mock.SetupSet(m => { m.MyProperty1 = 1; m.MyProperty2 = 2; });
                //Assert.AreEqual(3, mock.Object.MyProperty1 + mock.Object.MyProperty2);
            }
            catch (Exception exe)
            {
                //Assert.Fail(string.Format("Exception occured during the unit test : {0} | {1}", exe.Message, exe.Source));
            }
        }


    }

    //public interface Itest {
    //    int MyProperty1 { get; set; }
    //    int MyProperty2 { get; set; }
    //}
}
