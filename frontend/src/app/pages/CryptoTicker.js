"use client";

import React, { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";

export default function CryptoTicker() {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false&price_change_percentage=24h"
    )
      .then((res) => res.json())
      .then((data) => {
        setCoins(data);
      })
      .catch((err) => console.error("Error fetching ticker data", err));
  }, []);

  return (
    <div className="bg-gray-900 text-white border-b border-gray-800 py-2 text-sm">
      <Marquee pauseOnHover gradient={false} speed={40}>
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="flex items-center mx-6 min-w-max space-x-2"
          >
            <img
              src={coin.image}
              alt={coin.symbol}
              className="w-5 h-5"
              style={{ filter: "brightness(1.2)" }}
            />
            <span className="uppercase font-semibold">{coin.symbol}</span>
            <span>${coin.current_price.toLocaleString()}</span>
            <span
              className={`font-bold ${
                coin.price_change_percentage_24h >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {coin.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
