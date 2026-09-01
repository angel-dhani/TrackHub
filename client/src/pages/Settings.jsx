import { useState } from "react";
import { useSelector } from "react-redux";
import { User, Bell, Palette } from "lucide-react";
import Layout from "../components/Layout";
import { getTheme, applyTheme } from "../app/theme";

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 ${checked ? "bg-accent-500" : "bg-ink-800/15"}`}
      style={{ height: "22px" }}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`}
      />
    </button>
  );
}

export default function Settings() {
  const { user } = useSelector((state) => state.auth);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [theme, setTheme] = useState(getTheme());

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-ink-950 dark:text-white">Settings</h1>
        <p className="text-sm text-ink-600 dark:text-ink-300 mt-1">Manage your profile and preferences.</p>
      </div>

      <div className="max-w-2xl space-y-5">
        <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-accent-600" />
            <h2 className="font-display font-bold text-ink-950 text-sm">Profile</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-ink-600 mb-1.5">Name</label>
              <input
                readOnly
                value={user?.name || ""}
                className="w-full px-3 py-2 border border-ink-800/15 dark:border-white/15 rounded-lg text-sm bg-white dark:bg-ink-900 text-ink-950 dark:text-white bg-paper-alt text-ink-700 dark:text-ink-300"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-ink-600 mb-1.5">Email</label>
              <input
                readOnly
                value={user?.email || ""}
                className="w-full px-3 py-2 border border-ink-800/15 dark:border-white/15 rounded-lg text-sm bg-white dark:bg-ink-900 text-ink-950 dark:text-white bg-paper-alt text-ink-700 dark:text-ink-300"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-mono uppercase tracking-wide text-ink-600 mb-1.5">Role</label>
            <span className="inline-block text-xs font-mono uppercase tracking-wide text-accent-700 bg-accent-50 border border-accent-400/40 rounded px-2 py-1">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-accent-600" />
            <h2 className="font-display font-bold text-ink-950 text-sm">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-950 dark:text-white">Email notifications</p>
                <p className="text-xs text-ink-600 dark:text-ink-300">Get emailed when a ticket status changes.</p>
              </div>
              <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-950 dark:text-white">Assignment alerts</p>
                <p className="text-xs text-ink-600 dark:text-ink-300">Notify me when a ticket is assigned to me.</p>
              </div>
              <Toggle checked={assignmentAlerts} onChange={setAssignmentAlerts} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-950 dark:text-white">Weekly digest</p>
                <p className="text-xs text-ink-600 dark:text-ink-300">A summary of team activity every Monday.</p>
              </div>
              <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={16} className="text-accent-600" />
            <h2 className="font-display font-bold text-ink-950 dark:text-white text-sm">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-950 dark:text-white">Dark mode</p>
              <p className="text-xs text-ink-600 dark:text-ink-300">Switch between light and dark themes.</p>
            </div>
            <Toggle checked={theme === "dark"} onChange={(checked) => handleThemeChange(checked ? "dark" : "light")} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
