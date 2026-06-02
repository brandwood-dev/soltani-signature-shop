import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { CategoryNav } from "./CategoryNav";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TopBar />
      <CategoryNav />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="container-luxe py-16 md:py-24 text-center">
        {eyebrow && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-10 bg-gold" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-gold">{eyebrow}</span>
            <span className="h-px w-10 bg-gold" />
          </div>
        )}
        <h1 className="font-display text-4xl md:text-6xl font-bold">{title}</h1>
        {subtitle && <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}
