import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, Pencil, ShoppingBag, Star, User } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import type { ApiUser } from "@/lib/api";
import { getCurrentUser } from "@/lib/api";
import { signOut } from "@/lib/supabase";

type Tab = "dashboard" | "orders" | "wishlist" | "info" | "addresses";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Mon compte — Soltani Signature" },
      { name: "description", content: "Gérez votre compte, vos commandes et vos préférences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [tab, setTab] = useState<Tab>("info");

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setReady(true);
      })
      .catch(() => {
        navigate({ to: "/login" });
      });
  }, [navigate]);

  const identity = useMemo(() => {
    if (!user) return { fullName: "", initials: "" };
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
    const initials = `${user.firstName?.[0] ?? user.email[0]}${user.lastName?.[0] ?? ""}`.toUpperCase();
    return { fullName, initials };
  }, [user]);

  if (!ready || !user) return null;

  const logout = async () => {
    await signOut();
    await navigate({ to: "/login" });
  };

  const nav: { id: Tab | "logout"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "orders", label: "Mes commandes", icon: Package },
    { id: "wishlist", label: "Mes favoris", icon: Heart },
    { id: "info", label: "Informations personnelles", icon: User },
    { id: "addresses", label: "Adresses de livraison", icon: MapPin },
    { id: "logout", label: "Déconnexion", icon: LogOut },
  ];

  return (
    <SiteLayout>
      <PageHero eyebrow="Espace privé" title="Mon compte" subtitle="Gérez votre profil, vos commandes et vos préférences." />

      <section className="container-luxe py-12 md:py-16">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="bg-card border border-border rounded-sm p-4 h-fit lg:sticky lg:top-28">
            <div className="flex items-center gap-3 p-3 border-b border-border mb-3">
              <div className="h-12 w-12 rounded-full bg-gradient-gold grid place-items-center text-ink font-bold">{identity.initials}</div>
              <div>
                <div className="text-sm font-semibold text-foreground">{identity.fullName}</div>
                <div className="text-[11px] text-muted-foreground">Membre Signature</div>
              </div>
            </div>
            <ul className="flex flex-col gap-1">
              {nav.map(({ id, label, icon: Icon }) => {
                const active = id === tab;
                if (id === "logout") {
                  return (
                    <li key={id}>
                      <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-secondary rounded-sm transition">
                        <Icon className="h-4 w-4" /> {label}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={id}>
                    <button onClick={() => setTab(id as Tab)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition ${active ? "bg-gold/10 text-gold font-medium" : "text-foreground/80 hover:bg-secondary"}`}>
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="bg-card border border-border rounded-sm p-6 md:p-10">
            {tab === "info" && <InfoTab user={user} fullName={identity.fullName} initials={identity.initials} />}
            {tab === "dashboard" && <DashboardTab onNav={setTab} name={user.firstName ?? identity.fullName} />}
            {tab === "orders" && <OrdersTab />}
            {tab === "wishlist" && <WishlistTab />}
            {tab === "addresses" && <AddressesTab />}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{children}</h2>
      {sub && <p className="text-sm text-muted-foreground mt-2">{sub}</p>}
    </div>
  );
}

function InfoTab({ user, fullName, initials }: { user: ApiUser; fullName: string; initials: string }) {
  return (
    <>
      <SectionTitle sub="Vos informations personnelles synchronisées avec votre compte.">Informations personnelles</SectionTitle>

      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-10 pb-10 border-b border-border">
        <div className="h-28 w-28 rounded-full bg-gradient-gold grid place-items-center text-ink font-bold text-3xl shadow-gold">{initials}</div>
        <div>
          <div className="text-lg font-semibold text-foreground">{fullName}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <div className="mt-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold bg-gold/10 px-3 py-1 rounded-sm">
            <Star className="h-3 w-3 fill-current" /> Cercle Signature
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <FieldRow label="Nom complet" value={fullName} />
        <FieldRow label="Email" value={user.email} />
        <FieldRow label="Téléphone" value={user.phone ?? "Non renseigné"} />
        <FieldRow label="Statut" value={user.status === "ACTIVE" ? "Actif" : "Désactivé"} />
      </div>

      <div className="mt-10 rounded-sm border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
        <Pencil className="mr-2 inline h-4 w-4 text-gold" />
        La modification du profil et la gestion des adresses arrivent à l’étape suivante.
      </div>
    </>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</div>
      <div className="text-sm text-foreground py-2.5 px-3 bg-secondary/40 border border-border rounded-sm">{value}</div>
    </div>
  );
}

function DashboardTab({ onNav, name }: { onNav: (tab: Tab) => void; name: string }) {
  const stats = [
    { label: "Commandes", value: "0", icon: ShoppingBag, tab: "orders" as Tab },
    { label: "Favoris", value: "0", icon: Heart, tab: "wishlist" as Tab },
    { label: "Adresses", value: "0", icon: MapPin, tab: "addresses" as Tab },
  ];

  return (
    <>
      <SectionTitle sub={`Bon retour parmi nous, ${name}.`}>Tableau de bord</SectionTitle>
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <button key={stat.label} onClick={() => onNav(stat.tab)} className="text-left p-5 border border-border bg-secondary/30 hover:border-gold/60 rounded-sm transition">
            <stat.icon className="h-5 w-5 text-gold mb-3" />
            <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">{stat.label}</div>
          </button>
        ))}
      </div>
      <div className="p-6 border border-gold/30 bg-gold/5 rounded-sm">
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2">Cercle Signature</div>
        <h3 className="font-display text-xl text-foreground">Votre espace client est activé.</h3>
      </div>
    </>
  );
}

function OrdersTab() {
  return (
    <>
      <SectionTitle sub="Historique et suivi de vos commandes.">Mes commandes</SectionTitle>
      <EmptyState icon={ShoppingBag} label="Aucune commande liée à ce compte pour le moment." linkLabel="Découvrir la boutique" />
    </>
  );
}

function WishlistTab() {
  return (
    <>
      <SectionTitle sub="Retrouvez vos pièces préférées.">Mes favoris</SectionTitle>
      <EmptyState icon={Heart} label="Votre liste de favoris est vide." linkLabel="Découvrir la boutique" />
    </>
  );
}

function AddressesTab() {
  return (
    <>
      <SectionTitle sub="Gérez vos adresses pour des livraisons plus rapides.">Adresses de livraison</SectionTitle>
      <EmptyState icon={MapPin} label="Aucune adresse enregistrée pour le moment." linkLabel="Continuer mes achats" />
    </>
  );
}

function EmptyState({ icon: Icon, label, linkLabel }: { icon: React.ComponentType<{ className?: string }>; label: string; linkLabel: string }) {
  return (
    <div className="text-center py-16 border border-dashed border-border rounded-sm">
      <Icon className="h-10 w-10 text-gold mx-auto mb-4" />
      <p className="text-muted-foreground mb-6">{label}</p>
      <Link to="/" className="inline-flex h-11 px-6 items-center bg-gradient-gold text-ink font-semibold text-xs uppercase tracking-[0.2em] rounded-sm shadow-gold">
        {linkLabel}
      </Link>
    </div>
  );
}
