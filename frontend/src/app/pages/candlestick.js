"use client";
import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";

const intervals = [
  { label: "1D", value: "1" },
  { label: "7D", value: "7" },
  { label: "14D", value: "14" },
  { label: "30D", value: "30" },
  { label: "90D", value: "90" },
  { label: "180D", value: "180" },
  { label: "1Y", value: "365" },
  { label: "Max", value: "max" },
];

export default function Candlestick() {
  const chartContainerRef = useRef(null);
  const [candlestickData, setCandlestickData] = useState([]);
  const [coinList, setCoinList] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [selectedInterval, setSelectedInterval] = useState("30");

  // Fetch coin list from CoinGecko
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/coins/list");
        const data = await response.json();

        // Optionally filter common coins
        const filtered = data.filter((coin) =>
          ["bitcoin", "ethereum", "litecoin", "solana", "polkadot", "aave"].includes(coin.id)
        );

        setCoinList(filtered);
      } catch (error) {
        console.error("Error fetching coin list:", error);
      }
    };

    fetchCoins();
  }, []);

  const fetchCandlestickData = async (coin, days) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin}/ohlc?vs_currency=usd&days=${days}`
      );
      const data = await response.json();

      const formattedData = data.map((item) => ({
        time: item[0] / 1000,
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
      }));

      setCandlestickData(formattedData);
    } catch (error) {
      console.error("Error fetching candlestick data:", error);
    }
  };

  useEffect(() => {
    fetchCandlestickData(selectedCoin, selectedInterval);
  }, [selectedCoin, selectedInterval]);

  useEffect(() => {
    if (!chartContainerRef.current || !candlestickData.length) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 350,
      layout: {
        background: { color: "transparent" },
        textColor: "#ffffff",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.1)" },
        horzLines: { color: "rgba(255, 255, 255, 0.1)" },
      },
      priceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candlestickSeries.setData(candlestickData);

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [candlestickData]);

  return (
    <div className="card p-4 min-h-[200px] max-h-[530px] overflow-y-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4">
        {/* Dynamic Coin Dropdown */}
        <select
          className="bg-[#1e1e2f] text-white px-3 py-2 rounded"
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
        >
          {coinList.map((coin) => (
            <option key={coin.id} value={coin.id}>
              {coin.name}
            </option>
          ))}
        </select>

        {/* Timeframe Pills */}
        <div className="flex flex-wrap gap-2">
          {intervals.map((intv) => (
            <button
              key={intv.value}
              onClick={() => setSelectedInterval(intv.value)}
              className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                selectedInterval === intv.value
                  ? "bg-white text-black"
                  : "bg-[#1e1e2f] text-white border-gray-600"
              }`}
            >
              {intv.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-gray-400 text-sm mb-1">
        {selectedCoin.toUpperCase()} / USD &nbsp;&nbsp;|&nbsp;&nbsp; Interval:{" "}
        {intervals.find((i) => i.value === selectedInterval)?.label}
      </div>

      <div ref={chartContainerRef} style={{ width: "100%", height: "200px" }} />
    </div>
  );
}
