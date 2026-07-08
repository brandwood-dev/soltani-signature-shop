import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
    meta: [{ title: "Admin — Soltani Signature" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    requireAdminSession().then((admin) => {
      if (!mounted) return;
      if (!admin) {
        window.location.replace("/admin/login");
        return;
      }
      setAuthorized(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Vérification de la session admin…
      </main>
    );
  }

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
