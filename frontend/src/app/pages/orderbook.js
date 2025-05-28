"use client";
import React, { useEffect, useState } from "react";

export default function Orderbook() {
  const [orderBookData, setOrderBookData] = useState([]);

  useEffect(() => {
    const socket = new WebSocket("wss://ws.kraken.com");

    const subscribeMsg = {
      event: "subscribe",
      pair: ["BTC/USDT"],
      subscription: {
        name: "book",
        depth: 5,
      },
    };

    let asks = [];
    let bids = [];

    socket.onopen = () => {
      socket.send(JSON.stringify(subscribeMsg));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (Array.isArray(data)) {
        const [channelID, bookData] = data;

        if (bookData.as || bookData.bs) {
          if (bookData.as) {
            asks = bookData.as.map(([price, amount]) => ({
              price: parseFloat(price),
              amount: parseFloat(amount),
              total: (parseFloat(price) * parseFloat(amount)) / 1000,
              type: "ask",
            }));
          }
          if (bookData.bs) {
            bids = bookData.bs.map(([price, amount]) => ({
              price: parseFloat(price),
              amount: parseFloat(amount),
              total: (parseFloat(price) * parseFloat(amount)) / 1000,
              type: "bid",
            }));
          }

          const divider = {
            price: (bids[0]?.price + asks[0]?.price) / 2,
            amount: null,
            total: null,
            type: "divider",
          };

          setOrderBookData([...bids, divider, ...asks]);
        }
      }
    };

    return () => socket.close();
  }, []);

  return (
    <div className="card min-h-[200px] max-h-[450px] overflow-y-auto scrollbar-hide rounded-lg p-4">
      <h2 className="border-b border-[#afafaf] text-white">Order Book</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-gray-400">
            <th className="text-sm p-2 text-left">Price (USD)</th>
            <th className="text-sm p-2 text-left">Amount (BTC)</th>
            <th className="text-sm p-2 text-left">Total (k USD)</th>
          </tr>
        </thead>
        <tbody>
          {orderBookData.map((order, index) =>
            order.type === "divider" ? (
              <tr key={index}>
                <td colSpan="3" className="text-start p-2 text-gray-400">
                  <span className="text-red-400 text-lg">
                    {order.price?.toLocaleString()} ↓
                  </span>{" "}
                  ≈ $
                </td>
              </tr>
            ) : (
              <tr
                key={index}
                className={`${
                  order.type === "bid" ? "text-green-400" : "text-red-400"
                } text-sm border-b border-transparent hover:bg-gray-800 transition-colors`}
              >
                <td className="p-2">{order.price.toLocaleString()}</td>
                <td className="p-2">{order.amount?.toFixed(4) || ""}</td>
                <td className="p-2">{order.total ? `${order.total.toFixed(2)}K` : ""}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
