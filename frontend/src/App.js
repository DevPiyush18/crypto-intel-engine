import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function App() {
  const [signal, setSignal] = useState({});
  const [regime, setRegime] = useState({});
  const [risk, setRisk] = useState({});
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const loadData = () => {
      fetch("http://127.0.0.1:8000/signal")
        .then(res => res.json())
        .then(data => setSignal(data));

      fetch("http://127.0.0.1:8000/regime")
        .then(res => res.json())
        .then(data => setRegime(data));

      fetch("http://127.0.0.1:8000/risk")
        .then(res => res.json())
        .then(data => setRisk(data));

      fetch("http://127.0.0.1:8000/prices")
        .then(res => res.json())
        .then(data => setPrices(data));
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: prices.map(p => new Date(p.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "BTC Price",
        data: prices.map(p => p.price),
        borderColor: "blue",
        fill: false
      }
    ]
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Crypto Intelligence Dashboard</h1>

      <div style={{ marginTop: 30 }}>
        <h3>Trade Signal</h3>
        <p>Action: {signal.signal}</p>
        <p>Confidence: {signal.confidence}</p>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>Market Regime</h3>
        <p>{regime.regime}</p>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>Risk Metrics</h3>
        <p>Crash Probability: {risk.crash_probability}</p>
      </div>

      <div style={{ marginTop: 40 }}>
        <h3>Live Price Chart</h3>
        <Line data={chartData} />
      </div>
    </div>
  );
}

export default App;
