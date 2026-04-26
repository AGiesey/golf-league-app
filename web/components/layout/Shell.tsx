import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <TopNav />
        {/* Body row: sidebar + content side by side */}
        <div className="flex flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
