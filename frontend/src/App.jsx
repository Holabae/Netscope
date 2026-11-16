
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Activity,
  Globe,
  Network,
  Clock,
  RefreshCw,
  Send,
  ShieldCheck,
  AlertTriangle,
  Server,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import "./App.css";

const API = "http://localhost:5000";

function mergeLogs(existing, incoming) {
  const map = new Map();

  [...incoming, ...existing].forEach((log) => {
    map.set(log.id, log);
  });

  return [...map.values()]
    .sort((a, b) => b.id - a.id)
    .slice(0, 100);
}

function App() {
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  // Fetch previous logs and connect to live updates
  useEffect(() => {
    let active = true;

    axios
      .get(`${API}/api/logs`)
      .then((response) => {
        if (active) setLogs(response.data);
      })
      .catch(() => {
        if (active) setError("Could not load request logs.");
      });

    const socket = io(API);

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("new-log", (newLog) => {
      if (active) {
        setLogs((previous) => mergeLogs(previous, [newLog]));
      }
    });

    return () => {
      active = false;
      socket.disconnect();
    };
  }, []);

  // Dashboard statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const uniqueIPs = new Set(logs.map((log) => log.ip_address)).size;
    const countries = new Set(
      logs.map((log) => log.country || "Unknown")
    ).size;

    const averageTime = total
      ? Math.round(
          logs.reduce(
            (sum, log) => sum + Number(log.response_time || 0),
            0
          ) / total
        )
      : 0;

    return { total, uniqueIPs, countries, averageTime };
  }, [logs]);

  // Requests grouped by country
  const countryData = useMemo(() => {
    const grouped = {};

    logs.forEach((log) => {
      const country = log.country || "Unknown";
      grouped[country] = (grouped[country] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([country, requests]) => ({ country, requests }))
      .sort((a, b) => b.requests - a.requests);
  }, [logs]);

  // HTTP status groups
  const statusData = useMemo(() => {
    const groups = {
      "2xx Success": 0,
      "3xx Redirect": 0,
      "4xx Client Error": 0,
      "5xx Server Error": 0,
      Other: 0,
    };

    logs.forEach((log) => {
      const status = Number(log.status_code);

      if (status >= 200 && status < 300) groups["2xx Success"]++;
      else if (status >= 300 && status < 400) groups["3xx Redirect"]++;
      else if (status >= 400 && status < 500) groups["4xx Client Error"]++;
      else if (status >= 500 && status < 600) groups["5xx Server Error"]++;
      else groups.Other++;
    });

    return Object.entries(groups)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [logs]);

  const statusColors = ["#22c55e", "#38bdf8", "#f59e0b", "#ef4444", "#a78bfa"];

  // Generate simulated traffic
  const generateTraffic = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API}/api/simulate`, {
        count: Number(count),
      });

      setLogs((previous) =>
        mergeLogs(previous, response.data.logs)
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to generate traffic. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (status >= 200 && status < 300) return "status-success";
    if (status >= 300 && status < 400) return "status-redirect";
    if (status >= 400 && status < 500) return "status-warning";
    return "status-danger";
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Activity size={23} />
          </div>
          <div>
            <h2>NetScope</h2>
            <span>Traffic Monitor</span>
          </div>
        </div>

        <div className="nav-label">MONITORING</div>

        <div className="nav-item active">
          <Activity size={18} />
          <span>Overview</span>
        </div>

        <div className="nav-item">
          <Globe size={18} />
          <span>IP Analytics</span>
        </div>

        <div className="nav-item">
          <Server size={18} />
          <span>Request Logs</span>
        </div>

        <div className="sidebar-bottom">
          <ShieldCheck size={18} />
          <div>
            <strong>System status</strong>
            <span>Backend monitoring</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">NETWORK ANALYTICS</p>
            <h1>Dashboard Overview</h1>
            <p className="subtitle">
              Monitor simulated web traffic and IP activity.
            </p>
          </div>

          <div className="connection">
            <span className={`connection-dot ${connected ? "online" : ""}`} />
            {connected ? "Live connection" : "Disconnected"}
          </div>
        </header>

        {error && (
          <div className="error-message">
            <AlertTriangle size={17} />
            {error}
          </div>
        )}

        <section className="stats-grid">
          <StatCard
            title="Total Requests"
            value={stats.total}
            icon={<Activity />}
            description="Latest 100 stored requests"
          />

          <StatCard
            title="Unique IP Addresses"
            value={stats.uniqueIPs}
            icon={<Network />}
            description="Distinct visitor IPs"
          />

          <StatCard
            title="Countries Detected"
            value={stats.countries}
            icon={<Globe />}
            description="Countries in current logs"
          />

          <StatCard
            title="Average Response Time"
            value={`${stats.averageTime} ms`}
            icon={<Clock />}
            description="Average of loaded requests"
          />
        </section>

        <section className="charts-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Requests by Country</h3>
                <p>Traffic distribution by country</p>
              </div>
              <Globe size={20} />
            </div>

            <div className="chart-area">
              {countryData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#293449"
                    />
                    <XAxis
                      dataKey="country"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke="#94a3b8"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#172033",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="requests"
                      fill="#38bdf8"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>HTTP Status Distribution</h3>
                <p>Response status categories</p>
              </div>
              <Activity size={20} />
            </div>

            <div className="chart-area">
              {statusData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={90}
                      innerRadius={52}
                      paddingAngle={3}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={statusColors[index % statusColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </section>

        <section className="panel simulator-panel">
          <div>
            <h3>Traffic Simulator</h3>
            <p>
              Generate simulated web requests from different IP addresses.
            </p>
          </div>

          <div className="simulator-controls">
            <label htmlFor="request-count">Number of requests</label>
            <input
              id="request-count"
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(event) => {
                const value = event.target.value;
                setCount(value === "" ? "" : Math.min(50, Math.max(1, Number(value))));
              }}
            />

            <button
              onClick={generateTraffic}
              disabled={loading || count === "" || Number(count) < 1}
            >
              {loading ? (
                <RefreshCw className="spin" size={17} />
              ) : (
                <Send size={17} />
              )}
              {loading ? "Generating..." : "Generate Traffic"}
            </button>
          </div>
        </section>

        <section className="panel logs-panel">
          <div className="panel-heading logs-heading">
            <div>
              <h3>Recent Request Logs</h3>
              <p>Latest requests received by the server</p>
            </div>
            <span className="log-count">{logs.length} records</span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>IP Address</th>
                  <th>Country</th>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Response Time</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {logs.length ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>#{log.id}</td>
                      <td className="ip-address">{log.ip_address}</td>
                      <td>{log.country || "Unknown"}</td>
                      <td>
                        <span className="method-tag">{log.method}</span>
                      </td>
                      <td className="endpoint">{log.endpoint}</td>
                      <td>
                        <span className={`status-tag ${getStatusClass(log.status_code)}`}>
                          {log.status_code}
                        </span>
                      </td>
                      <td>{log.response_time} ms</td>
                      <td className="timestamp">{log.timestamp}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-table">
                      No requests yet. Generate traffic to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer>
          NetScope IP Traffic Monitor · Development dashboard
        </footer>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, description }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <h2>{value}</h2>
      <p>{description}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      Generate some traffic to display analytics.
    </div>
  );
}

export default App;
