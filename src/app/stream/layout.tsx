// src/app/(dashboard)/layout.tsx
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CreatorSidebar } from "@/components/layout/creator-sidebar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar ở trên cùng */}
      <Navbar />

      {/* Nội dung chính: Sidebar + Main */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <CreatorSidebar />

        {/* Main content */}
        <main className="flex-1 bg-[#0f0f13] p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

    </div>
  );
}