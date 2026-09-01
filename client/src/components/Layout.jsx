import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950 transition-colors">
      <Navbar />
      <main className="p-8">
        <div className="max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
