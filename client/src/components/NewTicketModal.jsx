import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { X } from "lucide-react";
import { createTicket } from "../features/tickets/ticketSlice";
import api from "../app/api";

export default function NewTicketModal({ onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignee, setAssignee] = useState("");
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    api.get("/users").then((res) => setUsers(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createTicket({ title, description, priority, assignee: assignee || null }));
    onClose();
  };

  const inputClasses =
    "w-full px-3 py-2.5 border border-ink-800/15 dark:border-white/15 rounded-lg text-sm bg-white dark:bg-ink-900 text-ink-950 dark:text-white focus:outline-none focus:border-accent-500";

  return (
    <div className="fixed inset-0 bg-ink-950/60 flex items-center justify-center z-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-ink-800 rounded-xl p-6 w-full max-w-md border border-transparent dark:border-white/10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-bold text-ink-950 dark:text-white">New ticket</h2>
          <button type="button" onClick={onClose} className="text-ink-600 dark:text-ink-300 hover:text-ink-950 dark:hover:text-white">
            <X size={19} />
          </button>
        </div>

        <label className="block text-xs font-mono uppercase tracking-wide text-ink-600 dark:text-ink-300 mb-1.5">Title</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputClasses} mb-4`} />

        <label className="block text-xs font-mono uppercase tracking-wide text-ink-600 dark:text-ink-300 mb-1.5">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClasses} mb-4 resize-none`} />

        <label className="block text-xs font-mono uppercase tracking-wide text-ink-600 dark:text-ink-300 mb-1.5">Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={`${inputClasses} mb-4`}>
          <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>

        <label className="block text-xs font-mono uppercase tracking-wide text-ink-600 dark:text-ink-300 mb-1.5">Assignee</label>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={`${inputClasses} mb-6`}>
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>

        <button type="submit" className="w-full bg-ink-950 dark:bg-accent-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-ink-900 dark:hover:bg-accent-500 transition-colors">
          Create ticket
        </button>
      </form>
    </div>
  );
}
