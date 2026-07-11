import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ComponentType, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, Pencil, ShoppingBag, Star, Trash2, User } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  deleteCustomerWishlistItem,
  getCustomerProfile,
  syncCustomerWishlist,
  updateCustomerAddress,
  updateCustomerProfile,
  type AddressInput,
  type ApiAddress,
  type ApiCustomerOrder,
  type ApiUser,
  type ApiWishlistProduct,
  type CustomerProfile,
} from "@/lib/api";
import { TUNISIA_GOVERNORATES } from "@/lib/tunisia";
import { signOut } from "@/lib/supabase";
import { useWishlist } from "@/hooks/useWishlist";

type Tab = "dashboard" | "orders" | "wishlist" | "info" | "addresses";
type AddressFormState = AddressInput & { id?: string };
const PROFILE_CACHE_KEY = "soltani-profile-cache";
const PROFILE_CACHE_TTL = 60_000;

const emptyAddress: AddressFormState = {
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  city: "",
  governorate: "Tunis",
  isDefault: false,
};

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
  const wishlist = useWishlist();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [tab, setTab] = useState<Tab>("info");

  const loadProfile = async (showCached: boolean) => {
    if (showCached) {
      const cachedProfile = readCachedProfile();
      if (cachedProfile) {
        setProfile(cachedProfile);
        setReady(true);
      }
    }

    const nextProfile = await getCustomerProfile();
    setProfile(nextProfile);
    writeCachedProfile(nextProfile);
    setReady(true);

    if (wishlist.slugs.length) {
      syncCustomerWishlist(wishlist.slugs)
        .then((syncedWishlist) => {
          setProfile((current) => {
            if (!current) return current;
            const updatedProfile = {
              ...current,
              wishlist: syncedWishlist,
              stats: { ...current.stats, wishlist: syncedWishlist.length },
            };
            writeCachedProfile(updatedProfile);
            return updatedProfile;
          });
        })
        .catch(() => undefined);
    }
  };

  useEffect(() => {
    let active = true;
    loadProfile(true).catch(() => {
      if (active) navigate({ to: "/login" });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  const identity = useMemo(() => {
    if (!profile?.user) return { fullName: "", initials: "" };
    const user = profile.user;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
    const initials = `${user.firstName?.[0] ?? user.email[0]}${user.lastName?.[0] ?? ""}`.toUpperCase();
    return { fullName, initials };
  }, [profile]);

  if (!ready || !profile) {
    return (
      <SiteLayout>
        <PageHero eyebrow="Espace privé" title="Mon compte" subtitle="Chargement sécurisé de votre espace client." />
        <ProfileSkeleton />
      </SiteLayout>
    );
  }

  const logout = async () => {
    await signOut();
    await navigate({ to: "/login" });
  };

  const updateProfileState = (user: ApiUser) => {
    setProfile((current) => {
      if (!current) return current;
      const updatedProfile = { ...current, user };
      writeCachedProfile(updatedProfile);
      return updatedProfile;
    });
  };

  const updateAddresses = (addresses: ApiAddress[]) => {
    setProfile((current) => {
      if (!current) return current;
      const updatedProfile = {
        ...current,
        addresses,
        stats: { ...current.stats, addresses: addresses.length },
      };
      writeCachedProfile(updatedProfile);
      return updatedProfile;
    });
  };

  const updateWishlist = (products: ApiWishlistProduct[]) => {
    setProfile((current) => {
      if (!current) return current;
      const updatedProfile = {
        ...current,
        wishlist: products,
        stats: { ...current.stats, wishlist: products.length },
      };
      writeCachedProfile(updatedProfile);
      return updatedProfile;
    });
  };

  const nav: { id: Tab | "logout"; label: string; icon: ComponentType<{ className?: string }> }[] = [
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

          <div className="bg-card border border-border rounded-sm p-6 md:p-10 min-w-0">
            {tab === "info" && <InfoTab user={profile.user} fullName={identity.fullName} initials={identity.initials} onUpdated={updateProfileState} />}
            {tab === "dashboard" && <DashboardTab profile={profile} onNav={setTab} name={profile.user.firstName ?? identity.fullName} />}
            {tab === "orders" && <OrdersTab orders={profile.orders} />}
            {tab === "wishlist" && <WishlistTab products={profile.wishlist} onRemove={(products) => updateWishlist(products)} localWishlist={wishlist} />}
            {tab === "addresses" && <AddressesTab addresses={profile.addresses} onChange={updateAddresses} />}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function readCachedProfile() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { savedAt: number; profile: CustomerProfile };
    if (Date.now() - cached.savedAt > PROFILE_CACHE_TTL) return null;
    return cached.profile;
  } catch {
    return null;
  }
}

function writeCachedProfile(profile: CustomerProfile) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), profile }));
  } catch {
    undefined;
  }
}

