import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { Ticket, CheckCircle2, Clock, TrendingUp, Plus, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import { StatusBadge, PriorityBadge } from "../components/Badges";
import NewTicketModal from "../components/NewTicketModal";
import { fetchSummary } from "../features/dashboard/dashboardSlice";
import { fetchTickets } from "../features/tickets/ticketSlice";
import { socket } from "../app/socket";

const STATUS_COLORS = { Open: "#1E2723", "In Progress": "#C97A2F", Resolved: "#256B52" };
const RANGES = [
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "all", label: "All time" },
];

function StatCard({ icon: Icon, label, value, tone, chip }) {
  return (
    <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-5 flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-600 dark:text-ink-300 font-mono mb-2">{label}</p>
        <p className={`text-3xl font-display font-bold ${tone || "text-ink-950 dark:text-white"}`}>{value}</p>
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${chip || "bg-accent-50 text-accent-600"}`}>
        <Icon size={16} strokeWidth={2} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { summary, status } = useSelector((state) => state.dashboard);
  const { items: tickets } = useSelector((state) => state.tickets);
  const [range, setRange] = useState("30d");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchSummary(range));
    dispatch(fetchTickets({}));
  }, [dispatch, range]);

  useEffect(() => {
    const refresh = () => {
      dispatch(fetchSummary(range));
      dispatch(fetchTickets({}));
    };
    socket.on("ticket:created", refresh);
    socket.on("ticket:updated", refresh);
    return () => {
      socket.off("ticket:created", refresh);
      socket.off("ticket:updated", refresh);
    };
  }, [dispatch, range]);

  if (status === "loading" || !summary) {
    return (
      <Layout>
        <p className="text-ink-600">Loading dashboard...</p>
      </Layout>
    );
  }

  const openCount = summary.byStatus.find((s) => s.status === "Open")?.count || 0;
  const inProgressCount = summary.byStatus.find((s) => s.status === "In Progress")?.count || 0;
  const myTickets = tickets.filter((t) => t.assignee?._id === user?.id || t.assignee === user?.id).slice(0, 6);
  const recentTickets = tickets.slice(0, 5);

  return (
    <Layout>
      {/* Welcome header */}
      <div className="flex items-start justify-between mb-7 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-950 dark:text-white mb-1">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-ink-600 dark:text-ink-300">Here's what's happening across the team today.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-ink-950 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-ink-900 transition-colors"
        >
          <Plus size={16} /> New ticket
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={Ticket} label="Total" value={summary.total} chip="bg-accent-50 text-accent-600" />
        <StatCard icon={Clock} label="Open" value={openCount} chip="bg-ink-800/5 text-ink-700" />
        <StatCard icon={TrendingUp} label="In progress" value={inProgressCount} tone="text-amber-700" chip="bg-amber-50 text-amber-700" />
        <StatCard icon={CheckCircle2} label="Resolution rate" value={`${summary.resolutionRate}%`} tone="text-accent-600" chip="bg-accent-50 text-accent-600" />
      </div>

      {/* Main two-column: ticket overview + my tickets panel */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="col-span-2 bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-800/8 dark:border-white/10">
            <h2 className="font-display font-bold text-ink-950 dark:text-white">Recent tickets</h2>
            <Link to="/tickets" className="flex items-center gap-1 text-xs font-medium text-accent-600 hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-ink-800/8 dark:divide-white/10">
            {recentTickets.length === 0 && (
              <p className="text-sm text-ink-600 p-5">No tickets yet.</p>
            )}
            {recentTickets.map((t) => (
              <Link
                key={t._id}
                to={`/tickets/${t._id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-paper-alt dark:hover:bg-ink-900 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-950 dark:text-white truncate">{t.title}</p>
                  <p className="text-xs text-ink-600 mt-0.5">{t.assignee?.name || "Unassigned"}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-800/8 dark:border-white/10">
            <h2 className="font-display font-bold text-ink-950 dark:text-white text-sm">My tickets</h2>
            <span className="font-mono text-xs bg-accent-50 text-accent-700 px-2 py-0.5 rounded-full">
              {myTickets.length}
            </span>
          </div>
          <div className="divide-y divide-ink-800/8 dark:divide-white/10">
            {myTickets.length === 0 && (
              <p className="text-sm text-ink-600 p-5">Nothing assigned to you.</p>
            )}
            {myTickets.map((t) => (
              <Link
                key={t._id}
                to={`/tickets/${t._id}`}
                className="block px-5 py-3 hover:bg-paper-alt dark:hover:bg-ink-900 transition-colors"
              >
                <p className="text-sm font-medium text-ink-950 dark:text-white truncate mb-1">{t.title}</p>
                <PriorityBadge priority={t.priority} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Range selector for charts */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-ink-950 dark:text-white">Analytics</h2>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                range === r.key
                  ? "bg-ink-950 text-white border-ink-950"
                  : "border-ink-800/15 dark:border-white/15 text-ink-700 dark:text-ink-300 hover:border-ink-800/30 dark:hover:border-white/30"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-5">
          <h3 className="font-mono text-xs uppercase tracking-wide text-ink-600 dark:text-ink-300 mb-4">By status</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={summary.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={(e) => `${e.status}: ${e.count}`}>
                {summary.byStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#8C8C7E"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-5">
          <h3 className="font-mono text-xs uppercase tracking-wide text-ink-600 dark:text-ink-300 mb-4">By priority</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={summary.byPriority}>
              <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#256B52" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-5">
          <h3 className="font-mono text-xs uppercase tracking-wide text-ink-600 dark:text-ink-300 mb-4">Tickets created — last 14 days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={summary.trend}>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#256B52" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-5">
          <h3 className="font-mono text-xs uppercase tracking-wide text-ink-600 dark:text-ink-300 mb-4">Workload by assignee</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={summary.workload} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="#C97A2F" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showModal && <NewTicketModal onClose={() => setShowModal(false)} />}
    </Layout>
  );
}
