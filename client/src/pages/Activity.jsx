import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, RefreshCw, MessageSquare, UserCog } from "lucide-react";
import Layout from "../components/Layout";
import api from "../app/api";
import { socket } from "../app/socket";

const typeConfig = {
  ticket_created: { icon: PlusCircle, color: "text-accent-600" },
  status_changed: { icon: RefreshCw, color: "text-amber-700" },
  comment_added: { icon: MessageSquare, color: "text-ink-700 dark:text-ink-300" },
  assignee_changed: { icon: UserCog, color: "text-ink-700 dark:text-ink-300" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Activity() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => api.get("/activity").then((res) => setActivity(res.data));
    load().then(() => setLoading(false));

    const refresh = () => load();
    socket.on("ticket:created", refresh);
    socket.on("ticket:updated", refresh);
    socket.on("comment:added", refresh);

    return () => {
      socket.off("ticket:created", refresh);
      socket.off("ticket:updated", refresh);
      socket.off("comment:added", refresh);
    };
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-600 mb-1">Audit log</p>
        <h1 className="text-3xl font-display font-bold text-ink-950 dark:text-white">Activity</h1>
      </div>

      <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl">
        {loading && <p className="text-ink-600 text-sm p-6 text-center">Loading...</p>}
        {!loading && activity.length === 0 && (
          <p className="text-ink-600 text-sm p-6 text-center">No activity yet.</p>
        )}
        {activity.map((entry, i) => {
          const config = typeConfig[entry.type] || typeConfig.status_changed;
          const Icon = config.icon;
          return (
            <div
              key={entry._id}
              className={`flex items-start gap-3 px-5 py-3.5 ${i !== activity.length - 1 ? "border-b border-ink-800/8 dark:border-white/10" : ""}`}
            >
              <Icon size={16} className={`${config.color} mt-0.5 shrink-0`} strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink-950 dark:text-white">
                  <span className="font-medium">{entry.actor?.name || "Someone"}</span>{" "}
                  {entry.message}
                </p>
                {entry.ticket && (
                  <Link
                    to={`/tickets/${entry.ticket._id}`}
                    className="text-xs text-accent-600 hover:underline"
                  >
                    View ticket
                  </Link>
                )}
              </div>
              <span className="text-xs font-mono text-ink-600 shrink-0">{timeAgo(entry.createdAt)}</span>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