function ProfileSkeleton() {
  return (
    <section className="container-luxe py-12 md:py-16">
      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="bg-card border border-border rounded-sm p-4 h-fit">
          <div className="flex items-center gap-3 p-3 border-b border-border mb-3">
            <div className="h-12 w-12 rounded-full bg-secondary animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-secondary rounded-sm animate-pulse" />
              <div className="h-3 w-24 bg-secondary rounded-sm animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 bg-secondary/70 rounded-sm animate-pulse" />
            ))}
          </div>
        </aside>
        <div className="bg-card border border-border rounded-sm p-6 md:p-10 min-w-0">
          <div className="h-8 w-52 bg-secondary rounded-sm animate-pulse mb-3" />
          <div className="h-4 w-full max-w-md bg-secondary rounded-sm animate-pulse mb-10" />
          <div className="grid md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 bg-secondary/70 rounded-sm animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </section>
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

function InfoTab({ user, fullName, initials, onUpdated }: { user: ApiUser; fullName: string; initials: string; onUpdated: (user: ApiUser) => void }) {
  const [form, setForm] = useState({ fullName, phone: user.phone ?? "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await updateCustomerProfile({
        fullName: form.fullName,
        phone: form.phone || undefined,
      });
      onUpdated(updated);
      setMessage("Informations mises à jour.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible de mettre à jour le profil.");
    } finally {
      setSaving(false);
    }
  };

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

      <form onSubmit={submit} className="grid md:grid-cols-2 gap-5">
        <Field label="Nom complet"><input required value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} className="input-luxe" /></Field>
        <Field label="Email"><input value={user.email} disabled className="input-luxe opacity-70 cursor-not-allowed" /></Field>
        <Field label="Téléphone"><input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="input-luxe" placeholder="+216 00 000 000" /></Field>
        <Field label="Statut"><input value={user.status === "ACTIVE" ? "Actif" : "Bloqué"} disabled className="input-luxe opacity-70 cursor-not-allowed" /></Field>
        <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
          <button disabled={saving} className="h-11 px-6 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm disabled:opacity-60">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      </form>
    </>
  );
}

