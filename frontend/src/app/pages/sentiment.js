export default function Sentiment() {
    return (
      <div className="p-4 h-[200px]">
          <div className=" border-b border-[#afafaf]">Sentiment Analysis</div>
          <div className="space-y-6 p-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Twitter Sentiment</span>
              <span className="text-white font-bold"> 🟢 Bullish (+72%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400"> News Sentiment</span>
              <span className="text-white font-bold">🔴 Bearish (-45%)</span>
            </div>
         
          </div>
      </div>
    );
  }