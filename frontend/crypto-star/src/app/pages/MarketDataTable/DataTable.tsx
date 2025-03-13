// // import * as React from 'react';
// // import axios from 'axios';
// // import Paper from '@mui/material/Paper';
// // import { DataGrid } from '@mui/x-data-grid';
// // import { useState, useEffect } from 'react';

// // const API_URL = "https://cors-anywhere.herokuapp.com/https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
// // // const API_KEY = "c84b8c11-38d1-4d79-87cf-e1bdad06ebe9"; 

// // const CryptoTable = () => {
// //   const [data, setData] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   const fetchData = async () => {
// //     try {
// //       const response = await fetch(API_URL, {
// //         method: "GET",
// //         headers: {
// //           "X-CMC_PRO_API_KEY": "c84b8c11-38d1-4d79-87cf-e1bdad06ebe9",
// //           "Accept": "application/json"
// //         }
// //       });

// //       if (!response.ok) throw new Error("Failed to fetch");

// //       const result = await response.json();
// //       const cryptoData = result.data.map((coin, index) => ({
// //         id: index + 1, // Required for DataGrid
// //         name: coin.name,
// //         symbol: coin.symbol,
// //         price: coin.quote.USD.price.toFixed(2),
// //         market_cap: coin.quote.USD.market_cap.toFixed(2),
// //         volume_24h: coin.quote.USD.volume_24h.toFixed(2),
// //         percent_change_24h: coin.quote.USD.percent_change_24h.toFixed(2),
// //       }));

// //       setData(cryptoData);
// //       setLoading(false);
// //     } catch (error) {
// //       console.error("Error fetching data:", error);
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchData(); // First fetch
// //     const interval = setInterval(fetchData, 10000); 
// //     return () => clearInterval(interval); 
// //   }, []);

// //   const columns = [
// //     { field: "name", headerName: "Name", width: 150 },
// //     { field: "symbol", headerName: "Symbol", width: 100 },
// //     { field: "price", headerName: "Price (USD)", width: 150 },
// //     { field: "market_cap", headerName: "Market Cap (USD)", width: 200 },
// //     { field: "volume_24h", headerName: "Volume (24h)", width: 200 },
// //     { field: "percent_change_24h", headerName: "Change (24h)", width: 150 },
// //   ];

// //   return (
// //     <Paper style={{ height: 400, width: "100%" }}>
// //       {loading ? (
// //         <div>Loading...</div>
// //       ) : (
// //         <DataGrid
// //           rows={data}
// //           columns={columns}
// //           checkboxSelection
// //           disableRowSelectionOnClick
// //           autoHeight
// //         />
// //       )}
// //     </Paper>
// //   );
// // };

// // export default CryptoTable;

// import React, { useEffect, useState } from "react";
// import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from "@mui/material";

// const CryptoTable = () => {
//   const [cryptoData, setCryptoData] = useState([]);
//   const [loading, setLoading] = useState(true);  // To handle loading state

//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/crypto")
//       .then((response) => response.json())
//       .then((data) => {
//         if (data && data.data) {
//           setCryptoData(data.data);
//         }
//         setLoading(false);  // Set loading to false after data is fetched
//       })
//       .catch((error) => {
//         console.error("Error fetching crypto data:", error);
//         setLoading(false);
//       });
//   }, []);

//   const rows = cryptoData.map((crypto) => {
//     const price = crypto.quote?.USD?.price ?? "N/A";
//     const percent_change_1h = crypto.quote?.USD?.percent_change_1h ?? "N/A";
//     const percent_change_24h = crypto.quote?.USD?.percent_change_24h ?? "N/A";
//     const percent_change_7d = crypto.quote?.USD?.percent_change_7d ?? "N/A";
//     const market_cap = crypto.quote?.USD?.market_cap ?? "N/A";
//     const volume_24h = crypto.quote?.USD?.volume_24h ?? "N/A";
//     const circulating_supply = crypto.circulating_supply ?? "N/A";

//     const iconUrl = `https://s2.coinmarketcap.com/static/img/coins/64x64/${crypto.id}.png`;

