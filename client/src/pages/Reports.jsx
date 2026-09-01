import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Clock } from "lucide-react";
import Layout from "../components/Layout";
import api from "../app/api";

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/reports").then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-600 mb-1">Deep dive</p>
        <h1 className="text-3xl font-display font-bold text-ink-950 dark:text-white">Reports</h1>
      </div>

      {loading && <p className="text-ink-600 text-sm">Loading reports...</p>}

      {data && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-ink-600 dark:text-ink-300">Average resolution time</p>
              <p className="text-2xl font-display font-bold text-ink-950 dark:text-white">
                {data.avgResolutionHours}h
                <span className="text-sm font-normal text-ink-600 ml-1">
                  (~{Math.round(data.avgResolutionHours / 24)} days)
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-5">
              <h2 className="font-mono text-xs uppercase tracking-wide text-ink-600 mb-4">
                Resolution time by priority
              </h2>
              {data.resolutionByPriority.length === 0 ? (
                <p className="text-sm text-ink-600 dark:text-ink-300">Not enough resolved tickets yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.resolutionByPriority}>
                    <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: "hrs", angle: 0, position: "insideTopLeft", fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="avgHours" fill="#256B52" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl">
              <h2 className="font-mono text-xs uppercase tracking-wide text-ink-600 px-5 pt-5 mb-3">
                Tickets per member
              </h2>
              <div className="divide-y divide-ink-800/8 dark:divide-white/10">
                {data.ticketsPerMember.map((m) => {
                  const pct = m.total > 0 ? Math.round((m.resolved / m.total) * 100) : 0;
                  return (
                    <div key={m._id} className="px-5 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-ink-950 dark:text-white">{m.name}</p>
                        <p className="text-xs font-mono text-ink-600 dark:text-ink-300">{m.resolved}/{m.total} resolved</p>
                      </div>
                      <div className="w-full bg-ink-800/8 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {data.ticketsPerMember.length === 0 && (
                  <p className="text-sm text-ink-600 px-5 pb-5">No assigned tickets yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
