using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess_EF.ViewModels.ChartsViewModels
{
    /// <summary>
    /// used to model exchange rates related data - for the exchange rates deviation chart
    /// </summary>
    public class ExchangeRateDeviationVm
    {
        public string Date { get; set; }
        public decimal Usd { get; set; }
        public decimal Euro { get; set; }
    }
}
