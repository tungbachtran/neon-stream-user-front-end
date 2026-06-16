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
    <div className="flex h-screen flex-col">
      {/* Navbar ở trên cùng */}
      <Navbar />

      {/* Nội dung chính: Sidebar + Main */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <CreatorSidebar />

        {/* Main content */}
        <main className="flex-1 bg-[#0f0f13] p-6 h-[880px]">
          {children}
        </main>
      </div>

    </div>
  );
}