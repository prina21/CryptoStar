"use client";

import Image from "next/image";
import Dashboard from "./pages/dashboard";
import CryptoTicker from "./pages/CryptoTicker";
import Avatar from "@mui/material/Avatar";
import { deepPurple } from "@mui/material/colors";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div>
         <nav className="navbar flex items-center justify-between p-5 h-[50px]">
        <div>CryptAI</div>
         <div className="flex items-center">
          <Avatar
            sx={{ bgcolor: deepPurple[500] }}
            src="https://source.unsplash.com/150x150/?abstract,geometric"
            alt="Backtesting Module"
            className="hover:scale-110 transition-all duration-300 ease-in-out"
            onClick={() => router.push("/backtest")} 
          />
          </div>
        <div className="flex items-center">
          <Avatar
            sx={{ bgcolor: deepPurple[500] }}
            src="https://source.unsplash.com/150x150/?abstract,geometric"
            alt="User Portfolio"
            className="hover:scale-110 transition-all duration-300 ease-in-out"
            onClick={() => router.push("/portfolio")}
          />
        </div>
      </nav>
      <CryptoTicker />

      <Dashboard />
    </div>
  );
}