//     return {
//       id: crypto.id,
//       symbol: crypto.symbol,
//       name: crypto.name,
//       price: price,
//       percent_change_1h: percent_change_1h,
//       percent_change_24h: percent_change_24h,
//       percent_change_7d: percent_change_7d,
//       market_cap: market_cap,
//       volume_24h: volume_24h,
//       circulating_supply: circulating_supply,
//       iconUrl: iconUrl,  // Adding icon URL
//     };
//   });

//   return (
//     <Box sx={{ width: "100%", backgroundColor: "#000", color: "#fff", padding: "20px" }}>
//       {/* Add a circular progress indicator while the data is loading */}
//       {loading ? (
//         <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
//           <CircularProgress sx={{ color: "#fff" }} />
//         </Box>
//       ) : (
//         <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: "auto", backgroundColor: "#000" }}>
//           <Table sx={{ minWidth: 650 }} aria-label="simple table">
//             <TableHead>
//               <TableRow>
//                 <TableCell style={{ color: "#fff" }}>Symbol</TableCell>
//                 <TableCell style={{ color: "#fff" }}>Name</TableCell>
//                 <TableCell style={{ color: "#fff" }} align="right">Price</TableCell>
//                 <TableCell style={{ color: "#fff" }} align="right">1h %</TableCell>
//                 <TableCell style={{ color: "#fff" }} align="right">24h %</TableCell>
//                 <TableCell style={{ color: "#fff" }} align="right">7d %</TableCell>
//                 <TableCell style={{ color: "#fff" }} align="right">Market Cap</TableCell>
//                 <TableCell style={{ color: "#fff" }} align="right">Volume (24h)</TableCell>
//                 <TableCell style={{ color: "#fff" }} align="right">Circulating Supply</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {rows.map((row) => (
//                 <TableRow key={row.id}>
//                   <TableCell component="th" scope="row" sx={{ color: "#fff" }}>
//                     <Box sx={{ display: "flex", alignItems: "center" }}>
//                       <img src={row.iconUrl} alt={row.symbol} style={{ width: "24px", height: "24px", marginRight: "10px" }} />
//                       {row.symbol}
//                     </Box>
//                   </TableCell>
//                   <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
//                   <TableCell align="right" sx={{ color: "#fff" }}>
//                     {row.price !== "N/A" ? `$${parseFloat(row.price).toFixed(2)}` : "N/A"}
//                   </TableCell>
//                   <TableCell align="right" sx={{ color: "#fff" }}>
//                     {row.percent_change_1h !== "N/A" ? `${parseFloat(row.percent_change_1h).toFixed(2)}%` : "N/A"}
//                   </TableCell>
//                   <TableCell align="right" sx={{ color: "#fff" }}>
//                     {row.percent_change_24h !== "N/A" ? `${parseFloat(row.percent_change_24h).toFixed(2)}%` : "N/A"}
//                   </TableCell>
//                   <TableCell align="right" sx={{ color: "#fff" }}>
//                     {row.percent_change_7d !== "N/A" ? `${parseFloat(row.percent_change_7d).toFixed(2)}%` : "N/A"}
//                   </TableCell>
//                   <TableCell align="right" sx={{ color: "#fff" }}>
//                     {row.market_cap !== "N/A" ? `$${row.market_cap.toLocaleString()}` : "N/A"}
//                   </TableCell>
//                   <TableCell align="right" sx={{ color: "#fff" }}>
//                     {row.volume_24h !== "N/A" ? `$${row.volume_24h.toLocaleString()}` : "N/A"}
//                   </TableCell>
//                   <TableCell align="right" sx={{ color: "#fff" }}>
//                     {row.circulating_supply !== "N/A" ? `${row.circulating_supply.toLocaleString()} BTC` : "N/A"}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}
//     </Box>
//   );
// };

// export default CryptoTable;




// // import React, { useEffect, useState } from "react";
// // import { DataGrid } from "@mui/x-data-grid";
// // import { Box } from "@mui/material";

// // const CryptoTable = () => {
// //   const [cryptoData, setCryptoData] = useState([]);

