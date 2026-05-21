import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { scrapeMetadata } from '@/lib/scrape';
import { NextResponse } from 'next/server';

// POST /api/links -> Saves a new link
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const { url } = await req.json();
    if (!url) return new NextResponse('URL is required', { status: 400 });

    const meta = await scrapeMetadata(url);

    const [insertedLink] = await sql`
      INSERT INTO links (user_id, url, title, description, thumbnail)
      VALUES (${userId}, ${url}, ${meta.title}, ${meta.description}, ${meta.thumbnail})
      RETURNING *
    `;

    return NextResponse.json(insertedLink);
  } catch (error) {
    console.error("API POST Error:", error); // Check your terminal for this log
    return new NextResponse('Server Error', { status: 500 });
  }
}

// GET /api/links -> Fetches all saved links with filters
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const tag = searchParams.get('tag');
  const q = searchParams.get('q') || '';
  const unread = searchParams.get('unread') === 'true';

  try {
    // Ensure we handle potential DB connection/query errors
    let links = await sql`
      SELECT * FROM links 
      WHERE user_id = ${userId}
      AND (title ILIKE ${'%' + q + '%'} OR url ILIKE ${'%' + q + '%'})
      ORDER BY created_at DESC
    `;

    // Ensure links exists before calling filter
    if (links) {
      if (unread) {
        links = links.filter((l: any) => !l.is_read);
      }
      if (tag) {
        links = links.filter((l: any) => l.tags?.includes(tag));
      }
    } else {
      links = [];
    }

    return NextResponse.json(links);
  } catch (error) {
    console.error("API GET Error:", error); // Check your terminal for this log
    return new NextResponse('Database Error', { status: 500 });
  }
}