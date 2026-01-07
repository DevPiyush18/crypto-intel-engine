import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function PriceChart({ prices }) {
  if (!prices || prices.length === 0) return null;

  const data = {
    labels: prices.map(p => new Date(p.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Price",
        data: prices.map(p => p.price),
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  return <Line data={data} />;
}
