"use client";
import React, { useEffect, useState } from "react";
import ReactSpeedometer from "react-d3-speedometer";

export default function FearGreed() {
  const [fgValue, setFgValue] = useState(0);
  const [fgLabel, setFgLabel] = useState("");

  useEffect(() => {
    const fetchFGI = async () => {
      try {
        const response = await fetch("https://api.alternative.me/fng/");
        const data = await response.json();
        const value = parseInt(data.data[0].value, 10);
        const label = data.data[0].value_classification;
        setFgValue(value);
        setFgLabel(label);
      } catch (error) {
        console.error("Error fetching Fear & Greed Index:", error);
      }
    };

    fetchFGI();
  }, []);

  return (
    <div className="card min-h-[200px] max-h-[450px] overflow-y-auto scrollbar-hide rounded-lg p-4 ">
      <h2 className="border-b border-[#afafaf] text-white mb-4">Fear & Greed</h2>
      {fgValue !== null ? (
        <ReactSpeedometer
          value={fgValue}
          minValue={0}
          maxValue={100}
          segments={5}
          segmentColors={["#d32f2f", "#f57c00", "#fbc02d", "#7cb342", "#388e3c"]}
          needleColor="#ffffff"
          currentValueText={fgLabel}
          textColor="#ffffff"
          height={200}
          ringWidth={40}
        />
      ) : (
        <p className="text-white">Loading...</p>
      )}
    </div>
  );
}
