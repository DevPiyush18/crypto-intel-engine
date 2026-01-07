import React, { useEffect, useState } from "react";
import "./App.css";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const API = "http://localhost:8000";

export default function App() {
  const [user, setUser] = useState(null);
  const [signal, setSignal] = useState(null);
  const [risk, setRisk] = useState(null);
  const [regime, setRegime] = useState(null);
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    fetch(`${API}/me`, { credentials: "include" })
      .then(r => r.json())
      .then(setUser);

    fetch(`${API}/signal`, { credentials: "include" })
      .then(r => r.json())
      .then(setSignal);

    fetch(`${API}/risk`, { credentials: "include" })
      .then(r => r.json())
      .then(setRisk);

    fetch(`${API}/regime`, { credentials: "include" })
      .then(r => r.json())
      .then(setRegime);

    fetch(`${API}/prices`, { credentials: "include" })
      .then(r => r.json())
      .then(setPrices);
  }, []);

  const logout = () => {
    fetch(`${API}/logout`, { credentials: "include" })
      .then(() => window.location.reload());
  };

  if (!user) return <div className="loading">Loading…</div>;

  return (
    <div className="app">
      <header>
        <h1>Crypto Intelligence Engine</h1>
        <div className="user">{user.email}</div>
      </header>

      <div className="tabs">
        <button>Signal</button>
        <button>Risk</button>
        <button>Regime</button>
        <button>Prices</button>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Signal</h3>
          <p>{signal?.signal} ({(signal?.confidence * 100).toFixed(1)}%)</p>
        </div>

        <div className="card">
          <h3>Risk</h3>
          <p>{(risk?.crash_probability * 100).toFixed(2)}%</p>
        </div>

        <div className="card">
          <h3>Market Regime</h3>
          <p>{regime?.regime}</p>
        </div>
      </div>

      <div className="chart">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={prices}>
            <XAxis dataKey="timestamp" hide />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#4da3ff" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <button className="logout" onClick={logout}>Logout</button>
    </div>
  );
}
