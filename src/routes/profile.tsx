import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Heart,
  User,
  MapPin,
  LogOut,
  Camera,
  Pencil,
  ShoppingBag,
  Star,
} from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";

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
  const [tab, setTab] = useState<Tab>("info");

  useEffect(() => {
    const auth = typeof window !== "undefined" && localStorage.getItem("soltani-auth") === "1";
    if (!auth) {
      navigate({ to: "/login" });
    } else {
      setReady(true);
    }
  }, [navigate]);

  if (!ready) return null;

  const logout = () => {
    try {
      localStorage.removeItem("soltani-auth");
    } catch {}
    navigate({ to: "/login" });
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
          {/* Sidebar */}
          <aside className="bg-card border border-border rounded-sm p-4 h-fit lg:sticky lg:top-28">
            <div className="flex items-center gap-3 p-3 border-b border-border mb-3">
              <div className="h-12 w-12 rounded-full bg-gradient-gold grid place-items-center text-ink font-bold">MS</div>
              <div>
                <div className="text-sm font-semibold text-foreground">Mohamed Soltani</div>
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
                    <button
                      onClick={() => setTab(id as Tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition ${
                        active ? "bg-gold/10 text-gold font-medium" : "text-foreground/80 hover:bg-secondary"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Main */}
          <div className="bg-card border border-border rounded-sm p-6 md:p-10">
            {tab === "info" && <InfoTab />}
            {tab === "dashboard" && <DashboardTab onNav={setTab} />}
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

function InfoTab() {
  const [editing, setEditing] = useState(false);
  return (
    <>
      <SectionTitle sub="Vos informations personnelles et vos préférences.">Informations personnelles</SectionTitle>

      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-10 pb-10 border-b border-border">
        <div className="relative">
          <div className="h-28 w-28 rounded-full bg-gradient-gold grid place-items-center text-ink font-bold text-3xl shadow-gold">MS</div>
          <button className="absolute -bottom-1 -right-1 h-9 w-9 grid place-items-center rounded-full bg-background border border-border text-gold hover:bg-secondary transition" aria-label="Modifier la photo">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <div className="text-lg font-semibold text-foreground">Mohamed Soltani</div>
          <div className="text-sm text-muted-foreground">mohamed@soltani.tn</div>
          <div className="mt-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold bg-gold/10 px-3 py-1 rounded-sm">
            <Star className="h-3 w-3 fill-current" /> Cercle Signature — Or
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <FieldRow label="Nom complet" value="Mohamed Soltani" editing={editing} />
        <FieldRow label="Email" value="mohamed@soltani.tn" editing={editing} />
        <FieldRow label="Téléphone" value="+216 58 997 716" editing={editing} />
        <FieldRow label="Date de naissance" value="1990-05-12" editing={editing} type="date" />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          onClick={() => setEditing((v) => !v)}
          className="h-11 px-6 bg-gradient-gold text-ink font-semibold text-xs uppercase tracking-[0.2em] rounded-sm shadow-gold hover:opacity-95 transition inline-flex items-center gap-2"
        >
          <Pencil className="h-4 w-4" /> {editing ? "Enregistrer" : "Modifier mes informations"}
        </button>
        {editing && (
          <button onClick={() => setEditing(false)} className="h-11 px-6 border border-border text-sm rounded-sm hover:bg-secondary transition">
            Annuler
          </button>
        )}
      </div>
    </>
  );
}

function FieldRow({ label, value, editing, type = "text" }: { label: string; value: string; editing: boolean; type?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</div>
      {editing ? (
        <input type={type} defaultValue={value} className="input-luxe" />
      ) : (
        <div className="text-sm text-foreground py-2.5 px-3 bg-secondary/40 border border-border rounded-sm">{value}</div>
      )}
    </div>
  );
}

function DashboardTab({ onNav }: { onNav: (t: Tab) => void }) {
  const stats = [
    { label: "Commandes", value: "12", icon: ShoppingBag, tab: "orders" as Tab },
    { label: "Favoris", value: "8", icon: Heart, tab: "wishlist" as Tab },
    { label: "Adresses", value: "2", icon: MapPin, tab: "addresses" as Tab },
  ];
  return (
    <>
      <SectionTitle sub="Bon retour parmi nous, Mohamed.">Tableau de bord</SectionTitle>
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <button key={s.label} onClick={() => onNav(s.tab)} className="text-left p-5 border border-border bg-secondary/30 hover:border-gold/60 rounded-sm transition">
            <s.icon className="h-5 w-5 text-gold mb-3" />
            <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">{s.label}</div>
          </button>
        ))}
      </div>
      <div className="p-6 border border-gold/30 bg-gold/5 rounded-sm">
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2">Cercle Signature</div>
        <h3 className="font-display text-xl text-foreground">Vous êtes à 320 TND du palier Platine</h3>
        <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-gold" style={{ width: "65%" }} />
        </div>
      </div>
    </>
  );
}

