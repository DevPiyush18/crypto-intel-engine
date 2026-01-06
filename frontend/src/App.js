import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js"

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement)

export default function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState(localStorage.getItem("token"))

  const [signal, setSignal] = useState({})
  const [regime, setRegime] = useState({})
  const [risk, setRisk] = useState({})
  const [prices, setPrices] = useState([])

  const API = "http://127.0.0.1:8000"

  const login = async () => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    localStorage.setItem("token", data.access_token)
    setToken(data.access_token)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }

  useEffect(() => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    const safeFetch = async (url, setter) => {
      try {
        const res = await fetch(url, { headers })
        if (!res.ok) return
        const data = await res.json()
        setter(data)
      } catch {}
    }

    const loadData = () => {
      safeFetch(`${API}/signal`, setSignal)
      safeFetch(`${API}/regime`, setRegime)
      safeFetch(`${API}/risk`, setRisk)
      safeFetch(`${API}/prices`, setPrices)
    }

    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [token])

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg text-white">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card p-10 rounded-2xl shadow-xl w-96 space-y-6">
          <h1 className="text-2xl font-bold text-center">Crypto Intelligence</h1>

          <input className="w-full p-3 rounded bg-bg border border-gray-700"
            placeholder="Email" onChange={e => setEmail(e.target.value)} />

          <input type="password" className="w-full p-3 rounded bg-bg border border-gray-700"
            placeholder="Password" onChange={e => setPassword(e.target.value)} />

          <button onClick={login}
            className="w-full bg-accent py-3 rounded text-white font-semibold hover:opacity-90 transition">
            Login
          </button>
        </motion.div>
      </div>
    )
  }

  const chartPrices = prices.length ? prices.map(p => p.price) : []
  const chartLabels = prices.length ? prices.map(p => new Date(p.timestamp).toLocaleTimeString()) : []

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: "BTC Price",
      data: chartPrices,
      borderColor: "#3B82F6",
      tension: 0.35
    }]
  }

  return (
    <div className="min-h-screen bg-bg text-white p-8">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Crypto Intelligence Dashboard</h1>
        <button onClick={logout} className="text-muted hover:text-white transition">Logout</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card title="Trade Signal" value={signal.signal} />
        <Card title="Market Regime" value={regime.regime} />
        <Card title="Crash Probability" value={risk.crash_probability} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-card p-6 rounded-2xl shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">Live BTC Price</h2>
        <Line data={chartData} />
      </motion.div>
    </div>
  )
}

function Card({ title, value }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }}
      className="bg-card p-6 rounded-2xl shadow-lg">
      <p className="text-muted mb-2">{title}</p>
      <h2 className="text-2xl font-bold">{value || "--"}</h2>
    </motion.div>
  )
}
