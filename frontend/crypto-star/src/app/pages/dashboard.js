import Image from "next/image";
import Orderbook from "./orderbook";
import Candlestick from "./candlestick";
import Sentiment from "./sentiment";
import Startegy from "./strategy";
import Metrics from "./metrics";
import Barchart from "./barchart";
import CryptoTable from "./MarketDataTable/DataTable"

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="flex flex-col gap-[10px]">
        <Orderbook></Orderbook>
        {/* <Metrics></Metrics> */}
        <Sentiment></Sentiment>
      </div>
      
      <div className="grid-rows-2">
        <Candlestick></Candlestick> 
        {/* <CryptoTable></CryptoTable>  */}
      </div>

      <div>
        <Startegy></Startegy>
      </div>

    </div>
  );
}