function OrdersTab() {
  const orders = [
    { id: "SS-10421", date: "12 Mai 2026", total: "1 240 TND", status: "Livrée" },
    { id: "SS-10380", date: "28 Avr 2026", total: "560 TND", status: "Livrée" },
    { id: "SS-10325", date: "03 Avr 2026", total: "2 100 TND", status: "En cours" },
  ];
  return (
    <>
      <SectionTitle sub="Historique et suivi de vos commandes.">Mes commandes</SectionTitle>
      <div className="divide-y divide-border border border-border rounded-sm overflow-hidden">
        {orders.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-4 p-5 bg-card hover:bg-secondary/30 transition">
            <div className="flex-1 min-w-[160px]">
              <div className="text-sm font-semibold text-foreground">{o.id}</div>
              <div className="text-xs text-muted-foreground">{o.date}</div>
            </div>
            <div className="text-sm text-foreground">{o.total}</div>
            <span className={`text-[11px] uppercase tracking-[0.2em] px-3 py-1 rounded-sm ${o.status === "Livrée" ? "bg-gold/10 text-gold" : "bg-secondary text-foreground"}`}>{o.status}</span>
            <Link to="/legal/$slug" params={{ slug: "suivi-commande" }} className="text-xs text-gold hover:underline">Détails</Link>
          </div>
        ))}
      </div>
    </>
  );
}

function WishlistTab() {
  return (
    <>
      <SectionTitle sub="Retrouvez vos pièces préférées.">Mes favoris</SectionTitle>
      <div className="text-center py-16 border border-dashed border-border rounded-sm">
        <Heart className="h-10 w-10 text-gold mx-auto mb-4" />
        <p className="text-muted-foreground mb-6">Votre liste de favoris est vide.</p>
        <Link to="/" className="inline-flex h-11 px-6 items-center bg-gradient-gold text-ink font-semibold text-xs uppercase tracking-[0.2em] rounded-sm shadow-gold">
          Découvrir la boutique
        </Link>
      </div>
    </>
  );
}

function AddressesTab() {
  const addresses = [
    { name: "Domicile", line: "12 Rue de la Liberté, Tunis 1002", phone: "+216 58 997 716", primary: true },
    { name: "Bureau", line: "Avenue Habib Bourguiba, La Marsa 2070", phone: "+216 58 997 716", primary: false },
  ];
  return (
    <>
      <SectionTitle sub="Gérez vos adresses pour des livraisons plus rapides.">Adresses de livraison</SectionTitle>
      <div className="grid md:grid-cols-2 gap-5">
        {addresses.map((a) => (
          <div key={a.name} className="p-5 border border-border bg-secondary/30 rounded-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-foreground">{a.name}</div>
              {a.primary && <span className="text-[10px] uppercase tracking-[0.2em] text-gold bg-gold/10 px-2 py-0.5 rounded-sm">Principale</span>}
            </div>
            <div className="text-sm text-muted-foreground">{a.line}</div>
            <div className="text-sm text-muted-foreground">{a.phone}</div>
            <div className="mt-4 flex gap-3 text-xs">
              <button className="text-gold hover:underline">Modifier</button>
              <button className="text-destructive hover:underline">Supprimer</button>
            </div>
          </div>
        ))}
        <button className="p-5 border border-dashed border-border hover:border-gold/60 rounded-sm text-sm text-muted-foreground hover:text-gold transition">
          + Ajouter une adresse
        </button>
      </div>
    </>
  );
}
