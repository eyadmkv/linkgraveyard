import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

// PATCH /api/links/[id] -> Updates read status or tags
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Next.js 15 requires params to be a Promise
) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  try {
    const { id } = await params; // Await the dynamic route parameters
    const body = await req.json();
    const { is_read, tags } = body;

    // Fetch the existing link to check ownership and fallback gracefully
    const [existingLink] = await sql`
      SELECT * FROM links WHERE id = ${id} AND user_id = ${userId}
    `;

    if (!existingLink) {
      return new Response("Link not found or unauthorized", { status: 404 });
    }

    // Determine final values cleanly inside JS to prevent template-literal type errors in DB
    const finalIsRead = is_read !== undefined ? is_read : existingLink.is_read;
    const finalTags = tags !== undefined ? tags : existingLink.tags;

    const [updatedLink] = await sql`
      UPDATE links
      SET
        is_read = ${finalIsRead},
        tags = ${finalTags}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    return Response.json(updatedLink);
  } catch (error) {
    console.error("API PATCH Error:", error);
    return new Response("Database Error", { status: 500 });
  }
}

// DELETE /api/links/[id] -> Deletes a link permanently
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Awaited type definition
) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    const deleted = await sql`
      DELETE FROM links
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (deleted.length === 0) {
      return new Response("Link not found or unauthorized", { status: 404 });
    }

    return new Response("Deleted successfully", { status: 200 });
  } catch (error) {
    console.error("API DELETE Error:", error);
    return new Response("Database Error", { status: 500 });
  }
}