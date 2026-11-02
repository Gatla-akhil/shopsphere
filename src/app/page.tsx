 "use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, Heart, UserRound, MapPin, ChevronDown, Star, Menu, X, ArrowRight, PackageCheck, ShieldCheck, Headphones, Truck, Minus, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { products, categories, money, type Product } from "@/lib/products";

type CartItem = { id: string; qty: number };
const imageFallback = "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [orderDone, setOrderDone] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem("shopsphere-cart");
      const w = localStorage.getItem("shopsphere-wishlist");
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem("shopsphere-cart", JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { try { localStorage.setItem("shopsphere-wishlist", JSON.stringify(wishlist)); } catch {} }, [wishlist]);

  const visibleProducts = useMemo(() => {
    let result = products.filter(p => (category === "All" || p.category === category) &&
      `${p.name} ${p.category} ${p.brand} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
    if (sort === "price-low") result = [...result].sort((a,b) => a.price-b.price);
    if (sort === "price-high") result = [...result].sort((a,b) => b.price-a.price);
    if (sort === "rating") result = [...result].sort((a,b) => b.rating-a.rating);
    if (sort === "featured") result = [...result].sort((a,b) => Number(!!b.featured)-Number(!!a.featured));
    return result;
  }, [query, category, sort]);
  const cartProducts = cart.map(item => ({ ...item, product: products.find(p => p.id === item.id)! })).filter(i => i.product);
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);
  const subtotal = cartProducts.reduce((n, i) => n + i.product.price * i.qty, 0);

  function toast(message: string) { setNotice(message); window.setTimeout(() => setNotice(""), 2400); }
  function addToCart(p: Product) {
    if (p.stock < 1) return toast("This item is currently out of stock.");
    setCart(old => {
      const found = old.find(i => i.id === p.id);
      if (found) return old.map(i => i.id === p.id ? { ...i, qty: Math.min(i.qty+1, p.stock) } : i);
      return [...old, { id:p.id, qty:1 }];
    });
    toast(`${p.name} added to your cart`);
  }
  function changeQty(id: string, qty: number) {
    if (qty < 1) setCart(old => old.filter(i => i.id !== id));
    else setCart(old => old.map(i => i.id === id ? { ...i, qty: Math.min(qty, products.find(p=>p.id===id)?.stock ?? qty) } : i));
  }
  function toggleWish(id: string) {
    setWishlist(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
    toast(wishlist.includes(id) ? "Removed from wishlist" : "Saved to wishlist");
  }
  function placeDemoOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim() || !address.trim()) return toast("Please enter your name and delivery address.");
    setOrderDone(true); setCart([]); setCheckout(false);
  }

  function ProductCard({ p }: { p: Product }) {
    const discount = p.oldPrice ? Math.round((1-p.price/p.oldPrice)*100) : 0;
    return <article className="group overflow-hidden rounded-2xl border border-black/5 bg-white transition hover:-translate-y-1 hover:shadow-soft">
      <div className="product-image relative flex h-48 items-center justify-center p-4 sm:h-52">
        {p.badge && <span className="absolute left-3 top-3 rounded-full bg-[#e8f3ef] px-2.5 py-1 text-[11px] font-bold text-brand">{p.badge}</span>}
        <button aria-label={wishlist.includes(p.id) ? "Remove from wishlist" : "Add to wishlist"} onClick={() => toggleWish(p.id)} className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-sm transition hover:scale-105">
          <Heart size={17} className={wishlist.includes(p.id) ? "fill-rose-500 text-rose-500" : "text-slate-600"} />
        </button>
        <img src={p.image || imageFallback} alt={p.name} onError={(e)=>{(e.currentTarget as HTMLImageElement).src=imageFallback;}} className="h-full w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[.12em] text-brand">{p.brand} · {p.category}</p>
        <button onClick={() => setSelected(p)} className="line-clamp-2 min-h-[42px] text-left text-sm font-semibold leading-5 hover:text-brand">{p.name}</button>
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-500"><Star size={13} className="fill-amber-400" /> <span className="font-semibold text-slate-700">{p.rating}</span><span className="text-slate-400">({p.reviews.toLocaleString("en-IN")})</span></div>
        <div className="mt-3 flex items-baseline gap-2"><span className="text-lg font-bold">{money(p.price)}</span>{p.oldPrice && <><span className="text-xs text-slate-400 line-through">{money(p.oldPrice)}</span><span className="text-xs font-bold text-emerald-700">{discount}% off</span></>}</div>
        <p className="mt-1 text-xs text-slate-500">{p.stock > 0 ? `${p.stock} available` : "Out of stock"}</p>
        <button onClick={() => addToCart(p)} disabled={p.stock < 1} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-40"><ShoppingCart size={15}/> Add to cart</button>
      </div>
    </article>;
  }

  return <main className="min-h-screen">
    <div className="bg-ink text-white"><div className="container flex min-h-9 items-center justify-between gap-3 text-[11px] sm:text-xs"><p className="flex items-center gap-1.5"><Truck size={14}/> Free delivery on orders over ₹1,499</p><p className="hidden sm:block text-white/70">Thoughtful finds. Everyday prices.</p><button onClick={()=>toast("Support: hello@shopsphere.example")} className="hover:underline">Need help?</button></div></div>
    <header className="header-shadow sticky top-0 z-30 border-b border-black/5 bg-white">
      <div className="container flex items-center gap-3 py-4">
        <a href="#" className="flex shrink-0 items-center gap-2" aria-label="ShopSphere home"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-lg font-black text-white">S</span><span className="hidden sm:block text-xl font-black tracking-tight">shop<span className="text-brand">sphere</span><span className="ml-1 align-top text-[9px] font-semibold text-slate-400">™</span></span></a>
        <button onClick={()=>toast("Delivery location can be configured in account settings.")} className="hidden items-center gap-1 rounded-xl px-2 py-2 text-left hover:bg-sand md:flex"><MapPin size={17}/><span><span className="block text-[10px] text-slate-500">Deliver to</span><b className="block text-xs">Your location</b></span><ChevronDown size={13}/></button>
        <form onSubmit={e=>{e.preventDefault();setSearchOpen(false);document.getElementById("catalogue")?.scrollIntoView({behavior:"smooth"});}} className="flex min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-sand/70 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
          <label htmlFor="search" className="sr-only">Search products</label><input id="search" value={query} onChange={e=>setQuery(e.target.value)} onFocus={()=>setSearchOpen(true)} placeholder="Search products, brands and more..." className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none sm:px-4"/>
          <button aria-label="Search" className="grid w-12 shrink-0 place-items-center bg-brand text-white transition hover:bg-ink"><Search size={18}/></button>
        </form>
        <button onClick={()=>toast("Account sign-in is not configured in this starter.")} className="hidden rounded-xl p-2 text-left hover:bg-sand sm:flex sm:items-center sm:gap-2"><UserRound size={19}/><span className="hidden lg:block"><span className="block text-[10px] text-slate-500">Welcome</span><b className="block text-xs">Sign in</b></span></button>
        <button onClick={()=>setCartOpen(true)} className="relative flex items-center gap-2 rounded-xl p-2 hover:bg-sand" aria-label={`Open cart, ${cartCount} items`}><ShoppingCart size={22}/><span className="hidden text-sm font-semibold sm:block">Cart</span>{cartCount>0&&<span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-black text-ink">{cartCount}</span>}</button>
      </div>
      <nav className="border-t border-slate-100"><div className="container flex items-center gap-1 overflow-x-auto py-2.5 text-xs font-semibold">
        <button onClick={()=>{setCategory("All");setQuery("");}} className="mr-2 flex shrink-0 items-center gap-1.5 rounded-lg bg-sand px-3 py-2"><Menu size={14}/> All products</button>
        {categories.slice(1).map(c=><button key={c} onClick={()=>{setCategory(c);document.getElementById("catalogue")?.scrollIntoView({behavior:"smooth"});}} className={`shrink-0 rounded-lg px-3 py-2 transition hover:bg-sand ${category===c?"bg-[#e8f3ef] text-brand":""}`}>{c}</button>)}
        <span className="ml-auto hidden shrink-0 text-slate-400 md:block">Curated for everyday living</span>
      </div></nav>
    </header>

    <section className="container pt-6 sm:pt-8">
      <div className="relative overflow-hidden rounded-[28px] bg-[#dcebe3]">
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full bg-white/40 blur-2xl sm:h-96 sm:w-96"/>
        <div className="relative grid min-h-[300px] items-center gap-6 px-6 py-9 sm:min-h-[350px] sm:grid-cols-[1.05fr_.95fr] sm:px-12 lg:px-16">
          <div className="max-w-xl"><span className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-brand"><span className="h-1.5 w-1.5 rounded-full bg-brand"/> The everyday edit</span><h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">Good things.<br/><span className="text-brand">Better everyday.</span></h1><p className="mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-base">Discover useful essentials, considered design and little upgrades that make daily life feel better.</p><button onClick={()=>{setCategory("All");document.getElementById("catalogue")?.scrollIntoView({behavior:"smooth"});}} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:bg-ink">Explore the collection <ArrowRight size={16}/></button><p className="mt-4 text-xs text-slate-500">Sample catalogue · Prices shown in INR</p></div>
          <div className="relative hidden h-64 sm:block lg:h-72"><div className="absolute left-4 top-4 h-52 w-52 rounded-full bg-white/50 lg:left-10 lg:h-64 lg:w-64"/><img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85" alt="A calm, curated home interior" className="absolute right-0 top-0 h-full w-[88%] rounded-[24px] object-cover shadow-xl" /><div className="absolute -bottom-2 left-0 rounded-2xl bg-white p-4 shadow-soft"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ShopSphere picks</p><p className="mt-1 text-sm font-bold">Small upgrades, big joy.</p></div></div>
        </div>
      </div>
    </section>

    <section className="container py-7 sm:py-10">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{icon:Truck,title:"Delivery made easy",sub:"Convenient doorstep delivery"},{icon:ShieldCheck,title:"Shopping with care",sub:"Secure-ready architecture"},{icon:PackageCheck,title:"Useful by design",sub:"Curated everyday essentials"},{icon:Headphones,title:"Here to help",sub:"Customer-first support"}].map(({icon:Icon,title,sub})=><div key={title} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e8f3ef] text-brand"><Icon size={17}/></span><div><p className="text-xs font-bold sm:text-sm">{title}</p><p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">{sub}</p></div></div>)}
      </div>
    </section>

    <section id="catalogue" className="container scroll-mt-36 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-brand">Find your next favourite</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Explore the collection</h2><p className="mt-2 text-sm text-slate-500">Everyday essentials, handpicked for you.</p></div><label className="flex items-center gap-2 text-xs text-slate-500">Sort by <select value={sort} onChange={e=>setSort(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-ink outline-none focus:border-brand"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select></label></div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${category===c?"border-brand bg-brand text-white":"border-slate-200 bg-white hover:border-brand hover:text-brand"}`}>{c}</button>)}</div>
      {query&&<div className="mt-4 flex items-center justify-between text-sm"><span>Results for <b>“{query}”</b></span><button onClick={()=>setQuery("")} className="text-brand underline">Clear search</button></div>}
      <p className="mt-5 text-xs text-slate-500">{visibleProducts.length} products found</p>
      {visibleProducts.length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">{visibleProducts.map(p=><ProductCard key={p.id} p={p}/>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Search className="mx-auto text-slate-400" size={28}/><h3 className="mt-3 font-bold">No products found</h3><p className="mt-1 text-sm text-slate-500">Try another search or clear the filters.</p><button onClick={()=>{setQuery("");setCategory("All");}} className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Clear filters</button></div>}
    </section>

    <footer className="bg-ink text-white"><div className="container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4"><div><a href="#" className="text-xl font-black">shop<span className="text-[#86c7b1]">sphere</span></a><p className="mt-3 max-w-xs text-sm leading-6 text-white/60">Thoughtful everyday finds, with a little more care in every detail.</p></div><div><h3 className="text-sm font-bold">Shop</h3><div className="mt-3 grid gap-2 text-sm text-white/60">{categories.slice(1).map(c=><button key={c} onClick={()=>{setCategory(c);document.getElementById("catalogue")?.scrollIntoView({behavior:"smooth"});}} className="text-left hover:text-white">{c}</button>)}</div></div><div><h3 className="text-sm font-bold">Customer care</h3><div className="mt-3 grid gap-2 text-sm text-white/60"><button onClick={()=>toast("Support: hello@shopsphere.example")} className="text-left hover:text-white">Contact support</button><button onClick={()=>toast("Returns policy: configure your store policy before launch.")} className="text-left hover:text-white">Returns & refunds</button><button onClick={()=>toast("Privacy policy: add your published policy before launch.")} className="text-left hover:text-white">Privacy policy</button></div></div><div><h3 className="text-sm font-bold">Stay in the loop</h3><p className="mt-3 text-sm leading-6 text-white/60">Fresh finds and useful updates. No noise.</p><form onSubmit={e=>{e.preventDefault();toast("Thanks for your interest! Newsletter service needs setup.");}} className="mt-3 flex overflow-hidden rounded-xl bg-white"><input type="email" required placeholder="Your email address" className="min-w-0 flex-1 px-3 py-3 text-sm text-ink outline-none"/><button className="bg-brand px-4 text-sm font-bold">Join</button></form></div></div><div className="border-t border-white/10"><div className="container flex flex-col justify-between gap-2 py-4 text-xs text-white/40 sm:flex-row"><p>© {new Date().getFullYear()} ShopSphere. Independent demo storefront.</p><p>Sample products · No real payment processing</p></div></div></footer>

    {notice&&<div role="status" className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-xl"><CheckCircle2 size={17} className="text-[#86c7b1]"/>{notice}</div>}
    {selected&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={()=>setSelected(null)}><div role="dialog" aria-modal="true" aria-label={selected.name} onClick={e=>e.stopPropagation()} className="relative grid max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white sm:grid-cols-2"><button onClick={()=>setSelected(null)} aria-label="Close product details" className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow"><X size={18}/></button><div className="product-image flex min-h-64 items-center justify-center p-8"><img src={selected.image} alt={selected.name} className="max-h-72 object-contain mix-blend-multiply"/></div><div className="p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-widest text-brand">{selected.brand} · {selected.category}</p><h2 className="mt-3 text-2xl font-black">{selected.name}</h2><div className="mt-3 flex items-center gap-1 text-sm text-amber-500"><Star size={15} className="fill-amber-400"/><b className="text-ink">{selected.rating}</b><span className="text-slate-400">({selected.reviews} reviews)</span></div><p className="mt-5 text-sm leading-6 text-slate-600">{selected.description}</p><p className="mt-5 text-2xl font-black">{money(selected.price)} {selected.oldPrice&&<span className="ml-2 text-sm font-normal text-slate-400 line-through">{money(selected.oldPrice)}</span>}</p><p className="mt-2 text-xs text-emerald-700">{selected.stock} in stock</p><button onClick={()=>{addToCart(selected);setSelected(null);}} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-bold text-white hover:bg-ink"><ShoppingCart size={17}/> Add to cart</button></div></div></div>}

    {cartOpen&&<div className="fixed inset-0 z-50 bg-ink/40" onClick={()=>setCartOpen(false)}><aside role="dialog" aria-modal="true" aria-label="Shopping cart" onClick={e=>e.stopPropagation()} className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-5"><div><h2 className="text-xl font-black">Your cart</h2><p className="mt-1 text-xs text-slate-500">{cartCount} items</p></div><button onClick={()=>setCartOpen(false)} aria-label="Close cart" className="rounded-full p-2 hover:bg-sand"><X size={20}/></button></div>{cartProducts.length===0?<div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><ShoppingCart size={36} className="text-slate-300"/><h3 className="mt-4 font-bold">Your cart is taking a break</h3><p className="mt-2 text-sm text-slate-500">Add something you love and it will show up here.</p><button onClick={()=>setCartOpen(false)} className="mt-5 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white">Continue shopping</button></div>:<><div className="flex-1 space-y-4 overflow-y-auto p-5">{cartProducts.map(({product:p,qty})=><div key={p.id} className="flex gap-3 border-b border-slate-100 pb-4"><div className="product-image grid h-24 w-24 shrink-0 place-items-center rounded-xl p-2"><img src={p.image} alt="" className="h-full w-full object-contain mix-blend-multiply"/></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-bold">{p.name}</p><p className="mt-1 text-sm font-black">{money(p.price)}</p><div className="mt-3 flex items-center gap-3"><div className="flex items-center rounded-lg border border-slate-200"><button aria-label="Decrease quantity" onClick={()=>changeQty(p.id,qty-1)} className="p-1.5"><Minus size={13}/></button><span className="w-6 text-center text-xs font-bold">{qty}</span><button aria-label="Increase quantity" onClick={()=>changeQty(p.id,qty+1)} className="p-1.5"><Plus size={13}/></button></div><button onClick={()=>changeQty(p.id,0)} className="flex items-center gap-1 text-xs text-rose-600"><Trash2 size={13}/> Remove</button></div></div></div>)}</div><div className="border-t p-5"><div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><b>{money(subtotal)}</b></div><div className="mt-2 flex justify-between text-sm"><span className="text-slate-500">Delivery</span><b>{subtotal>=1499?"FREE":money(79)}</b></div><div className="mt-3 flex justify-between border-t pt-3"><span className="font-bold">Estimated total</span><span className="text-lg font-black">{money(subtotal+(subtotal>=1499?0:79))}</span></div><p className="mt-2 text-[11px] leading-4 text-slate-400">Demo estimate only. Taxes and final delivery costs are not calculated by a server.</p><button onClick={()=>{setCartOpen(false);setCheckout(true);}} className="mt-4 w-full rounded-xl bg-brand px-4 py-3 font-bold text-white hover:bg-ink">Continue to demo checkout</button></div></>}</aside></div>}

    {checkout&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"><div role="dialog" aria-modal="true" aria-label="Demo checkout" className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8"><button onClick={()=>setCheckout(false)} aria-label="Close checkout" className="absolute right-4 top-4 rounded-full p-2 hover:bg-sand"><X size={18}/></button><p className="text-xs font-bold uppercase tracking-widest text-brand">Demo only</p><h2 className="mt-2 text-2xl font-black">Delivery details</h2><p className="mt-2 text-sm leading-5 text-slate-500">This form demonstrates the checkout UI. It does not create a real order or take payment.</p><form onSubmit={placeDemoOrder} className="mt-5 space-y-4"><div><label htmlFor="customerName" className="mb-1.5 block text-xs font-bold">Full name</label><input id="customerName" required value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-brand"/></div><div><label htmlFor="address" className="mb-1.5 block text-xs font-bold">Delivery address</label><textarea id="address" required rows={3} value={address} onChange={e=>setAddress(e.target.value)} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-brand"/></div><div className="flex justify-between rounded-xl bg-sand p-4"><span className="text-sm text-slate-600">Estimated total</span><b>{money(subtotal+(subtotal>=1499?0:79))}</b></div><button className="w-full rounded-xl bg-brand px-4 py-3 font-bold text-white hover:bg-ink">Submit demo order</button></form></div></div>}
    {orderDone&&<div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4"><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-white p-8 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f3ef] text-brand"><CheckCircle2 size={28}/></span><h2 className="mt-4 text-2xl font-black">Demo checkout complete</h2><p className="mt-2 text-sm leading-6 text-slate-500">Thanks, {customerName}. This is only a local UI demonstration. No order was saved and no payment was made.</p><button onClick={()=>{setOrderDone(false);setCustomerName("");setAddress("");}} className="mt-6 w-full rounded-xl bg-brand px-4 py-3 font-bold text-white">Back to shopping</button></div></div>}
  </main>;
}