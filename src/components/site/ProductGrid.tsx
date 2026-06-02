import { ProductCard, type Product } from "./ProductCard";
import p1 from "@/assets/prod-1.jpg";
import p2 from "@/assets/prod-2.jpg";
import p3 from "@/assets/prod-3.jpg";
import p4 from "@/assets/prod-4.jpg";
import p5 from "@/assets/prod-5.jpg";
import p6 from "@/assets/prod-6.jpg";
import p7 from "@/assets/prod-7.jpg";
import p8 from "@/assets/prod-8.jpg";

const BESTSELLERS: Product[] = [
  { name: "Chronographe Acier Noir", brand: "Tissot", price: 2890, oldPrice: 3400, image: p1, badge: "Best Seller", rating: 5 },
  { name: "Aviator Gold Lens Brown", brand: "Ray-Ban", price: 690, image: p2, badge: "Best Seller", rating: 4.5 },
  { name: "Eau de Parfum Ambré 100ml", brand: "Tom Ford", price: 850, image: p3, rating: 5 },
  { name: "Sac Cabas Matelassé", brand: "Cartier", price: 4200, oldPrice: 5200, image: p4, badge: "Promo", rating: 5 },
];

const NEWARRIVALS: Product[] = [
  { name: "Pendentif Diamant Solitaire", brand: "Cartier", price: 6800, image: p5, badge: "Nouveau", rating: 5 },
  { name: "Rouge à Lèvres Mat Couture", brand: "YSL", price: 145, image: p6, badge: "Nouveau", rating: 4.8 },
  { name: "Montre Rose Gold Cuir", brand: "Rolex", price: 12500, image: p7, badge: "Nouveau", rating: 5 },
  { name: "Lunettes Carré Premium", brand: "Porsche Design", price: 980, image: p8, badge: "Nouveau", rating: 4.7 },
];

export function ProductGrid({ title, eyebrow, items, kicker }: { title: string; eyebrow: string; items: Product[]; kicker?: string }) {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-gold">{eyebrow}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-cream">{title}</h2>
            {kicker && <p className="text-muted-foreground mt-3 max-w-md">{kicker}</p>}
          </div>
          <a href="#" className="text-[11px] uppercase tracking-[0.3em] text-gold hover:text-cream transition underline-offset-4 hover:underline">
            Voir tout →
          </a>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
          {items.map((p) => <ProductCard key={p.name} p={p} />)}
        </div>
      </div>
    </section>
  );
}

export { BESTSELLERS, NEWARRIVALS };
