import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { PriorityBadge } from "../components/Badges";
import { fetchTickets, updateTicket } from "../features/tickets/ticketSlice";
import { socket } from "../app/socket";

const COLUMNS = ["Open", "In Progress", "Resolved"];

const priorityBorder = {
  Low: "border-l-[#8C8C7E]",
  Medium: "border-l-[#3D8A6E]",
  High: "border-l-[#C97A2F]",
  Critical: "border-l-[#B4423C]",
};

export default function Kanban() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.tickets);
  const [dragOverCol, setDragOverCol] = useState(null);

  useEffect(() => {
    dispatch(fetchTickets({}));

    // Refresh whenever any client creates/updates/deletes a ticket, so the
    // board stays in sync across tabs/users without a manual refresh.
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

  const handleDrop = (e, status) => {
    e.preventDefault();
    setDragOverCol(null);
    const ticketId = e.dataTransfer.getData("ticketId");
    const ticket = items.find((t) => t._id === ticketId);
    if (ticket && ticket.status !== status) {
      dispatch(updateTicket({ id: ticketId, updates: { status } }));
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-600 mb-1">Drag to update status</p>
        <h1 className="text-3xl font-display font-bold text-ink-950 dark:text-white">Board</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colTickets = items.filter((t) => t.status === col);
          return (
            <div
              key={col}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col)}
              className={`rounded-xl p-3 min-h-[400px] transition-colors ${
                dragOverCol === col ? "bg-accent-50 dark:bg-accent-500/10 border-2 border-dashed border-accent-400" : "bg-white/50 dark:bg-ink-800/50 border-2 border-dashed border-transparent"
              }`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-mono text-xs uppercase tracking-wide text-ink-700 dark:text-ink-300">{col}</h2>
                <span className="font-mono text-xs text-ink-600 dark:text-ink-300">{colTickets.length}</span>
              </div>

              <div className="space-y-2">
                {colTickets.map((ticket) => (
                  <Link
                    key={ticket._id}
                    to={`/tickets/${ticket._id}`}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("ticketId", ticket._id)}
                    className={`block bg-white border border-ink-800/10 dark:border-white/10 border-l-4 ${priorityBorder[ticket.priority] || "border-l-ink-800/20"} rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-ink-800/25 dark:hover:border-white/25 transition-colors`}
                  >
                    <p className="text-sm font-medium text-ink-950 dark:text-white mb-2 leading-snug">{ticket.title}</p>
                    <div className="flex items-center justify-between">
                      <PriorityBadge priority={ticket.priority} />
                      <span className="text-xs text-ink-600 dark:text-ink-300">{ticket.assignee?.name || "Unassigned"}</span>
                    </div>
                  </Link>
                ))}
                {colTickets.length === 0 && (
                  <p className="text-xs text-ink-600 text-center py-6">No tickets</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
