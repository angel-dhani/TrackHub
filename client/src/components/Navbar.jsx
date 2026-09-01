import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard, Ticket, Users, LogOut, KanbanSquare, Activity,
  BarChart3, Settings, Search, Bell, ChevronDown, Sun, Moon,
} from "lucide-react";
import { logout } from "../features/auth/authSlice";
import { socket } from "../app/socket";
import { getTheme, applyTheme } from "../app/theme";

const linkClasses = ({ isActive }) =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
    isActive
      ? "bg-accent-500/15 text-accent-700 dark:text-accent-300 font-medium"
      : "text-ink-600 dark:text-ink-300 hover:bg-ink-800/5 dark:hover:bg-white/5 hover:text-ink-950 dark:hover:text-white"
  }`;

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "A ticket was reassigned to you", time: "2m ago" },
  { id: 2, text: "New comment on a ticket you follow", time: "1h ago" },
  { id: 3, text: "Weekly resolution rate up 8%", time: "Yesterday" },
];

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [theme, setTheme] = useState(getTheme());
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handlePresence = (count) => setOnlineCount(count);
    socket.on("presence:count", handlePresence);
    return () => socket.off("presence:count", handlePresence);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/tickets?search=${encodeURIComponent(search.trim())}`);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-ink-900 border-b border-ink-800/10 dark:border-white/10">
      <div className="flex items-center gap-4 px-5 py-2.5">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-accent-400" />
          <span className="font-display font-bold text-base text-ink-950 dark:text-white tracking-tight">TrackHub</span>
        </div>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-1 ml-2">
          <NavLink to="/dashboard" className={linkClasses}><LayoutDashboard size={15} /> Dashboard</NavLink>
          <NavLink to="/tickets" className={linkClasses}><Ticket size={15} /> Tickets</NavLink>
          <NavLink to="/board" className={linkClasses}><KanbanSquare size={15} /> Board</NavLink>
          <NavLink to="/activity" className={linkClasses}><Activity size={15} /> Activity</NavLink>
          <NavLink to="/reports" className={linkClasses}><BarChart3 size={15} /> Reports</NavLink>
          <NavLink to="/users" className={linkClasses}><Users size={15} /> Team</NavLink>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xs ml-auto">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2 text-ink-600 dark:text-ink-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-8 pr-2 py-1.5 bg-paper dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-md text-xs text-ink-950 dark:text-white placeholder:text-ink-600 dark:placeholder:text-ink-300 focus:outline-none focus:border-accent-500"
            />
          </div>
        </form>

        {/* Presence */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0 text-xs text-ink-600 dark:text-ink-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-400" />
          </span>
          {onlineCount} online
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 rounded-md flex items-center justify-center text-ink-600 dark:text-ink-300 hover:bg-ink-800/5 dark:hover:bg-white/5 shrink-0"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative shrink-0" ref={notifRef}>
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="w-8 h-8 rounded-md flex items-center justify-center text-ink-600 dark:text-ink-300 hover:bg-ink-800/5 dark:hover:bg-white/5 relative"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-accent-500 text-white text-[9px] flex items-center justify-center">
              {MOCK_NOTIFICATIONS.length}
            </span>
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-lg shadow-xl overflow-hidden">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div key={n.id} className="px-3 py-2.5 border-b border-ink-800/8 dark:border-white/5 last:border-0">
                  <p className="text-xs text-ink-950 dark:text-white">{n.text}</p>
                  <p className="text-[10px] text-ink-600 dark:text-ink-300 mt-0.5 font-mono">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative shrink-0" ref={profileRef}>
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-ink-800/5 dark:hover:bg-white/5"
          >
            <div className="w-7 h-7 rounded-full bg-accent-500 text-white text-xs font-medium flex items-center justify-center shrink-0">
              {user?.name?.[0] || "?"}
            </div>
            <ChevronDown size={13} className="text-ink-600 dark:text-ink-300" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-ink-800 border border-ink-800/10 dark:border-white/10 rounded-lg shadow-xl overflow-hidden">
              <div className="px-3 py-2.5 border-b border-ink-800/8 dark:border-white/5">
                <p className="text-xs font-medium text-ink-950 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] font-mono uppercase tracking-wide text-accent-600 dark:text-accent-300">{user?.role}</p>
              </div>
              <NavLink
                to="/settings"
                className="flex items-center gap-2 px-3 py-2.5 text-xs text-ink-950 dark:text-white hover:bg-ink-800/5 dark:hover:bg-white/5 border-b border-ink-800/8 dark:border-white/5"
              >
                <Settings size={13} /> Account settings
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-red-600 dark:text-red-300 hover:bg-red-500/10"
              >
                <LogOut size={13} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
