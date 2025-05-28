"use client";

import Image from "next/image";
import Orderbook from "./orderbook";
import Candlestick from "./candlestick";
import Sentiment from "./sentiment";
import Startegy from "./strategy";
import Metrics from "./News";
import Barchart from "./barchart";
// import StrategyForm from './Backtesting/page'
import FearGreed from './FearGreed'
import News from "./News";
import { CryptoTable } from "./dataTable";
import Portfolio from "../portfolio/page";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="flex flex-col gap-[10px]">
        <FearGreed></FearGreed>
        <News></News>
      </div>
      
      <div className="grid-rows-2">
        <Candlestick></Candlestick> 
        <CryptoTable></CryptoTable> 
      </div>

      <div>
        <Startegy></Startegy>
      </div>

      {/* <StrategyForm></StrategyForm>x */}

    </div>
  );
}