function DashboardTab({ profile, onNav, name }: { profile: CustomerProfile; onNav: (tab: Tab) => void; name: string }) {
  const stats = [
    { label: "Commandes", value: String(profile.stats.orders), icon: ShoppingBag, tab: "orders" as Tab },
    { label: "Favoris", value: String(profile.stats.wishlist), icon: Heart, tab: "wishlist" as Tab },
    { label: "Adresses", value: String(profile.stats.addresses), icon: MapPin, tab: "addresses" as Tab },
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

function OrdersTab({ orders }: { orders: ApiCustomerOrder[] }) {
  return (
    <>
      <SectionTitle sub="Historique et suivi de vos commandes.">Mes commandes</SectionTitle>
      {orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} label="Aucune commande liée à ce compte pour le moment." linkLabel="Découvrir la boutique" />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="border border-border rounded-sm p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3 mb-3">
                <div>
                  <p className="font-semibold">{order.reference}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-widest text-gold">{formatOrderStatus(order.status)}</span>
                  <span className="font-semibold tabular-nums">{order.total} DT</span>
                </div>
              </div>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <Link key={item.id} to="/product/$slug" params={{ slug: item.slug }} className="flex items-center gap-3 rounded-sm bg-secondary/30 p-2">
                    <img src={item.image} alt="" className="h-12 w-12 rounded-sm object-contain bg-background" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qté {item.qty} · {item.brand}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{item.total} DT</span>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function WishlistTab({ products, onRemove, localWishlist }: { products: ApiWishlistProduct[]; onRemove: (products: ApiWishlistProduct[]) => void; localWishlist: ReturnType<typeof useWishlist> }) {
  const remove = async (slug: string) => {
    await deleteCustomerWishlistItem(slug);
    localWishlist.remove(slug);
    onRemove(products.filter((product) => product.slug !== slug));
  };

  return (
    <>
      <SectionTitle sub="Retrouvez vos pièces préférées.">Mes favoris</SectionTitle>
      {products.length === 0 ? (
        <EmptyState icon={Heart} label="Votre liste de favoris est vide." linkLabel="Découvrir la boutique" />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product) => (
            <article key={product.slug} className="border border-border rounded-sm overflow-hidden bg-secondary/20">
              <Link to="/product/$slug" params={{ slug: product.slug }} className="block aspect-square bg-background">
                <img src={product.image} alt={product.name} className="h-full w-full object-contain p-3" />
              </Link>
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-1">{product.brand}</p>
                <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-semibold tabular-nums">{product.price} DT</span>
                  <button onClick={() => remove(product.slug)} className="grid h-9 w-9 place-items-center border border-border rounded-sm hover:text-destructive hover:border-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function AddressesTab({ addresses, onChange }: { addresses: ApiAddress[]; onChange: (addresses: ApiAddress[]) => void }) {
  const [form, setForm] = useState<AddressFormState>(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const editing = Boolean(form.id);

  const reset = () => {
    setForm(emptyAddress);
    setMessage("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload: AddressInput = {
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || undefined,
        postalCode: form.postalCode || undefined,
        city: form.city,
        governorate: form.governorate,
        isDefault: form.isDefault,
      };
      const saved = form.id ? await updateCustomerAddress(form.id, payload) : await createCustomerAddress(payload);
      const nextAddresses = form.id
        ? addresses.map((address) => address.id === saved.id ? saved : address)
        : [saved, ...addresses];
      onChange(saved.isDefault ? nextAddresses.map((address) => ({ ...address, isDefault: address.id === saved.id })) : nextAddresses);
      reset();
      setMessage(editing ? "Adresse mise à jour." : "Adresse ajoutée.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible d'enregistrer l'adresse.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (address: ApiAddress) => {
    setForm({
      id: address.id,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      postalCode: address.postalCode ?? "",
      city: address.city,
      governorate: address.governorate,
      isDefault: address.isDefault,
    });
    setMessage("");
  };

  const remove = async (id: string) => {
    await deleteCustomerAddress(id);
    onChange(addresses.filter((address) => address.id !== id));
  };

  return (
    <>
      <SectionTitle sub="Gérez vos adresses pour des livraisons plus rapides.">Adresses de livraison</SectionTitle>
      <form onSubmit={submit} className="mb-8 grid md:grid-cols-2 gap-4 rounded-sm border border-border p-4">
        <Field label="Adresse"><input required value={form.addressLine1} onChange={(event) => setForm((current) => ({ ...current, addressLine1: event.target.value }))} className="input-luxe" /></Field>
        <Field label="Complément d'adresse"><input value={form.addressLine2} onChange={(event) => setForm((current) => ({ ...current, addressLine2: event.target.value }))} className="input-luxe" /></Field>
        <Field label="Code postal"><input value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))} className="input-luxe" /></Field>
        <Field label="Ville"><input required value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} className="input-luxe" /></Field>
        <Field label="Gouvernorat">
          <select required value={form.governorate} onChange={(event) => setForm((current) => ({ ...current, governorate: event.target.value }))} className="input-luxe">
            {TUNISIA_GOVERNORATES.map((governorate) => <option key={governorate} value={governorate}>{governorate}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-muted-foreground pt-7">
          <input type="checkbox" checked={Boolean(form.isDefault)} onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))} className="accent-gold" />
          Adresse par défaut
        </label>
        <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <button disabled={saving} className="h-11 px-6 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm disabled:opacity-60">
            {saving ? "Enregistrement..." : editing ? "Modifier l'adresse" : "Ajouter l'adresse"}
          </button>
          {editing && <button type="button" onClick={reset} className="h-11 px-6 border border-border text-[12px] uppercase tracking-[0.2em] rounded-sm">Annuler</button>}
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      </form>

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} label="Aucune adresse enregistrée pour le moment." linkLabel="Continuer mes achats" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <article key={address.id} className="border border-border rounded-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {address.isDefault && <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Par défaut</p>}
                  <p className="font-medium">{address.addressLine1}</p>
                  {address.addressLine2 && <p className="text-sm text-muted-foreground">{address.addressLine2}</p>}
                  <p className="text-sm text-muted-foreground">{[address.postalCode, address.city, address.governorate].filter(Boolean).join(", ")}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => edit(address)} className="grid h-9 w-9 place-items-center border border-border rounded-sm hover:border-gold hover:text-gold"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(address.id)} className="grid h-9 w-9 place-items-center border border-border rounded-sm hover:border-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ icon: Icon, label, linkLabel }: { icon: ComponentType<{ className?: string }>; label: string; linkLabel: string }) {
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

function formatOrderStatus(status: string) {
  const labels: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    processing: "En préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  };
  return labels[status] ?? status;
}
