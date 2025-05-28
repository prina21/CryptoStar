import Image from "next/image";
import Dashboard from "./pages/dashboard";

export default function Home() {
  return (
    <div>
          <nav className="navbar flex items-center p-5 h-[50px]">
            CRYPTOSTAR
          </nav>
          <Dashboard></Dashboard>
    </div>
  );
}
