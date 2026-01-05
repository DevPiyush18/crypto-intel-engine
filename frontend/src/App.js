import { useEffect, useState } from "react";

function App() {
  const [signal, setSignal] = useState({});
  const [regime, setRegime] = useState({});
  const [risk, setRisk] = useState({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/signal")
      .then(res => res.json())
      .then(data => setSignal(data));

    fetch("http://127.0.0.1:8000/regime")
      .then(res => res.json())
      .then(data => setRegime(data));

    fetch("http://127.0.0.1:8000/risk")
      .then(res => res.json())
      .then(data => setRisk(data));
  }, []);

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
    </div>
  );
}

export default App;
