"use client";

import { useEffect, useState } from "react";
import axios from "axios";

function Portfolio() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/account/overview"
        );
        setPortfolioData(response.data);
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
      }
    }

    async function fetchAllOrders() {
      try {
        const response = await axios.get("http://127.0.0.1:8000/all-orders");
        console.log(response.data);
        // console.log("Created At Raw Value:", order.created_at, typeof order.created_at);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }

    fetchPortfolio();
    fetchAllOrders();
  }, []);

  if (!portfolioData) {
    return <div>Loading portfolio...</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 text-white">
        <h2 className="text-3xl font-bold mb-4">Portfolio Overview</h2>

        <p className="text-5xl font-bold text-green-400 mb-6">
          ${Number(portfolioData.portfolio_value).toLocaleString()}
        </p>

        <div className="bg-gray-700 rounded-md overflow-hidden w-full h-[2px]">
          {/* <img src="/img2.png" alt="Equity Chart" className="w-full h-[800px] object-fill"/> */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Cash", value: `$${portfolioData.cash}` },
            { title: "Buying Power", value: `$${portfolioData.buying_power}` },
            {
              title: "Profit/Loss",
              value: `${portfolioData.profit_loss >= 0 ? "+" : ""}$${
                portfolioData.profit_loss
              }`,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-gray-800 p-4 rounded-xl shadow-md text-center"
            >
              <h3 className="text-sm text-gray-400">{card.title}</h3>
              <p
                className={`text-2xl font-semibold ${
                  card.title === "Profit/Loss"
                    ? portfolioData.profit_loss >= 0
                      ? "text-green-400"
                      : "text-red-400"
                    : "text-white"
                }`}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Positions Table */}
      <div className="bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Current Positions</h2>
        <table className="w-full text-left table-auto">
          <thead className="text-sm text-gray-400 border-b border-gray-600">
            <tr>
              <th className="pb-2">Asset</th>
              <th className="pb-2">Quantity</th>
              <th className="pb-2">Market Price</th>
              <th className="pb-2">Market Value</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {portfolioData.positions.map((pos, idx) => {
              const qty = parseFloat(pos.qty);
              const marketValue = parseFloat(pos.market_value);
              const currentPrice = qty > 0 ? marketValue / qty : 0;

              return (
                <tr key={idx} className="border-b border-gray-700">
                  <td className="py-2">{pos.symbol}</td>
                  <td className="py-2">{qty.toFixed(6)}</td>
                  <td className="py-2">${currentPrice.toFixed(2)}</td>
                  <td className="py-2">${marketValue.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Recent Orders Table */}
      <div className="bg-gray-800 rounded-xl shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <table className="w-full text-left table-auto">
          <thead className="text-sm text-gray-400 border-b border-gray-600">
            <tr>
              {/* <th className="pb-2">Order ID</th> */}
              <th className="pb-2">Symbol</th>
              <th className="pb-2">Qty</th>
              <th className="pb-2">Side</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Created At</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map((order, idx) => (
              <tr key={idx} className="border-b border-gray-700">
                {/* <td className="py-2">{order.id}</td> */}
                <td className="py-2">{order.symbol}</td>
                <td className="py-2">{order.qty}</td>
                <td className="py-2 capitalize">{order.side}</td>
                <td className="py-2">{order.status}</td>
                <td className="py-2">
  {order.timestamp
    ? new Date(order.timestamp.split('.')[0]).toLocaleString()
    : 'N/A'}
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Portfolio;
