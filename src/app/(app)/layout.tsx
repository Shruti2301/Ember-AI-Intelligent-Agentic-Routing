import Sidebar from "@/components/Sidebar";
import ApiKeyGate from "@/components/ApiKeyGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApiKeyGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 ml-0 md:ml-64 min-h-screen pt-14 md:pt-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">{children}</div>
        </main>
      </div>
    </ApiKeyGate>
  );
}
