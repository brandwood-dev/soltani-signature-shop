import { Link } from "@tanstack/react-router";
import { ProductCarousel } from "./ProductCarousel";
import type { Product } from "./ProductCard";
import p1 from "@/assets/prod-1.jpg";
import p2 from "@/assets/prod-2.jpg";
import p3 from "@/assets/prod-3.jpg";
import p4 from "@/assets/prod-4.jpg";
import p5 from "@/assets/prod-5.jpg";
import p6 from "@/assets/prod-6.jpg";

const PACKS: Product[] = [
  { slug: "pack-soins-visage", name: "Pack Soins Visage", brand: "Soltani Signature", category: "coffrets-parfum", price: 290, oldPrice: 350, image: p1, badge: "Nouveau", rating: 4.9 },
  { slug: "pack-parfum-decouverte", name: "Pack Parfum Découverte", brand: "Soltani Signature", category: "coffrets-parfum", price: 320, image: p2, badge: "Best Seller", rating: 5 },
  { slug: "pack-cheveux-rituel", name: "Pack Cheveux Rituel", brand: "Soltani Signature", category: "coffrets-parfum", price: 240, image: p3, rating: 4.8 },
  { slug: "pack-maquillage-essentiels", name: "Pack Maquillage Essentiels", brand: "Soltani Signature", category: "coffrets-parfum", price: 380, oldPrice: 450, image: p4, badge: "Promo", rating: 4.7 },
  { slug: "pack-pour-elle", name: "Pack Pour Elle", brand: "Soltani Signature", category: "coffrets-parfum", price: 520, image: p5, badge: "Best Seller", rating: 5 },
  { slug: "pack-pour-lui", name: "Pack Pour Lui", brand: "Soltani Signature", category: "coffrets-parfum", price: 480, image: p6, rating: 4.9 },
];

export function Packs() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Coffrets</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground">Nos Packs</h2>
            <p className="text-muted-foreground mt-3 max-w-md">Des sélections signature pensées comme des rituels.</p>
          </div>
          <Link
            to="/category/$slug"
            params={{ slug: "coffrets-parfum" }}
            className="text-[11px] uppercase tracking-[0.3em] text-gold hover:text-cream transition underline-offset-4 hover:underline"
          >
            Voir tout →
          </Link>
        </div>

        <ProductCarousel items={PACKS} />
      </div>
    </section>
  );
}
