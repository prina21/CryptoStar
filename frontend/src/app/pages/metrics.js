// import { useEffect, useState } from 'react';

export default function Metrics() {
//   const [metrics, setMetrics] = useState(null);

//   useEffect(() => {
//     fetch('http://localhost:8000/api/risk-metrics')
//       .then(res => res.json())
//       .then(setMetrics);
//   }, []);

//   if (!metrics) return <p>Loading...</p>;

//   return (
//     <div>
//       <h1>Hello risk</h1>
//       <h2>Risk Metrics</h2>
//       <p><strong>Symbol:</strong> {metrics.symbol}</p>
//       <p><strong>Strategy:</strong> {metrics.strategy}</p>
//       <p><strong>Max Drawdown:</strong> {(metrics.max_drawdown * 100).toFixed(2)}%</p>
//       <p><strong>Sharpe Ratio:</strong> {metrics.sharpe_ratio.toFixed(2)}</p>
//       <p><strong>Generated At:</strong> {metrics.created_at}</p>
//     </div>
//   );
}