import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import Layout from "../components/Layout";
import { StatusBadge, PriorityBadge } from "../components/Badges";
import NewTicketModal from "../components/NewTicketModal";
import { fetchTickets } from "../features/tickets/ticketSlice";
import api from "../app/api";
import { socket } from "../app/socket";

const priorityBorder = {
  Low: "border-l-[#8C8C7E]",
  Medium: "border-l-[#3D8A6E]",
  High: "border-l-[#C97A2F]",
  Critical: "border-l-[#B4423C]",
};

export default function Tickets() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.tickets);
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users").then((res) => setUsers(res.data));
  }, []);

  useEffect(() => {
    const filters = {};
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.priority = priorityFilter;
    if (assigneeFilter) filters.assignee = assigneeFilter;
    if (search.trim()) filters.search = search.trim();

    // Debounce so we don't hit the search endpoint on every keystroke
    const timer = setTimeout(() => {
      dispatch(fetchTickets(filters));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, statusFilter, priorityFilter, assigneeFilter, search]);

  useEffect(() => {
    const refresh = () => dispatch(fetchTickets({}));
    socket.on("ticket:created", refresh);
    socket.on("ticket:updated", refresh);
    socket.on("ticket:deleted", refresh);
    return () => {
      socket.off("ticket:created", refresh);
      socket.off("ticket:updated", refresh);
      socket.off("ticket:deleted", refresh);
    };
  }, [dispatch]);

  const filtered = items;

  return (
    <Layout>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent-600 mb-1">
            {filtered.length} {filtered.length === 1 ? "ticket" : "tickets"}
          </p>
          <h1 className="text-3xl font-display font-bold text-ink-950 dark:text-white">Tickets</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-ink-950 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-ink-900 transition-colors"
        >
          <Plus size={16} /> New ticket
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-2.5 text-ink-600 dark:text-ink-300" />
          <input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-ink-800/15 dark:border-white/15 rounded-lg text-sm bg-white dark:bg-ink-900 text-ink-950 dark:text-white focus:outline-none focus:border-accent-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-ink-800/15 dark:border-white/15 rounded-lg text-sm bg-white dark:bg-ink-900 text-ink-950 dark:text-white"
        >
          <option value="">All statuses</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-ink-800/15 dark:border-white/15 rounded-lg text-sm bg-white dark:bg-ink-900 text-ink-950 dark:text-white"
        >
          <option value="">All priorities</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-ink-800/15 dark:border-white/15 rounded-lg text-sm bg-white dark:bg-ink-900 text-ink-950 dark:text-white"
        >
          <option value="">All assignees</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {status === "loading" && (
          <p className="text-ink-600 text-sm py-6 text-center">Loading tickets...</p>
        )}
        {status !== "loading" && filtered.length === 0 && (
          <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl py-12 text-center">
            <p className="text-ink-600 text-sm">No tickets match these filters.</p>
          </div>
        )}
        {filtered.map((ticket, i) => (
          <Link
            key={ticket._id}
            to={`/tickets/${ticket._id}`}
            className={`flex items-center justify-between bg-white border border-ink-800/10 dark:border-white/10 border-l-4 ${priorityBorder[ticket.priority] || "border-l-ink-800/20"} rounded-lg px-4 py-3.5 hover:border-ink-800/25 dark:hover:border-white/25 transition-colors group`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="font-mono text-xs text-ink-600 shrink-0">
                #{String(i + 1).padStart(3, "0")}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-ink-950 truncate group-hover:text-accent-600">
                  {ticket.title}
                </p>
                <p className="text-xs text-ink-600 dark:text-ink-300 mt-0.5">
                  {ticket.assignee?.name || "Unassigned"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0 ml-4">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </Link>
        ))}
      </div>

      {showModal && <NewTicketModal onClose={() => setShowModal(false)} />}
    </Layout>
  );
}
