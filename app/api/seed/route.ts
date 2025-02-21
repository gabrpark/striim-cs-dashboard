import { db, products } from 'lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // First, let's try to fetch existing products
    const existingProducts = await db.select().from(products);

    if (existingProducts.length > 0) {
      return Response.json({
        message: 'Database already contains products',
        count: existingProducts.length
      });
    }

    // Replace the raw SQL query with Drizzle's query builder
    const neonProducts = await db.select().from(products);

    if (!neonProducts || neonProducts.length === 0) {
      return Response.json({
        message: 'No products found in Neon database',
      }, { status: 404 });
    }

    // Insert the fetched products
    await db.insert(products).values(neonProducts);

    return Response.json({
      message: 'Database seeded successfully!',
      count: neonProducts.length
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return Response.json({
      message: 'Error seeding database',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
