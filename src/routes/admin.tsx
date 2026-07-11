import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdminSession } from "@/lib/admin/auth";
import { AdminNotificationsProvider } from "@/components/admin/AdminNotificationsProvider";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const admin = await requireAdminSession();
    if (!admin) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: [{ title: "Admin - Soltani Signature" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminNotificationsProvider>
        <div className="flex min-h-screen w-full bg-muted/30">
          <AdminSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col">
            <Outlet />
          </SidebarInset>
        </div>
      </AdminNotificationsProvider>
    </SidebarProvider>
  );
}
