export default function Orderbook() {
  // Sample data for the order book
  const orderBookData = [
    { price: 79020.44, amount: 0.0033, total: 7.29, type: "bid" },
    { price: 79020.05, amount: 0.05395, total: 4.26, type: "bid" },
    { price: 79019.65, amount: 0.0668, total: 5.28, type: "bid" },
    { price: 79019.26, amount: 0.04668, total: 3.69, type: "bid" },
    // { price: 79018.86, amount: 0.04613, total: 3.65, type: "bid" },
    // { price: 79018.47, amount: 0.07491, total: 5.92, type: "bid" },
    // { price: 79018.07, amount: 0.06854, total: 5.42, type: "bid" },
    // { price: 79017.28, amount: 0.12525, total: 9.9, type: "bid" },
    // { price: 79016.84, amount: 0.00025, total: 19.754, type: "bid" },
    { price: 79006.99, amount: null, total: null, type: "divider" }, // Divider row
    { price: 79004.04, amount: 0.06333, total: 5.0, type: "ask" },
    { price: 79004.0, amount: 0.17134, total: 13.54, type: "ask" },
    { price: 79003.6, amount: 0.11536, total: 9.11, type: "ask" },
    { price: 79003.21, amount: 0.15655, total: 12.37, type: "ask" },
    // { price: 79002.81, amount: 0.15407, total: 12.17, type: "ask" },
    // { price: 79002.42, amount: 0.13755, total: 10.87, type: "ask" },
    // { price: 79002.02, amount: 0.10397, total: 8.21, type: "ask" },
    // { price: 79001.63, amount: 0.09133, total: 7.22, type: "ask" },
  ];

  return (
    <div className="card min-h-[200px] max-h-[450px] overflow-y-auto scrollbar-hide  rounded-lg p-4">
      <h2 className=" border-b border-[#afafaf] text-white">Order Book</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-gray-400">
            <th className="text-sm p-2 text-left">Price (USDT)</th>
            <th className="text-sm p-2 text-left">Amount (BTC)</th>
            <th className="text-sm p-2 text-left">Total (USDT)</th>
          </tr>
        </thead>
        <tbody>
          {orderBookData.map((order, index) =>
            order.type === "divider" ? (
              <tr key={index}>
                <td colSpan="3" className=" text-start p-2 text-gray-400">
                 <span className="text-red-400 text-lg "> 79,006.99 ↓</span> ≈ $ 78,943.78
                </td>
              </tr>
            ) : (
              <tr
                key={index}
                className={`${
                  order.type === "bid" ? "text-green-400" : "text-red-400"
                } text-sm  border-b border-transparent hover:bg-gray-800 transition-colors`}
              >
                <td className="p-2">{order.price.toLocaleString()}</td>
                <td className="p-2">{order.amount?.toFixed(4) || ""}</td>
                <td className="p-2">{order.total ? `${order.total}K` : ""}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
