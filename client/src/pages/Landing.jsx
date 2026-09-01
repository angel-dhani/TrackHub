import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Zap, ShieldCheck, Search, History } from "lucide-react";

const FEATURES = [
  { icon: Zap, label: "Real-time sync" },
  { icon: ShieldCheck, label: "Role-based access" },
  { icon: Search, label: "Full-text search" },
  { icon: History, label: "Full audit trail" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [stage, setStage] = useState(0);
  // 0: dot pulse, 1: logo reveal, 2: tagline, 3: CTAs + features visible

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 900);
    const t3 = setTimeout(() => setStage(3), 1450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (token && stage === 3) {
      const t = setTimeout(() => navigate("/dashboard"), 600);
      return () => clearTimeout(t);
    }
  }, [token, stage, navigate]);

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center overflow-hidden relative px-6">
      {/* Animated grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,107,82,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(37,107,82,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 35%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 35%, black 20%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 30%, #256B52 0%, transparent 55%)",
        }}
      />

      <div className="relative text-center max-w-2xl mx-auto pt-8">
        <div
          className={`transition-all duration-700 ease-out ${
            stage >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <span
              className={`w-3 h-3 rounded-full bg-accent-400 transition-transform duration-500 ${
                stage === 0 ? "scale-150 animate-pulse" : "scale-100"
              }`}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-400">
              Issue tracking, centralized
            </span>
          </div>
          <h1 className="font-display font-bold text-5xl md:text-6xl text-white tracking-tight leading-[1.05]">
            Stop losing bugs
            <br />
            in Slack threads.
          </h1>
        </div>

        <p
          className={`text-ink-600 text-base md:text-lg max-w-lg mx-auto mt-6 mb-9 transition-all duration-700 delay-100 ${
            stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          One place for your team to report, assign, and track every issue — from open to resolved.
        </p>

        <div
          className={`flex flex-col sm:flex-row gap-3 justify-center mb-16 transition-all duration-500 ${
            stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          <Link
            to="/login"
            className="bg-white text-ink-950 px-7 py-3 rounded-lg text-sm font-semibold hover:bg-ink-100 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="border border-white/15 text-white px-7 py-3 rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors"
          >
            Create an account
          </Link>
        </div>

        <div
          className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-4 transition-all duration-700 delay-150 ${
            stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-center gap-2 text-ink-600">
              <f.icon size={15} className="text-accent-400" strokeWidth={1.75} />
              <span className="text-xs font-mono">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