// //   useEffect(() => {
// //     fetch("http://127.0.0.1:8000/crypto")
// //       .then((response) => response.json())
// //       .then((data) => {
// //         console.log(data);
// //         if (data && data.data) {
// //           setCryptoData(data.data);
// //         }
// //       })
// //       .catch((error) => console.error("Error fetching crypto data:", error));
// //   }, []);

// //   const columns = [
// //     { field: "symbol", headerName: "Symbol", width: 100 },
// //     { field: "name", headerName: "Name", width: 150 },
// //     {
// //       field: "price",
// //       headerName: "Price",
// //       width: 130,
// //       valueFormatter: ({ value }) => {
// //         // Safely format the price value with fallback to "N/A"
// //         if (value !== undefined && value !== "N/A") {
// //           return `$${parseFloat(value).toFixed(2)}`;
// //         } else {
// //           return "N/A";
// //         }
// //       },
// //     },
// //     {
// //       field: "percent_change_1h",
// //       headerName: "1h %",
// //       width: 100,
// //       valueFormatter: ({ value }) =>
// //         value !== undefined ? `${value.toFixed(2)}%` : "N/A",
// //     },
// //     {
// //       field: "percent_change_24h",
// //       headerName: "24h %",
// //       width: 100,
// //       valueFormatter: ({ value }) =>
// //         value !== undefined ? `${value.toFixed(2)}%` : "N/A",
// //     },
// //     {
// //       field: "percent_change_7d",
// //       headerName: "7d %",
// //       width: 100,
// //       valueFormatter: ({ value }) =>
// //         value !== undefined ? `${value.toFixed(2)}%` : "N/A",
// //     },
// //     {
// //       field: "market_cap",
// //       headerName: "Market Cap",
// //       width: 170,
// //       valueFormatter: ({ value }) =>
// //         value !== undefined ? `$${value.toLocaleString()}` : "N/A",
// //     },
// //     {
// //       field: "volume_24h",
// //       headerName: "Volume(24h)",
// //       width: 170,
// //       valueFormatter: ({ value }) =>
// //         value !== undefined ? `$${value.toLocaleString()}` : "N/A",
// //     },
// //     {
// //       field: "circulating_supply",
// //       headerName: "Circulating Supply",
// //       width: 170,
// //       valueFormatter: ({ value }) =>
// //         value !== undefined ? `${value.toLocaleString()} BTC` : "N/A",
// //     },
// //   ];

// //   const rows = cryptoData.map((crypto) => {

// //     const price = crypto.quote?.USD?.price ?? "N/A";
// //     const percent_change_1h = crypto.quote?.USD?.percent_change_1h ?? "N/A";
// //     const percent_change_24h = crypto.quote?.USD?.percent_change_24h ?? "N/A";
// //     const percent_change_7d = crypto.quote?.USD?.percent_change_7d ?? "N/A";
// //     const market_cap = crypto.quote?.USD?.market_cap ?? "N/A";
// //     const volume_24h = crypto.quote?.USD?.volume_24h ?? "N/A";
// //     const circulating_supply = crypto.circulating_supply ?? "N/A";

// //     return {
// //       id: crypto.id,
// //       symbol: crypto.symbol,
// //       name: crypto.name,
// //       price: price, // ensure we are passing a value (either a number or "N/A")
// //       percent_change_1h: percent_change_1h,
// //       percent_change_24h: percent_change_24h,
// //       percent_change_7d: percent_change_7d,
// //       market_cap: market_cap,
// //       volume_24h: volume_24h,
// //       circulating_supply: circulating_supply,
// //     };
// //   });

// //   return (
// //     <div style={{ height: 600, width: "100%", backgroundColor: "#000", color: "#800080" }}>
// //       <DataGrid
// //         rows={rows}
// //         columns={columns}
// //         getRowId={(row) => row.symbol}
// //         sx={{
// //           "& .MuiDataGrid-root": { backgroundColor: "#000", color: "#fff" },
// //           "& .MuiDataGrid-columnHeaders": { backgroundColor: "#000", color: "#fff" },
// //           "& .MuiDataGrid-cell": { color: "#fff" },
// //         }}
// //       />
// //     </div>
// //   );
// // };

// // export default CryptoTable;