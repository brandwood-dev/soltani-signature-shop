import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Check, CreditCard, Lock, Truck, User } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { createCodOrder, createCustomerCodOrder, type CreateCodOrderInput } from "@/lib/catalog-api";
import { getCustomerProfile, type CustomerProfile } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { clearQuickCheckoutLines, readQuickCheckoutLines } from "@/lib/quick-checkout";
import { TUNISIA_GOVERNORATES } from "@/lib/tunisia";
import {
  DEFAULT_SHOP_SETTINGS,
  calculateShipping,
  getPublicShopSettings,
  type ShopSettings,
} from "@/lib/settings-api";
import { trackMetaPixelEvent } from "@/lib/meta-pixel";
import { canonicalLink, seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search) => ({
    quick: search.quick === "1" ? "1" : undefined,
  }),
  head: () => ({
    meta: seoMeta({ title: "Commande — Soltani Signature", description: "Finalisez votre commande Soltani Signature.", path: "/checkout", noindex: true }),
    links: [canonicalLink("/checkout")],
  }),
  component: CheckoutPage,
});

const STEPS = [
  { n: 1, label: "Identification", icon: User },
  { n: 2, label: "Livraison", icon: Truck },
  { n: 3, label: "Paiement", icon: CreditCard },
];

const SHIPPING_LABEL = "Livraison standard Tunisie";
const EMPTY_CART_MESSAGE = "Votre panier est vide. Ajoutez au moins un produit avant de passer commande.";
type CheckoutPaymentMethod = "CASH_ON_DELIVERY" | "CARD";

function CheckoutPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { lines: cartLines, subtotal: cartSubtotal, clear } = useCart();
  const [quickLines, setQuickLines] = useState(() => (search.quick === "1" ? readQuickCheckoutLines() : []));
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("CASH_ON_DELIVERY");
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const initiatedCheckoutRef = useRef(false);
  const addedPaymentInfoRef = useRef(false);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "Tunis",
    governorate: "Tunis",
    postalCode: "",
  });

  useEffect(() => {
    getPublicShopSettings()
      .then((next) => {
        setSettings(next);
        setPaymentMethod(!next.cashOnDeliveryEnabled && next.cardPaymentEnabled ? "CARD" : "CASH_ON_DELIVERY");
      })
      .catch(() => setSettings(DEFAULT_SHOP_SETTINGS));
  }, []);

  useEffect(() => {
    getCustomerProfile()
      .then((profile) => {
        setCustomerProfile(profile);
        const defaultAddress = profile.addresses.find((address) => address.isDefault) ?? profile.addresses[0];
        const fullName = [profile.user.firstName, profile.user.lastName].filter(Boolean).join(" ");
        const [firstName, ...lastNameParts] = fullName.split(" ").filter(Boolean);

        setForm((current) => ({
          ...current,
          email: profile.user.email,
          firstName: firstName ?? "",
          lastName: lastNameParts.join(" "),
          phone: profile.user.phone ?? "",
          ...(defaultAddress
            ? {
                addressLine1: defaultAddress.addressLine1,
                addressLine2: defaultAddress.addressLine2 ?? "",
                city: defaultAddress.city,
                governorate: defaultAddress.governorate,
                postalCode: defaultAddress.postalCode ?? "",
              }
            : {}),
        }));
        if (defaultAddress) setSelectedAddressId(defaultAddress.id);
      })
      .catch(() => undefined);
  }, []);

  const isQuickCheckout = search.quick === "1";
  const lines = isQuickCheckout ? quickLines : cartLines;
  const subtotal = isQuickCheckout ? quickLines.reduce((sum, line) => sum + line.price * line.qty, 0) : cartSubtotal;
  const shipping = calculateShipping(subtotal, settings);
  const total = subtotal + shipping;
  const paymentIntro = settings.cashOnDeliveryEnabled
    ? "Paiement à la livraison disponible partout en Tunisie."
    : settings.cardPaymentEnabled
      ? "Paiement par carte disponible."
      : "Aucun moyen de paiement disponible pour le moment.";

  useEffect(() => {
    if (initiatedCheckoutRef.current || !lines.length) return;
    initiatedCheckoutRef.current = true;
    trackMetaPixelEvent("InitiateCheckout", {
      content_ids: lines.map((line) => line.variantId),
      content_type: "product",
      contents: lines.map((line) => ({ id: line.variantId, quantity: line.qty, item_price: line.price })),
      num_items: lines.reduce((sum, line) => sum + line.qty, 0),
      value: subtotal,
      currency: "TND",
    });
  }, [lines, subtotal]);

  useEffect(() => {
    if (step !== 3 || addedPaymentInfoRef.current || !lines.length) return;
    addedPaymentInfoRef.current = true;
    trackMetaPixelEvent("AddPaymentInfo", {
      content_ids: lines.map((line) => line.variantId),
      content_type: "product",
      contents: lines.map((line) => ({ id: line.variantId, quantity: line.qty, item_price: line.price })),
      payment_method: paymentMethod,
      value: subtotal,
      currency: "TND",
    });
  }, [lines, paymentMethod, step, subtotal]);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (["addressLine1", "addressLine2", "city", "governorate", "postalCode"].includes(key)) {
      setSelectedAddressId("new");
    }
  };

  const selectSavedAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === "new") {
      setForm((current) => ({
        ...current,
        addressLine1: "",
        addressLine2: "",
        city: "",
        governorate: "Tunis",
        postalCode: "",
      }));
      return;
    }

    const address = customerProfile?.addresses.find((item) => item.id === addressId);
    if (!address) return;
    setForm((current) => ({
      ...current,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      city: address.city,
      governorate: address.governorate,
      postalCode: address.postalCode ?? "",
    }));
  };

  const nextStep = () => {
    setError(null);
    if (!lines.length) {
      setError(EMPTY_CART_MESSAGE);
      return;
    }
    if (step === 1 && (!form.email || !form.firstName || !form.lastName || !form.phone)) {
      setError("Merci de compléter vos coordonnées.");
      return;
    }
    if (step === 2 && (!form.addressLine1 || !form.city || !form.governorate)) {
      setError("Merci de compléter l'adresse de livraison.");
      return;
    }
    setStep((current) => Math.min(3, current + 1));
  };

  const placeOrder = async () => {
    if (!lines.length) {
      setError(EMPTY_CART_MESSAGE);
      return;
    }
    if (!settings.cashOnDeliveryEnabled && !settings.cardPaymentEnabled) {
      setError("Aucun moyen de paiement n'est disponible pour le moment.");
      return;
    }
    if (paymentMethod === "CARD") {
      setError("Le paiement par carte sera activé prochainement.");
      return;
    }
    if (!settings.cashOnDeliveryEnabled) {
      setError("Le paiement à la livraison est désactivé.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderInput: CreateCodOrderInput = {
        customerEmail: form.email,
        paymentMethod: "CASH_ON_DELIVERY",
        shippingAddress: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || undefined,
          city: form.city,
          governorate: form.governorate,
          postalCode: form.postalCode || undefined,
        },
        items: lines.map((line) => ({
          variantId: line.variantId,
          quantity: line.qty,
        })),
      };
      const order = customerProfile ? await createCustomerCodOrder(orderInput) : await createCodOrder(orderInput);

      localStorage.setItem(
        "soltani-last-order",
        JSON.stringify({
          number: order.reference,
          date: new Date().toISOString(),
          lines,
          subtotal: Number(order.subtotal),
          shipping: Number(order.shippingTotal),
          discount: Number(order.discountTotal),
          total: Number(order.total),
          payment: "Paiement à la livraison",
          shippingMethod: SHIPPING_LABEL,
          address: {
            name: `${form.firstName} ${form.lastName}`.trim(),
            line: form.addressLine1,
            city: form.city,
            zip: form.postalCode,
            phone: form.phone,
          },
        }),
      );
      if (isQuickCheckout) {
        clearQuickCheckoutLines();
        setQuickLines([]);
      } else {
        clear();
      }
      navigate({ to: "/order-confirmation" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer la commande.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <div className="container-luxe py-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Finaliser la commande</h1>
        <p className="text-sm text-muted-foreground mb-10">{paymentIntro}</p>

        <div className="flex items-center justify-between max-w-2xl mx-auto mb-12">
          {STEPS.map((item, index) => (
            <div key={item.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`h-11 w-11 grid place-items-center rounded-full border-2 transition ${step >= item.n ? "bg-gold border-gold text-ink" : "border-border text-muted-foreground"}`}>
                  {step > item.n ? <Check className="h-5 w-5" /> : <item.icon className="h-4 w-4" />}
                </div>
                <span className={`mt-2 text-[10px] uppercase tracking-widest ${step >= item.n ? "text-gold" : "text-muted-foreground"}`}>{item.label}</span>
              </div>
              {index < STEPS.length - 1 && <div className={`h-px flex-1 mx-2 ${step > item.n ? "bg-gold" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div className="bg-secondary/30 border border-border rounded-sm p-6 md:p-8">
            {error && <div className="mb-5 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold mb-2">Vos coordonnées</h2>
                <Field label="Email"><input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="input-luxe" placeholder="vous@exemple.com" /></Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Prénom"><input value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} className="input-luxe" /></Field>
                  <Field label="Nom"><input value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} className="input-luxe" /></Field>
                </div>
                <Field label="Téléphone"><input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="input-luxe" placeholder="+216 00 000 000" /></Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold mb-2">Adresse de livraison</h2>
                {customerProfile?.addresses.length ? (
                  <Field label="Adresse enregistrée">
                    <select value={selectedAddressId} onChange={(event) => selectSavedAddress(event.target.value)} className="input-luxe">
                      {customerProfile.addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.addressLine1}, {address.city}{address.isDefault ? " — par défaut" : ""}
                        </option>
                      ))}
                      <option value="new">Saisir une nouvelle adresse</option>
                    </select>
                  </Field>
                ) : null}
                <Field label="Adresse"><input value={form.addressLine1} onChange={(e) => updateField("addressLine1", e.target.value)} className="input-luxe" placeholder="123 Avenue Habib Bourguiba" /></Field>
                <Field label="Complément d'adresse"><input value={form.addressLine2} onChange={(e) => updateField("addressLine2", e.target.value)} className="input-luxe" /></Field>
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label="Code postal"><input value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} className="input-luxe" /></Field>
                  <Field label="Ville"><input value={form.city} onChange={(e) => updateField("city", e.target.value)} className="input-luxe" /></Field>
                  <Field label="Gouvernorat">
                    <select value={form.governorate} onChange={(e) => updateField("governorate", e.target.value)} className="input-luxe">
                      {TUNISIA_GOVERNORATES.map((governorate) => <option key={governorate} value={governorate}>{governorate}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="rounded-sm border border-gold/30 bg-gold/5 p-4 text-sm">
                  {shipping === 0 ? "Livraison offerte." : `${SHIPPING_LABEL} — tarif fixe ${settings.shippingFee} DT.`}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold mb-2">Mode de paiement</h2>
                {settings.cashOnDeliveryEnabled && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-gold bg-gold/5 p-4">
                    <input type="radio" checked={paymentMethod === "CASH_ON_DELIVERY"} onChange={() => setPaymentMethod("CASH_ON_DELIVERY")} className="accent-gold mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Paiement à la livraison</p>
                      <p className="text-xs text-muted-foreground">Espèces à la réception de la commande.</p>
                    </div>
                    <CreditCard className="h-5 w-5 text-gold" />
                  </label>
                )}
                {settings.cardPaymentEnabled && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-border bg-background p-4">
                    <input type="radio" checked={paymentMethod === "CARD"} onChange={() => setPaymentMethod("CARD")} className="accent-gold mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Paiement par carte</p>
                      <p className="text-xs text-muted-foreground">Activation du paiement en ligne en cours.</p>
                    </div>
                    <CreditCard className="h-5 w-5 text-gold" />
                  </label>
                )}
                {!settings.cashOnDeliveryEnabled && !settings.cardPaymentEnabled && (
                  <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    Aucun moyen de paiement n'est disponible actuellement.
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border flex justify-between">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="text-sm uppercase tracking-widest text-muted-foreground hover:text-gold">← Retour</button>
              ) : (
                <Link to="/cart" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-gold">← Panier</Link>
              )}
              {step < 3 ? (
                <button onClick={nextStep} className="px-6 h-11 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm">Continuer →</button>
              ) : (
                <button disabled={submitting || !lines.length} aria-disabled={submitting || !lines.length} onClick={placeOrder} className="px-6 h-11 bg-gold text-ink text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-ink hover:text-gold transition rounded-sm inline-flex items-center gap-2 disabled:opacity-60"><Lock className="h-4 w-4" /> {submitting ? "Création..." : `Confirmer ${total} DT`}</button>
              )}
            </div>
          </div>

          <aside className="bg-card border border-border rounded-sm p-6 h-fit">
            <h3 className="font-display text-lg font-bold mb-5">Votre commande</h3>
            <div className="space-y-4 pb-4 border-b border-border">
              {lines.length === 0 ? (
                <p className="text-sm text-muted-foreground">{EMPTY_CART_MESSAGE}</p>
              ) : (
                lines.map((line) => (
                  <div key={line.id} className="flex gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-sm bg-background">
                      <img src={line.image} alt="" className="h-full w-full object-cover" />
                      <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-gold text-ink text-[10px] font-bold">{line.qty}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-gold">{line.brand}</p>
                      <p className="text-sm truncate">{line.name}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{line.price * line.qty} DT</p>
                  </div>
                ))
              )}
            </div>
            <dl className="space-y-2 text-sm py-4 border-b border-border">
              <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd className="tabular-nums">{subtotal} DT</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Livraison</dt><dd className="tabular-nums">{shipping === 0 ? "Offerte" : `${shipping} DT`}</dd></div>
            </dl>
            <div className="flex justify-between items-end pt-4">
              <span className="font-display font-bold">Total</span>
              <span className="font-display font-bold text-2xl text-gold tabular-nums">{total} DT</span>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-foreground/60 mb-2">{label}</span>
      {children}
    </label>
  );
}
