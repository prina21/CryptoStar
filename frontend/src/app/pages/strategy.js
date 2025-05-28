"use client";
import Select from "react-select";
import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import axios from "axios"; 
import { useEffect } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

// Dummy portfolio data
const portfolioData = {
  labels: ["BTC", "ETH", "USDT", "BNB"],
  datasets: [
    {
      label: "Holdings",
      data: [4500, 2500, 2000, 1000], // Dummy values in $
      backgroundColor: ["#f7931a", "#627eea", "#26a17b", "#f3ba2f"],
      borderColor: "#1f2937", // Tailwind's gray-800 (dark)
      borderWidth: 2,
    },
  ],
};


const totalPortfolioValue = portfolioData.datasets[0].data.reduce(
  (a, b) => a + b,
  0
);


export default function Startegy() {
  const [autoTradeEnabled, setAutoTradeEnabled] = useState(false);
  const [strategy, setStrategy] = useState("RSI");
  const [tradeSize, setTradeSize] = useState("");
  const [maxLoss, setMaxLoss] = useState("");
  const [allowedCoins, setAllowedCoins] = useState([]);
  const [coinOptions, setCoinOptions] = useState([]);

  useEffect(() => {
  const fetchWatchlist = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/watchlist"); 
      console.log("dATA", res.data);
      const watchlist = res.data.watchlist;

      // Convert watchlist to react-select format
      const options = watchlist.map((coin) => ({
        value: coin.symbol,
        label: coin.name,
      }));

      setCoinOptions(options);
      setAllowedCoins(options); // Optional: prefill selection
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    }
  };

  fetchWatchlist();
}, []);


  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#1f2937", // Tailwind bg-gray-800
      borderColor: state.isFocused ? "#4b5563" : "#374151",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#6b7280",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#1f2937",
      color: "#fff",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#374151" : "#1f2937",
      color: "#fff",
      "&:active": {
        backgroundColor: "#4b5563",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#374151",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#fff",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#9ca3af",
      ":hover": {
        backgroundColor: "#4b5563",
        color: "#fff",
      },
    }),
  };

  return (
    <div className="grid grid-rows-2 gap-4">
      <div className="card p-4">
        <div className="rounded-lg max-w-md mx-auto">
          <h2 className="border-b border-[#afafaf] text-white mb-4">
            Strategy Control Panel
          </h2>

          {/* Toggle Auto-Trade */}
          <div className="flex items-center justify-between mb-4">
            <label className="text-gray-300">Auto-Trade</label>
            <button
              onClick={() => setAutoTradeEnabled(!autoTradeEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoTradeEnabled ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoTradeEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Strategy Selection */}
          <div className="mb-4">
            <label className="text-gray-300 block mb-1">Select Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              disabled={autoTradeEnabled}
              className={`w-full p-2 rounded text-white border border-gray-600 ${
                autoTradeEnabled
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-gray-800"
              }`}
            >
              <option value="RSI">RSI</option>
              <option value="EMA">EMA</option>
              <option value="SMA">SMA Crossover</option>
              <option value="Sentiment">Sentiment-Based</option>
            </select>
          </div>

          {/* Trade Size */}
          <div className="mb-4">
            <label className="text-gray-300 block mb-1">Trade Size ($)</label>
            <input
              type="number"
              placeholder="50"
              value={tradeSize}
              onChange={(e) => setTradeSize(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
              min={1}
            />
          </div>

          {/* Max Loss */}
          <div className="mb-4">
            <label className="text-gray-300 block mb-1">Max Loss ($)</label>
            <input
              type="number"
              placeholder="10"
              value={maxLoss}
              onChange={(e) => setMaxLoss(e.target.value)}
              className={`w-full p-2 rounded bg-gray-800 text-white border ${
                Number(maxLoss) > Number(tradeSize)
                  ? "border-red-500"
                  : "border-gray-600"
              }`}
              min={0}
            />
            {maxLoss && tradeSize && Number(maxLoss) > Number(tradeSize) && (
              <p className="text-red-500 text-sm mt-1">
                Max loss cannot exceed trade size.
              </p>
            )}
            {maxLoss && tradeSize && Number(maxLoss) <= Number(tradeSize) && (
              <p className="text-gray-400 text-sm mt-1">
                This is{" "}
                {((Number(maxLoss) / Number(tradeSize)) * 100).toFixed(1)}% of
                your trade size.
              </p>
            )}
          </div>

          {/* Multi-Select Allowed Coins */}
          <div className="mb-4">
            <label className="text-gray-300 block mb-1">Your Watchlist</label>
            <Select
  isMulti
  options={coinOptions}
  value={allowedCoins}
  onChange={setAllowedCoins}
  isDisabled={autoTradeEnabled}
  className="text-white"
  styles={customSelectStyles}
/>
          </div>
        </div>
      </div>

      {/* Risk Metrics Section */}
      {/* Portfolio Summary Section */}
      <div className="h-[200px] card">
        <div className="m-2 border-b border-[#afafaf] text-white">
          Portfolio Summary
        </div>
        <div className="px-4 py-2 text-white space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Value</span>
            <span className="font-bold text-green-400">
              ${totalPortfolioValue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Top Asset</span>
            <span className="text-white font-semibold">BTC</span>
          </div>
          <div className="w-[120px] mx-auto mt-4">
            <Doughnut
              data={portfolioData}
              options={{ plugins: { legend: { display: false } } }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
