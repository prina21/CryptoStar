"use client";
import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";

const coins = ["bitcoin", "ethereum", "litecoin", "solana", "polkadot", "aave"];
const intervals = ["1", "7", "14", "30", "90", "180", "365", "max"];

export default function Candlestick() {
    const chartContainerRef = useRef(null);
    const [candlestickData, setCandlestickData] = useState([]);

    useEffect(() => {
        // Fetch candlestick data from CoinGecko API
        const fetchData = async () => {
            try {
                const response = await fetch(
                    "https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=365"
                );
                const data = await response.json();

                // Map CoinGecko data to the format expected by Lightweight Charts
                const formattedData = data.map((item) => ({
                    time: item[0] / 1000, // Convert timestamp to seconds
                    open: item[1], // Open price
                    high: item[2], // High price
                    low: item[3], // Low price
                    close: item[4], // Close price
                }));

                setCandlestickData(formattedData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!chartContainerRef.current || !candlestickData.length) return;

        // Initialize the chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 350,
            layout: {
                background: { color: "transparent" }, // Transparent background
                textColor: "#ffffff", // Light text for visibility
            },
            grid: {
                vertLines: { color: "rgba(255, 255, 255, 0.1)" }, // Light grid lines
                horzLines: { color: "rgba(255, 255, 255, 0.1)" }, // Light grid lines
            },
            priceScale: {
                borderColor: "rgba(255, 255, 255, 0.1)", // Light border
            },
            timeScale: {
                borderColor: "rgba(255, 255, 255, 0.1)", // Light border
            },
        });

        // Add a candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: "#26a69a",
            downColor: "#ef5350",
            borderVisible: false,
            wickUpColor: "#26a69a",
            wickDownColor: "#ef5350",
        });

        // Set data for the candlestick series
        candlestickSeries.setData(candlestickData);

        // Resize the chart on window resize
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };
        window.addEventListener("resize", handleResize);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [candlestickData]);

    return (
    <div className="card p-4 min-h-[200px] max-h-[430px] overflow-y-auto">
        <p className="text-gray-400">BTC/USDT</p>
        <p className="text-gray-400 text-sm whitespace-nowrap">Time : 1m 5m 15m 30m 1H 2H 4H 1D 1W 1M <span className="text-white font-bold">1Y</span>  </p>
        <div ref={chartContainerRef} style={{ width: "100%", height: "500px" }} />
    </div>
    
    );
};

