// Lưu số lượt 👍 cho từng quán bằng Netlify Blobs (miễn phí, không cần database riêng). Mọi quán bắt đầu từ 0.
// GET    /api/votes                          -> { "pho-goc-cho": { up: 12, down: 0, v: 0 }, ... }
// POST   /api/votes { id, from, to, v }      -> { up, down, v } của quán đó
//          from/to: "up" | "down" | null (lựa chọn cũ / mới của người bấm)
//          v: "lượt reset" mà máy người bấm đang biết. Nếu quán đã bị admin reset sau đó, lựa chọn cũ không còn tính.
// DELETE /api/votes { id? }  + header "Authorization: Bearer <ADMIN_KEY>"
//          -> đưa 1 quán (có id) hoặc tất cả quán (không có id) về 0.
//          ADMIN_KEY đặt trong Netlify: Site configuration → Environment variables. Chưa đặt thì không ai reset được.
import { getStore } from "@netlify/blobs";

const VALID = new Set(["up", "down", null]);
const ID = /^[a-z0-9-]{1,80}$/;

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
    let { id, from = null, to = null, v = 0 } = body || {};
    if (typeof id !== "string" || !ID.test(id) || !VALID.has(from) || !VALID.has(to) || from === to) {
      return new Response("Bad vote", { status: 400 });
    }
    const counts = (await store.get(id, { type: "json" })) || { up: 0, down: 0, v: 0 };
    counts.v = counts.v || 0;
    if (Number(v) !== counts.v) from = null;          // lượt bấm cũ đã bị reset → không trừ nữa
    if (from) counts[from] = Math.max(0, (counts[from] || 0) - 1);
    if (to) counts[to] = (counts[to] || 0) + 1;
    await store.setJSON(id, counts);
    return Response.json(counts);
  }

  if (req.method === "DELETE") {
    const key = Netlify.env.get("ADMIN_KEY");
    const sent = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!key || sent !== key) return new Response("Sai mã admin", { status: 403 });
    let body = {};
    try { body = await req.json(); } catch {}
    const ids = body && body.id ? [body.id] : (await store.list()).blobs.map(b => b.key);
    if (ids.some(id => typeof id !== "string" || !ID.test(id))) return new Response("Bad id", { status: 400 });
    for (const id of ids) {
      const old = (await store.get(id, { type: "json" })) || {};
      await store.setJSON(id, { up: 0, down: 0, v: (old.v || 0) + 1 });
    }
    return Response.json({ reset: ids.length });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/votes" };
