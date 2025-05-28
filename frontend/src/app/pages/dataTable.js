"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';

export const CryptoTable = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true); // To handle loading state
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [trackedCoins, setTrackedCoins] = useState([]);

  useEffect(() => {
    // fetch("http://localhost:8000/crypto")
    fetch("http://127.0.0.1:8000/crypto")
      .then((response) => response.json())
      .then((data) => {
        if (data && data.data) {
          setCryptoData(data.data);
        }
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching crypto data:", error);
        setLoading(false);
      });
  }, []);

useEffect(() => {
  const fetchWatchlist = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/watchlist');
      const data = await response.json();
      setTrackedCoins(data.watchlist || []);
    } catch (err) {
      console.error("Failed to fetch watchlist:", err);
    }
  };
  fetchWatchlist();
}, []);

const toggleCoin = async (coin) => {
  let updated;
  
  // Check by symbol — whether the coin is already tracked
  const isTracked = trackedCoins.some(c => c.symbol === coin.symbol);

  if (isTracked) {
    updated = trackedCoins.filter(c => c.symbol !== coin.symbol);
  } else {
    updated = [...trackedCoins, { symbol: coin.symbol, name: coin.name }];
  }

  setTrackedCoins(updated);
  localStorage.setItem('watchlist', JSON.stringify(updated));

  await fetch('http://127.0.0.1:8000/watchlist', {
    method: 'POST',
    body: JSON.stringify({ watchlist: updated }),
    headers: { 'Content-Type': 'application/json' },
  });
};

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
    price,
    percent_change_1h,
    percent_change_24h,
    percent_change_7d,
    market_cap,
    volume_24h,
    circulating_supply,
    iconUrl,
  };
});

const filteredRows = rows
  .filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) => {
    const aInWatch = trackedCoins.some(c => c.symbol === a.symbol);
    const bInWatch = trackedCoins.some(c => c.symbol === b.symbol);
  return aInWatch === bInWatch ? 0 : aInWatch ? -1 : 1;
});
  return (
    <Box
      sx={{
        backgroundColor: "#121212",
        color: "#fff",
        padding: "5px",
        margin: "0 auto",
        height: "430px",
        overflowY: "auto",
        overflowX: "auto",
      }}
    >
        <TextField
        variant="outlined"
        size="small"
        placeholder="Search by name or symbol"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ marginBottom: 2, backgroundColor: "#fff", borderRadius: 1, width: "100%" }}
      />
      {loading ? (
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
        >
          <CircularProgress sx={{ color: "#fff" }} />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 350,
            maxWidth: 740,
            overflowX: "auto",
            backgroundColor: "#121212",
          }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#fff", position: "sticky",
                    top: 0,
                    background: "#121212", }}></TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    position: "sticky",
                    top: 0,
                    background: "#121212",
                  }}
                >
                  Symbol
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    position: "sticky",
                    top: 0,
                    background: "#121212",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    position: "sticky",
                    top: 0,
                    background: "#121212",
                  }}
                  align="right"
                >
                  Price
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    position: "sticky",
                    top: 0,
                    background: "#121212",
                  }}
                  align="right"
                >
                  1h %
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    position: "sticky",
                    top: 0,
                    background: "#121212",
                  }}
                  align="right"
                >
                  24h %
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    position: "sticky",
                    top: 0,
                    background: "#121212",
                  }}
                  align="right"
                >
                  7d %
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    position: "sticky",
                    top: 0,
                    background: "#121212",
                  }}
                  align="right"
                >
                  Market Cap
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    position: "sticky",
                    top: 0,
                    background: "#121212",
                  }}
                  align="right"
                >
                  Volume (24h)
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    position: "sticky",
                    top: 0,
                    background: "#121212",
                  }}
                  align="right"
                >
                  Circulating Supply
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {filteredRows.map((row) => (
                <TableRow key={row.id}>
                    <TableCell>
         <IconButton onClick={() => toggleCoin({symbol: row.symbol, name: row.name})}>
  {trackedCoins.some(c => c.symbol === row.symbol) ? (
    <StarIcon sx={{ color: "#FFD700" }} />
  ) : (
    <StarBorderIcon sx={{ color: "#fff" }} />
  )}
</IconButton>
        </TableCell>
                   <TableCell sx={{ color: "#fff" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <img src={row.iconUrl} alt={row.symbol} style={{ width: "24px", height: "24px", marginRight: "10px" }} />
                      {row.symbol}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.price !== "N/A"
                      ? `${parseFloat(row.price).toFixed(2)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.percent_change_1h !== "N/A"
                      ? `${parseFloat(row.percent_change_1h).toFixed(2)}%`
                      : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.percent_change_24h !== "N/A"
                      ? `${parseFloat(row.percent_change_24h).toFixed(2)}%`
                      : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.percent_change_7d !== "N/A"
                      ? `${parseFloat(row.percent_change_7d).toFixed(2)}%`
                      : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.market_cap !== "N/A"
                      ? `$${row.market_cap.toLocaleString()}`
                      : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.volume_24h !== "N/A"
                      ? `$${row.volume_24h.toLocaleString()}`
                      : "N/A"}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#fff" }}>
                    {row.circulating_supply !== "N/A"
                      ? `${row.circulating_supply.toLocaleString()} BTC`
                      : "N/A"}
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
