import React, { useEffect, useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from "@mui/material";

export const CryptoTable = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);  // To handle loading state

  useEffect(() => {
    fetch("http://127.0.0.1:8000/crypto")
      .then((response) => response.json())
      .then((data) => {
        if (data && data.data) {
          setCryptoData(data.data);
        }
        setLoading(false);  // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching crypto data:", error);
        setLoading(false);
      });
  }, []);

  const rows = cryptoData.map((crypto) => {
    const price = crypto.quote?.USD?.price ?? "N/A";
    const percent_change_1h = crypto.quote?.USD?.percent_change_1h ?? "N/A";
    const percent_change_24h = crypto.quote?.USD?.percent_change_24h ?? "N/A";
    const percent_change_7d = crypto.quote?.USD?.percent_change_7d ?? "N/A";
    const market_cap = crypto.quote?.USD?.market_cap ?? "N/A";
    const volume_24h = crypto.quote?.USD?.volume_24h ?? "N/A";
    const circulating_supply = crypto.circulating_supply ?? "N/A";

    const iconUrl = `https://s2.coinmarketcap.com/static/img/coins/64x64/${crypto.id}.png`;

    return {
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      price: price,
      percent_change_1h: percent_change_1h,
      percent_change_24h: percent_change_24h,
      percent_change_7d: percent_change_7d,
      market_cap: market_cap,
      volume_24h: volume_24h,
      circulating_supply: circulating_supply,
      iconUrl: iconUrl,  // Adding icon URL
    };
  });

  return (
    <Box sx={{ width: "100%", backgroundColor: "#000", color: "#fff", padding: "20px" }}>
      {/* Add a circular progress indicator while the data is loading */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress sx={{ color: "#fff" }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: "auto", backgroundColor: "#000" }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ color: "#fff" }}>Symbol</TableCell>
                <TableCell style={{ color: "#fff" }}>Name</TableCell>
                <TableCell style={{ color: "#fff" }} align="right">Price</TableCell>
                <TableCell style={{ color: "#fff" }} align="right">1h %</TableCell>
                <TableCell style={{ color: "#fff" }} align="right">24h %</TableCell>
                <TableCell style={{ color: "#fff" }} align="right">7d %</TableCell>
                <TableCell style={{ color: "#fff" }} align="right">Market Cap</TableCell>
                <TableCell style={{ color: "#fff" }} align="right">Volume (24h)</TableCell>
                <TableCell style={{ color: "#fff" }} align="right">Circulating Supply</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row" sx={{ color: "#fff" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <img src={row.iconUrl} alt={row.symbol} style={{ width: "24px", height: "24px", marginRight: "10px" }} />
                      {row.symbol}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.price !== "N/A" ? `$${parseFloat(row.price).toFixed(2)}` : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.percent_change_1h !== "N/A" ? `${parseFloat(row.percent_change_1h).toFixed(2)}%` : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.percent_change_24h !== "N/A" ? `${parseFloat(row.percent_change_24h).toFixed(2)}%` : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.percent_change_7d !== "N/A" ? `${parseFloat(row.percent_change_7d).toFixed(2)}%` : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.market_cap !== "N/A" ? `$${row.market_cap.toLocaleString()}` : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.volume_24h !== "N/A" ? `$${row.volume_24h.toLocaleString()}` : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.circulating_supply !== "N/A" ? `${row.circulating_supply.toLocaleString()} BTC` : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

