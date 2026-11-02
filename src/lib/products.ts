export type Product = {
  id: string; name: string; category: string; brand: string; price: number;
  oldPrice?: number; rating: number; reviews: number; stock: number; badge?: string;
  image: string; description: string; featured?: boolean;
};

export const products: Product[] = [
  { id:"p1", name:"Studio Wireless Headphones", category:"Electronics", brand:"SoundNest", price:2499, oldPrice:3999, rating:4.6, reviews:1284, stock:24, badge:"Bestseller", image:"https://images.unsplash.com/photo-150 Sound?auto=format&fit=crop&w=900&q=80".replace("photo-150 Sound","photo-1505740420928-5e560c06d30e"), description:"Comfortable over-ear wireless headphones with rich sound, soft cushions and all-day battery life.", featured:true },
  { id:"p2", name:"Everyday Smart Watch", category:"Electronics", brand:"Pulse", price:3299, oldPrice:4999, rating:4.3, reviews:862, stock:17, badge:"Popular", image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", description:"A versatile everyday watch with activity tracking, notifications and a clean, modern design.", featured:true },
  { id:"p3", name:"Minimal Ceramic Table Lamp", category:"Home", brand:"Haven", price:1599, oldPrice:2199, rating:4.5, reviews:314, stock:12, image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80", description:"A warm, understated lamp that adds a calm glow to your desk, bedside table or reading nook.", featured:true },
  { id:"p4", name:"Daily Carry Backpack", category:"Fashion", brand:"Northline", price:1899, oldPrice:2599, rating:4.4, reviews:527, stock:31, badge:"Great value", image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80", description:"A practical lightweight backpack with a roomy main compartment and organized pockets.", featured:true },
  { id:"p5", name:"Insulated Travel Bottle", category:"Home", brand:"SipWell", price:699, oldPrice:999, rating:4.2, reviews:209, stock:52, image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80", description:"A reusable insulated bottle for your commute, gym bag or weekend adventures." },
  { id:"p6", name:"Classic Running Sneakers", category:"Fashion", brand:"Stride", price:2799, oldPrice:3599, rating:4.1, reviews:671, stock:9, badge:"Low stock", image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", description:"Everyday trainers designed for comfortable walks, light runs and casual outfits." },
  { id:"p7", name:"Mechanical Keyboard", category:"Electronics", brand:"KeyCraft", price:2199, oldPrice:2999, rating:4.7, reviews:441, stock:20, image:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80", description:"A tactile keyboard with a compact layout for focused work and comfortable typing." },
  { id:"p8", name:"Botanical Desk Planter", category:"Home", brand:"GreenCorner", price:499, oldPrice:699, rating:4.0, reviews:156, stock:40, image:"https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80", description:"A simple decorative planter to bring a little greenery to your home or workspace." }
];
export const categories = ["All", "Electronics", "Home", "Fashion"];
export const money = (amount: number) => new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(amount);
