export default function Startegy() {
  return (
    <div className="grid-rows-2">
      <div className="card p-4 h-250">
        <div className="rounded-lg n-2 max-w-sm mx-auto">
          {/* Header */}

          <h2 className="border-b border-[#afafaf] text-white">
            Strategy & Performance Metrics
          </h2>

          {/* Strategy Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Strategy
            </label>
            <select className="w-full bg-gray-700 p-2 rounded-lg">
              <option value="trend-based">Trend Based Trading</option>
              <option value="mean-reversion">Mean Reversion</option>
              <option value="momentum">Momentum Trading</option>
            </select>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-6">
            <div className="flex justify-between">
              <span className="text-gray-400">24h PnL</span>
              <span className="text-green-600 font-bold">+5,200 +3.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Spread</span>
              <span className="text-white font-bold">0.15%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Execution Rate</span>
              <span className="text-white font-bold">92%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fees Earned</span>
              <span className="text-white font-bold">$3,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trade Volume</span>
              <span className="text-white font-bold">$5.6M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Win Rate</span>
              <span className="text-white font-bold">78%</span>
            </div>
          </div>
        </div>
      </div>
      <div className=" h-[200px] card">
        <div className="m-2 border-b border-[#afafaf]">Risk Metrics</div>
        <div className="space-y-2 p-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Max Drawdown</span>
              <span className="text-red-600 font-bold"> -$1,750 </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sharpe Ratio</span>
              <span className="text-white font-bold"> 1.8 </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Slippage Impact</span>
              <span className="text-white font-bold"> -0.03% </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Order Book Imbalance</span>
              <span className="text-white font-bold">+12%</span>
            </div>
         
          </div>
      </div>
    </div>
  );
}
