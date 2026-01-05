import { useState, useEffect } from "react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [signal, setSignal] = useState({});
  const [regime, setRegime] = useState({});
  const [risk, setRisk] = useState({});
  const [prices, setPrices] = useState([]);

  const login = async () => {
    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  useEffect(() => {
    if (!token) return;

    const loadData = () => {
      fetch("http://127.0.0.1:8000/signal", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setSignal(data));

      fetch("http://127.0.0.1:8000/regime", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setRegime(data));

      fetch("http://127.0.0.1:8000/risk", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setRisk(data));

      fetch("http://127.0.0.1:8000/prices", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setPrices(data));
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [token]);

  if (!token) {
    return (
      <div style={{ padding: 50 }}>
        <h2>Login</h2>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <br /><br />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <br /><br />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  const chartData = {
    labels: prices.map(p => new Date(p.timestamp).toLocaleTimeString()),
    datasets: [{ label: "BTC Price", data: prices.map(p => p.price), borderColor: "blue" }]
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Crypto Intelligence Dashboard</h1>
      <p>Signal: {signal.signal}</p>
      <p>Confidence: {signal.confidence}</p>
      <p>Regime: {regime.regime}</p>
      <p>Crash Probability: {risk.crash_probability}</p>
      <Line data={chartData} />
    </div>
  );
}

export default App;
