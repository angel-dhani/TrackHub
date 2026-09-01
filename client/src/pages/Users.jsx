import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Shield, User as UserIcon } from "lucide-react";
import Layout from "../components/Layout";
import api from "../app/api";

export default function Users() {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    api.get("/users").then((res) => {
      setUsers(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    await api.put(`/users/${id}/role`, { role });
    loadUsers();
  };

  return (
    <Layout>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-600 mb-1">
          {users.length} members
        </p>
        <h1 className="text-3xl font-display font-bold text-ink-950 dark:text-white">Team</h1>
      </div>

      <div className="space-y-2">
        {loading && <p className="text-ink-600 text-sm py-6 text-center">Loading...</p>}
        {users.map((u) => (
          <div
            key={u._id}
            className="flex items-center justify-between bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-lg px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center shrink-0">
                {u.role === "admin" ? (
                  <Shield size={15} className="text-accent-600" />
                ) : (
                  <UserIcon size={15} className="text-ink-600 dark:text-ink-300" />
                )}
              </div>
              <div>
                <p className="font-medium text-ink-950 text-sm">{u.name}</p>
                <p className="text-xs text-ink-600 font-mono">{u.email}</p>
              </div>
            </div>

            {user?.role === "admin" && u._id !== user.id ? (
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                className="border border-ink-800/15 dark:border-white/15 rounded-lg text-xs px-2.5 py-1.5 bg-white dark:bg-ink-900 text-ink-950 dark:text-white"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <span className="text-xs font-mono uppercase tracking-wide text-ink-600 px-2 py-1">
                {u.role}
              </span>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}
