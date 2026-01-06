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

const API = "http://127.0.0.1:8000"

export default function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState(localStorage.getItem("token"))

  const [signal, setSignal] = useState({})
  const [regime, setRegime] = useState({})
  const [risk, setRisk] = useState({})
  const [prices, setPrices] = useState([])

  const [profile, setProfile] = useState({ risk: "Medium", horizon: "Mid", strategy: "Balanced" })
  const [portfolio, setPortfolio] = useState([{ asset: "BTC", allocation: 100 }])

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

  const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {}

  useEffect(() => {
    if (!token) return

    const loadData = async () => {
      const fetcher = async (url, setter) => {
        try {
          const res = await fetch(url, { headers })
          if (!res.ok) return
          setter(await res.json())
        } catch {}
      }

      fetcher(`${API}/signal`, setSignal)
      fetcher(`${API}/regime`, setRegime)
      fetcher(`${API}/risk`, setRisk)
      fetcher(`${API}/prices`, setPrices)
      fetcher(`${API}/profile`, setProfile)
      fetcher(`${API}/portfolio`, setPortfolio)
    }

    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [token])

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg text-white">
        <motion.div className="bg-card p-10 rounded-2xl shadow-xl w-96 space-y-6">
          <h1 className="text-2xl font-bold text-center">Crypto Intelligence</h1>
          <input className="w-full p-3 rounded bg-bg border border-gray-700" placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input type="password" className="w-full p-3 rounded bg-bg border border-gray-700" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button onClick={login} className="w-full bg-accent py-3 rounded font-semibold">Login</button>
        </motion.div>
      </div>
    )
  }

  const saveProfile = async () => {
    await fetch(`${API}/profile`, { method: "POST", headers, body: JSON.stringify(profile) })
  }

  const savePortfolio = async () => {
    await fetch(`${API}/portfolio`, { method: "POST", headers, body: JSON.stringify(portfolio) })
  }

  const chartData = {
    labels: prices.map(p => new Date(p.timestamp).toLocaleTimeString()),
    datasets: [{ label: "BTC Price", data: prices.map(p => p.price), borderColor: "#3B82F6", tension: 0.35 }]
  }

  return (
    <div className="min-h-screen bg-bg text-white p-8 space-y-10">

      <header className="flex justify-between">
        <h1 className="text-3xl font-bold">Crypto Intelligence</h1>
        <button onClick={logout} className="text-muted hover:text-white">Logout</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card title="Trading Profile">
          <Select label="Risk" value={profile.risk} options={["Low","Medium","High"]} onChange={v => setProfile({ ...profile, risk: v })} />
          <Select label="Horizon" value={profile.horizon} options={["Short","Mid","Long"]} onChange={v => setProfile({ ...profile, horizon: v })} />
          <Select label="Strategy" value={profile.strategy} options={["Conservative","Balanced","Aggressive"]} onChange={v => setProfile({ ...profile, strategy: v })} />
          <button onClick={saveProfile} className="mt-4 bg-accent px-4 py-2 rounded">Save Profile</button>
        </Card>

        <Card title="Portfolio">
          {portfolio.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input className="flex-1 bg-bg border p-2 rounded" value={p.asset} onChange={e => {
                const arr = [...portfolio]; arr[i].asset = e.target.value; setPortfolio(arr)
              }} />
              <input className="w-24 bg-bg border p-2 rounded" type="number" value={p.allocation} onChange={e => {
                const arr = [...portfolio]; arr[i].allocation = parseFloat(e.target.value); setPortfolio(arr)
              }} />
            </div>
          ))}
          <button onClick={() => setPortfolio([...portfolio, { asset: "", allocation: 0 }])} className="mt-3 text-accent">+ Add Asset</button>
          <button onClick={savePortfolio} className="mt-4 bg-accent px-4 py-2 rounded">Save Portfolio</button>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Trade Signal">{signal.signal}</Card>
        <Card title="Market Regime">{regime.regime}</Card>
        <Card title="Crash Probability">{risk.crash_probability}</Card>
      </div>

      <Card title="Live BTC Price">
        <Line data={chartData} />
      </Card>

    </div>
  )
}

function Card({ title, children }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-card p-6 rounded-2xl shadow-xl space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </motion.div>
  )
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <p className="text-muted mb-1">{label}</p>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-bg border p-2 rounded">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}
