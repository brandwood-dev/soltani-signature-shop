import { Bell, Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdminNotifications } from "@/components/admin/AdminNotificationsProvider";

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function AdminHeader({ title, subtitle, actions }: Props) {
  const { unread } = useAdminNotifications();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-6">
        <SidebarTrigger className="shrink-0" />
        <div className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher produit, commande, client…"
              className="h-9 pl-9"
            />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Rechercher">
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative"
            onClick={() => navigate({ to: "/admin/notifications" })}
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-foreground text-background text-xs">SS</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 px-3 pb-4 pt-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
