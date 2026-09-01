import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Trash2, Clock, Send } from "lucide-react";
import api from "../app/api";
import Layout from "../components/Layout";
import { StatusBadge, PriorityBadge } from "../components/Badges";
import { updateTicket, deleteTicket } from "../features/tickets/ticketSlice";

export default function TicketDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const loadTicket = () => {
    api.get(`/tickets/${id}`).then((res) => {
      setTicket(res.data);
      setLoading(false);
    });
  };

  const loadComments = () => {
    api.get(`/tickets/${id}/comments`).then((res) => setComments(res.data));
  };

  useEffect(() => {
    loadTicket();
    loadComments();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    const result = await dispatch(updateTicket({ id, updates: { status: newStatus } }));
    if (updateTicket.fulfilled.match(result)) {
      setTicket(result.payload);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this ticket?")) return;
    await dispatch(deleteTicket(id));
    navigate("/tickets");
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(`/tickets/${id}/comments`, { text: newComment });
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-ink-600 dark:text-ink-300">Loading...</p>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <p className="text-ink-600 dark:text-ink-300">Ticket not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link to="/tickets" className="flex items-center gap-1 text-sm text-ink-600 hover:text-ink-950 dark:text-white mb-4 w-fit">
        <ArrowLeft size={15} /> Back to tickets
      </Link>

      <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-6 mb-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-ink-950 dark:text-white mb-2.5">{ticket.title}</h1>
            <div className="flex items-center gap-4">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={handleDelete}
              className="text-ink-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>

        <p className="text-ink-700 text-sm mb-6 leading-relaxed">
          {ticket.description || "No description provided."}
        </p>

        <div className="flex items-center gap-4 font-mono text-xs text-ink-600 mb-6 pb-6 border-b border-ink-800/10">
          <span>created_by: {ticket.createdBy?.name}</span>
          <span>·</span>
          <span>assignee: {ticket.assignee?.name || "none"}</span>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-ink-600 mb-2.5">
            Update status
          </label>
          <div className="flex gap-2">
            {["Open", "In Progress", "Resolved"].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  ticket.status === s
                    ? "bg-ink-950 dark:bg-accent-600 text-white border-ink-950 dark:border-accent-600"
                    : "border-ink-800/15 dark:border-white/15 text-ink-700 dark:text-ink-300 hover:border-ink-800/30 dark:hover:border-white/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-6 mb-5">
        <h2 className="font-mono text-xs uppercase tracking-wide text-ink-600 mb-4 flex items-center gap-2">
          <Clock size={14} /> Lifecycle history
        </h2>
        <ol className="space-y-3">
          {ticket.history.map((entry, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
              <span className="font-medium text-ink-950 dark:text-white">{entry.status}</span>
              <span className="text-ink-600 text-xs">
                {entry.changedBy?.name || "unknown"} · {new Date(entry.changedAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-6">
        <h2 className="font-mono text-xs uppercase tracking-wide text-ink-600 mb-4">
          Comments ({comments.length})
        </h2>

        <div className="space-y-4 mb-5">
          {comments.length === 0 && (
            <p className="text-sm text-ink-600 dark:text-ink-300">No comments yet.</p>
          )}
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-accent-50 flex items-center justify-center shrink-0 text-xs font-medium text-accent-700">
                {c.author?.name?.[0] || "?"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink-950 dark:text-white">{c.author?.name || "Unknown"}</span>
                  <span className="text-xs text-ink-600 font-mono">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-ink-700 mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} className="flex items-start gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2.5 border border-ink-800/15 dark:border-white/15 rounded-lg text-sm bg-white dark:bg-ink-900 text-ink-950 dark:text-white focus:outline-none focus:border-accent-500"
          />
          <button
            type="submit"
            disabled={posting}
            className="bg-ink-950 text-white p-2.5 rounded-lg hover:bg-ink-900 disabled:opacity-60 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Layout>
  );
}
