"use client";
import { useState } from "react";
import Papa from "papaparse";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function StrategyBacktestForm() {
  const [buyRule, setBuyRule] = useState({
    indicator: "RSI",
    condition: "<",
    value: 30,
  });

  const [sellRule, setSellRule] = useState({
    indicator: "RSI",
    condition: ">",
    value: 70,
  });

  const [csvFile, setCsvFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [backtestResult, setBacktestResult] = useState(null);
  const [timeframe, setTimeframe] = useState("1Min");

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const parsedData = results.data.filter(row => row.close && row.timestamp); // Clean
          setRawData(parsedData);
          setCsvFile(parsedData);
        }
      });
    }
  };

  const handleBacktest = async () => {
    const strategyConfig = {
      buyRule: { ...buyRule, action: "BUY" },
      sellRule: { ...sellRule, action: "SELL" },
      timeframe,
      data: csvFile,
    };

    const res = await fetch("http://127.0.0.1:8000/backtest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(strategyConfig)
    });

    const result = await res.json();
    setBacktestResult(result);
  };

  const chartData = {
    labels: rawData.map(row => row.timestamp),
    datasets: [
      {
        label: 'Close Price',
        data: rawData.map(row => parseFloat(row.close)),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,  // ← important!
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 10,
          autoSkip: true
        }
      }
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      
      {/* Strategy Form Section */}
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-4">Define Your Strategy</h2>

        {/* Buy Rule */}
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Buy Rule</h3>
          <select onChange={(e) => setBuyRule({ ...buyRule, indicator: e.target.value })} className="w-full bg-gray-700 p-2 rounded-lg mb-2">
            <option value="RSI">RSI</option>
            <option value="EMA">EMA</option>
            <option value="SMA">SMA</option>
          </select>
          <select onChange={(e) => setBuyRule({ ...buyRule, condition: e.target.value })} className="w-full bg-gray-700 p-2 rounded-lg mb-2">
            <option value="<">Less than</option>
            <option value=">">Greater than</option>
          </select>
          <input type="number" value={buyRule.value} onChange={(e) => setBuyRule({ ...buyRule, value: parseFloat(e.target.value) })} className="w-full bg-gray-700 p-2 rounded-lg" />
        </div>

        {/* Sell Rule */}
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Sell Rule</h3>
          <select onChange={(e) => setSellRule({ ...sellRule, indicator: e.target.value })} className="w-full bg-gray-700 p-2 rounded-lg mb-2">
            <option value="RSI">RSI</option>
            <option value="EMA">EMA</option>
            <option value="SMA">SMA</option>
          </select>
          <select onChange={(e) => setSellRule({ ...sellRule, condition: e.target.value })} className="w-full bg-gray-700 p-2 rounded-lg mb-2">
            <option value="<">Less than</option>
            <option value=">">Greater than</option>
          </select>
          <input type="number" value={sellRule.value} onChange={(e) => setSellRule({ ...sellRule, value: parseFloat(e.target.value) })} className="w-full bg-gray-700 p-2 rounded-lg" />
        </div>

        {/* Timeframe */}
        <div className="mb-4">
          <label className="block font-medium">Timeframe</label>
          <select onChange={(e) => setTimeframe(e.target.value)} className="w-full bg-gray-700 p-2 rounded-lg">
            <option value="1Min">1 Minute</option>
            <option value="5Min">5 Minutes</option>
            <option value="15Min">15 Minutes</option>
            <option value="1H">1 Hour</option>
            <option value="1D">1 Day</option>
          </select>
        </div>

        {/* CSV Upload */}
        <div className="mb-4">
          <label className="block font-medium">Upload CSV for Backtest</label>
          <input type="file" accept=".csv" onChange={handleCSVUpload} className="mt-2" />
        </div>

        <button onClick={handleBacktest} className="bg-blue-600 text-white px-4 py-2 rounded">
          Run Backtest
        </button>

        {/* Result */}
        {backtestResult && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Backtest Results</h3>
            <p><strong>Final Balance:</strong> ${backtestResult.finalBalance}</p>
            <p><strong>Holdings:</strong> ${backtestResult.holdings}</p>
            <p><strong>Profit:</strong> ${backtestResult.profit}</p>
            {/* <p><strong>Signals:</strong> {backtestResult.signals.join(", ")}</p> */}
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="w-full md:w-1/2 flex flex-col min-w-[1000px] max-h-[500px]">
        <h3 className="text-lg font-bold mb-4">Close Price Chart</h3>
        <div className="flex-1 ">
          {rawData.length > 0 ? (
            <Line data={chartData} options={chartOptions} 
            />
          ) : (
            <p className="text-gray-400">Upload a CSV to view chart</p>
          )}
        </div>
      </div>

    </div>
  );
}
