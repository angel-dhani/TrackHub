import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../features/auth/authSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="w-2 h-2 rounded-full bg-accent-400" />
          <h1 className="font-display font-bold text-2xl text-white tracking-tight">TrackHub</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-7 rounded-xl">
          <h2 className="text-lg font-display font-bold text-ink-950 mb-5">Log in</h2>

          {error && (
            <p className="mb-4 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>
          )}

          <label className="block text-xs font-mono uppercase tracking-wide text-ink-600 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-3 py-2.5 border border-ink-800/15 rounded-lg text-sm focus:outline-none focus:border-accent-500"
          />

          <label className="block text-xs font-mono uppercase tracking-wide text-ink-600 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 px-3 py-2.5 border border-ink-800/15 rounded-lg text-sm focus:outline-none focus:border-accent-500"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-ink-950 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-ink-900 disabled:opacity-60 transition-colors"
          >
            {status === "loading" ? "Logging in..." : "Log in"}
          </button>

          <p className="mt-5 text-sm text-ink-600 text-center">
            No account?{" "}
            <Link to="/signup" className="text-accent-600 font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
