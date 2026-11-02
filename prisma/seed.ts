import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const categories = [
    {name:"Electronics",slug:"electronics"},
    {name:"Home",slug:"home"},
    {name:"Fashion",slug:"fashion"}
  ];
  for (const c of categories) await prisma.category.upsert({where:{slug:c.slug},update:{name:c.name},create:c});
  const seedProducts = [
    {sku:"SS-AUD-001",name:"Studio Wireless Headphones",slug:"studio-wireless-headphones",description:"Comfortable over-ear wireless headphones with rich sound and all-day battery life.",price:2499,compareAt:3999,stock:24,imageUrl:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e",category:"Electronics",brand:"SoundNest",featured:true},
    {sku:"SS-WAT-001",name:"Everyday Smart Watch",slug:"everyday-smart-watch",description:"A versatile everyday watch with activity tracking and notifications.",price:3299,compareAt:4999,stock:17,imageUrl:"https://images.unsplash.com/photo-1523275335684-37898b6baf30",category:"Electronics",brand:"Pulse",featured:true},
    {sku:"SS-HOM-001",name:"Minimal Ceramic Table Lamp",slug:"minimal-ceramic-table-lamp",description:"A warm, understated lamp for a desk or bedside table.",price:1599,compareAt:2199,stock:12,imageUrl:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c",category:"Home",brand:"Haven",featured:true},
    {sku:"SS-FAS-001",name:"Daily Carry Backpack",slug:"daily-carry-backpack",description:"A practical lightweight backpack with organized pockets.",price:1899,compareAt:2599,stock:31,imageUrl:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62",category:"Fashion",brand:"Northline",featured:true}
  ];
  for (const p of seedProducts) {
    const category = await prisma.category.findUniqueOrThrow({where:{slug:p.category.toLowerCase()}});
    const brand = await prisma.brand.upsert({where:{name:p.brand},update:{},create:{name:p.brand}});
    await prisma.product.upsert({
      where:{sku:p.sku}, update:{name:p.name,price:p.price,stock:p.stock},
      create:{sku:p.sku,name:p.name,slug:p.slug,description:p.description,price:p.price,compareAt:p.compareAt,stock:p.stock,imageUrl:p.imageUrl,categoryId:category.id,brandId:brand.id,featured:p.featured}
    });
  }
  await prisma.coupon.upsert({where:{code:"WELCOME10"},update:{},create:{code:"WELCOME10",percentOff:10,minOrder:500,active:true}});
}
main().finally(()=>prisma.$disconnect());
