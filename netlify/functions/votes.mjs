// Lưu số lượt thích / không thích cho từng quán bằng Netlify Blobs (miễn phí, không cần database riêng).
// GET  /api/votes                       -> { "pho-goc-cho": { up: 12, down: 1 }, ... }
// POST /api/votes { id, from, to }      -> { up, down } của quán đó
//   from/to: "up" | "down" | null (lựa chọn cũ / mới của người bấm)
import { getStore } from "@netlify/blobs";

const VALID = new Set(["up", "down", null]);

export default async (req) => {
  const store = getStore("votes");

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const entries = await Promise.all(blobs.map(async b => [b.key, await store.get(b.key, { type: "json" })]));
    return Response.json(Object.fromEntries(entries), { headers: { "Cache-Control": "no-store" } });
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
    const { id, from = null, to = null } = body || {};
    if (typeof id !== "string" || !/^[a-z0-9-]{1,80}$/.test(id) || !VALID.has(from) || !VALID.has(to) || from === to) {
      return new Response("Bad vote", { status: 400 });
    }
    const counts = (await store.get(id, { type: "json" })) || { up: 0, down: 0 };
    if (from) counts[from] = Math.max(0, (counts[from] || 0) - 1);
    if (to) counts[to] = (counts[to] || 0) + 1;
    await store.setJSON(id, counts);
    return Response.json(counts);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/votes" };
