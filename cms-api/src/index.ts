import {
  contentEntryInputSchema,
  contentStatusSchema,
  contentTypeSchema,
  roleSchema,
  themeSettingsSchema,
  validateContentData,
  type ContentEntry,
  type ContentType,
  type Role,
} from "@perakaria/content-schema";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { composePublicSite, mapContentRow, type ContentRow } from "./db";
import {
  contrastRatio,
  createSessionToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "./security";
import { canEditEntry, canRunWorkflow, normalizeFileName, validateUpload } from "./policy";

type AppBindings = {
  Bindings: Env;
  Variables: {
    user: AuthUser;
  };
};

interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

interface UserRow extends AuthUser {
  password_hash: string;
  password_salt: string;
  status: "active" | "disabled";
}

const app = new Hono<AppBindings>();
const sessionCookie = "perakaria_session";
const maxUploadSize = 2 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const ok = <T>(data: T, meta?: Record<string, unknown>) => ({
  data,
  meta: meta ?? {},
});

const parseOrigins = (value: string) =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
  "*",
  cors({
    origin: (origin, c) =>
      parseOrigins(c.env.CMS_ALLOWED_ORIGINS).includes(origin) ? origin : "",
    credentials: true,
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use("*", async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error(
      JSON.stringify({
        message: "request_failed",
        path: c.req.path,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return c.json({ error: "Terjadi kesalahan pada server." }, 500);
  }
});

const requireAuth = createMiddleware<AppBindings>(async (c, next) => {
  const token = getCookie(c, sessionCookie);
  if (!token) return c.json({ error: "Sesi tidak ditemukan." }, 401);
  const tokenHash = await hashToken(token);
  const user = await c.env.DB.prepare(
    `SELECT users.id, users.email, users.role
       FROM sessions
       JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?
        AND sessions.expires_at > CURRENT_TIMESTAMP
        AND users.status = 'active'
      LIMIT 1`,
  )
    .bind(tokenHash)
    .first<AuthUser>();
  if (!user) return c.json({ error: "Sesi sudah kedaluwarsa." }, 401);
  c.set("user", user);
  await next();
});

const requireSuperadmin = createMiddleware<AppBindings>(async (c, next) => {
  if (c.get("user").role !== "superadmin") {
    return c.json({ error: "Aksi ini membutuhkan akses superadmin." }, 403);
  }
  await next();
});

const ensureThemeContrast = (contentType: ContentType, data: unknown) => {
  if (contentType !== "theme_settings") return;
  const theme = themeSettingsSchema.parse(data);
  const palette = theme.palette;
  // Text 1 is used directly on the dark backgrounds. Text 2 is the dark
  // ink used on the light/purple title surfaces; requiring it against the
  // dark backgrounds would reject the approved #000 palette unnecessarily.
  const bodyPairs = [
    [palette.backgroundPrimary, palette.textPrimary],
    [palette.backgroundSecondary, palette.textPrimary],
    [palette.titlePrimary, palette.textSecondary],
    [palette.titleSecondary, palette.textSecondary],
  ] as const;
  if (bodyPairs.some(([background, text]) => contrastRatio(background, text) < 4.5)) {
    throw new Error("Semua kombinasi text dan background harus minimal 4.5:1.");
  }
  if (contrastRatio(palette.backgroundPrimary, palette.titlePrimary) < 3 || contrastRatio(palette.backgroundSecondary, palette.titlePrimary) < 3) {
    throw new Error("Title 1 harus memiliki kontras minimal 3:1 terhadap kedua background.");
  }
  if (contrastRatio(palette.backgroundPrimary, palette.titleSecondary) < 3 || contrastRatio(palette.backgroundSecondary, palette.titleSecondary) < 3) {
    throw new Error("Title 2 harus memiliki kontras minimal 3:1 terhadap kedua background.");
  }
};

app.get("/public/health", (c) =>
  c.json(ok({ status: "ok", service: "perakaria-cms-api" })),
);

app.get("/assets/*", async (c) => {
  const key = c.req.path.replace(/^\/assets\//, "");
  if (!/^assets\/[0-9]{4}\/[0-9]{2}\/[a-f0-9-]+-[a-z0-9.-]+$/.test(key)) {
    return c.json({ error: "Asset key tidak valid." }, 400);
  }
  const object = await c.env.ASSETS.get(key);
  if (!object) return c.json({ error: "Asset tidak ditemukan." }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
});
app.get("/public/site", async (c) => {
  const locale = c.req.query("locale") ?? "id";
  if (locale !== "id") return c.json({ error: "Locale tidak didukung." }, 400);
  const result = await c.env.DB.prepare(
    `SELECT * FROM content_entries
      WHERE status = 'published' AND locale = ? AND is_visible = 1
      ORDER BY content_type, sort_order, updated_at DESC`,
  )
    .bind(locale)
    .all<ContentRow>();
  const payload = composePublicSite(result.results);
  const serialized = JSON.stringify(payload);
  const etag = `"${await hashToken(serialized)}"`;
  if (c.req.header("If-None-Match") === etag) return c.body(null, 304);
  c.header("Cache-Control", "no-store");
  c.header("ETag", etag);
  return c.json(ok(payload));
});

app.get("/public/content", async (c) => {
  const parsed = contentTypeSchema.safeParse(c.req.query("type"));
  if (!parsed.success) return c.json({ error: "Content type tidak valid." }, 400);
  const result = await c.env.DB.prepare(
    `SELECT * FROM content_entries
      WHERE status = 'published' AND locale = 'id' AND content_type = ? AND is_visible = 1
      ORDER BY sort_order, updated_at DESC`,
  )
    .bind(parsed.data)
    .all<ContentRow>();
  return c.json(ok(result.results.map(mapContentRow)));
});

app.get("/public/content/:type/:slug", async (c) => {
  const parsed = contentTypeSchema.safeParse(c.req.param("type"));
  if (!parsed.success) return c.json({ error: "Content type tidak valid." }, 400);
  const row = await c.env.DB.prepare(
    `SELECT * FROM content_entries
      WHERE status = 'published' AND locale = 'id'
        AND content_type = ? AND slug = ? AND is_visible = 1
      LIMIT 1`,
  )
    .bind(parsed.data, c.req.param("slug"))
    .first<ContentRow>();
  if (!row) return c.json({ error: "Konten tidak ditemukan." }, 404);
  return c.json(ok(mapContentRow(row)));
});

app.post("/admin/auth/login", async (c) => {
  const body = z
    .object({ email: z.string().email(), password: z.string().min(8).max(128) })
    .parse(await c.req.json());
  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE email = ? AND status = 'active' LIMIT 1",
  )
    .bind(body.email.toLowerCase())
    .first<UserRow>();
  if (
    !user ||
    !(await verifyPassword(body.password, user.password_salt, user.password_hash))
  ) {
    return c.json({ error: "Email atau password salah." }, 401);
  }
  const token = createSessionToken();
  const tokenHash = await hashToken(token);
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await c.env.DB.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
  )
    .bind(sessionId, user.id, tokenHash, expiresAt)
    .run();
  setCookie(c, sessionCookie, token, {
    httpOnly: true,
    secure: String(c.env.ENVIRONMENT) === "production",
    sameSite: String(c.env.ENVIRONMENT) === "production" ? "None" : "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return c.json(ok({ id: user.id, email: user.email, role: user.role }));
});

app.post("/admin/auth/logout", requireAuth, async (c) => {
  const token = getCookie(c, sessionCookie);
  if (token) {
    await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
      .bind(await hashToken(token))
      .run();
  }
  deleteCookie(c, sessionCookie, { path: "/" });
  return c.json(ok({ loggedOut: true }));
});

app.get("/admin/auth/me", requireAuth, (c) => c.json(ok(c.get("user"))));

app.get("/admin/content/entries", requireAuth, async (c) => {
  const user = c.get("user");
  const type = c.req.query("type");
  const status = c.req.query("status");
  const conditions: string[] = [];
  const bindings: string[] = [];
  if (type) {
    const parsed = contentTypeSchema.safeParse(type);
    if (!parsed.success) return c.json({ error: "Content type tidak valid." }, 400);
    conditions.push("content_type = ?");
    bindings.push(parsed.data);
  }
  if (status) {
    const parsed = contentStatusSchema.safeParse(status);
    if (!parsed.success) return c.json({ error: "Status tidak valid." }, 400);
    conditions.push("status = ?");
    bindings.push(parsed.data);
  }
  if (user.role === "admin_writer") {
    conditions.push("created_by = ?");
    bindings.push(user.id);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await c.env.DB.prepare(
    `SELECT * FROM content_entries ${where}
      ORDER BY content_type, sort_order, updated_at DESC`,
  )
    .bind(...bindings)
    .all<ContentRow>();
  return c.json(ok(result.results.map(mapContentRow), { total: result.results.length }));
});

app.get("/admin/content/entries/:id", requireAuth, async (c) => {
  const row = await c.env.DB.prepare(
    "SELECT * FROM content_entries WHERE id = ? LIMIT 1",
  )
    .bind(c.req.param("id"))
    .first<ContentRow>();
  if (!row) return c.json({ error: "Konten tidak ditemukan." }, 404);
  const user = c.get("user");
  if (user.role === "admin_writer" && row.created_by !== user.id) {
    return c.json({ error: "Konten ini bukan milik Anda." }, 403);
  }
  return c.json(ok(mapContentRow(row)));
});

app.post("/admin/content/entries", requireAuth, async (c) => {
  const input = contentEntryInputSchema.parse(await c.req.json());
  const validated = validateContentData(input.contentType, input.data);
  ensureThemeContrast(input.contentType, validated);
  const id = crypto.randomUUID();
  const user = c.get("user");
  await c.env.DB.prepare(
    `INSERT INTO content_entries
      (id, content_type, locale, slug, data_json, status, sort_order, is_visible, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)`,
  )
    .bind(
      id,
      input.contentType,
      input.locale,
      input.slug,
      JSON.stringify(validated),
      input.sortOrder,
      input.isVisible ? 1 : 0,
      user.id,
      user.id,
    )
    .run();
  return c.json(ok({ id }), 201);
});

app.put("/admin/content/entries/:id", requireAuth, async (c) => {
  const current = await c.env.DB.prepare("SELECT * FROM content_entries WHERE id = ? LIMIT 1")
    .bind(c.req.param("id")).first<ContentRow>();
  if (!current) return c.json({ error: "Konten tidak ditemukan." }, 404);
  const user = c.get("user");
  if (!canEditEntry(user.role, user.id, current.created_by, current.status)) {
    return c.json({ error: "Konten tidak dapat diubah." }, 403);
  }
  const input = contentEntryInputSchema.parse(await c.req.json());
  const validated = validateContentData(input.contentType, input.data);
  ensureThemeContrast(input.contentType, validated);
  if (current.status === "archived") return c.json({ error: "Konten archived tidak dapat diubah." }, 409);
  if (current.status === "published") {
    const draftId = crypto.randomUUID();
    try {
      await c.env.DB.prepare(
        `INSERT INTO content_entries
          (id, content_type, locale, slug, data_json, status, sort_order, is_visible, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)`,
      ).bind(draftId, input.contentType, input.locale, input.slug, JSON.stringify(validated), input.sortOrder, input.isVisible ? 1 : 0, user.id, user.id).run();
    } catch {
      return c.json({ error: "Draft revisi untuk konten ini sudah ada." }, 409);
    }
    return c.json(ok({ id: draftId, forkedFrom: current.id, status: "draft" }));
  }
  await c.env.DB.prepare(
    `UPDATE content_entries
        SET content_type = ?, locale = ?, slug = ?, data_json = ?, sort_order = ?,
            is_visible = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
  ).bind(input.contentType, input.locale, input.slug, JSON.stringify(validated), input.sortOrder, input.isVisible ? 1 : 0, user.id, current.id).run();
  return c.json(ok({ id: current.id, status: current.status }));
});
app.delete("/admin/content/entries/:id", requireAuth, async (c) => {
  const row = await c.env.DB.prepare(
    "SELECT * FROM content_entries WHERE id = ? LIMIT 1",
  )
    .bind(c.req.param("id"))
    .first<ContentRow>();
  if (!row) return c.json({ error: "Konten tidak ditemukan." }, 404);
  const user = c.get("user");
  if (["published", "archived"].includes(row.status)) {
    return c.json({ error: "Konten published harus di-archive, bukan dihapus." }, 409);
  }
  if (user.role === "admin_writer" && row.created_by !== user.id) {
    return c.json({ error: "Konten ini bukan milik Anda." }, 403);
  }
  await c.env.DB.prepare("DELETE FROM content_entries WHERE id = ?")
    .bind(row.id)
    .run();
  return c.json(ok({ deleted: true }));
});

app.patch("/admin/content/entries/:id/:action", requireAuth, async (c) => {
  const action = c.req.param("action");
  const row = await c.env.DB.prepare(
    "SELECT * FROM content_entries WHERE id = ? LIMIT 1",
  )
    .bind(c.req.param("id"))
    .first<ContentRow>();
  if (!row) return c.json({ error: "Konten tidak ditemukan." }, 404);
  const user = c.get("user");
  if (action === "submit-review") {
    if (!canRunWorkflow(user.role, action, row.status, user.role === "superadmin" || row.created_by === user.id)) {
      return c.json({ error: "Konten tidak dapat dikirim untuk review." }, 409);
    }
    await c.env.DB.prepare(
      `UPDATE content_entries
          SET status = 'pending_review', rejection_reason = NULL,
              updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
    )
      .bind(user.id, row.id)
      .run();
    return c.json(ok({ status: "pending_review" }));
  }
  if (action === "publish") {
    if (row.status === "published") return c.json(ok({ status: "published" }));
    if (!canRunWorkflow(user.role, action, row.status, true)) {
      return c.json({ error: "Hanya draft yang dapat dipublish langsung." }, 409);
    }
    await c.env.DB.batch([
      c.env.DB.prepare(
        `UPDATE content_entries
            SET status = 'archived', updated_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE content_type = ? AND locale = ? AND slug = ?
            AND status = 'published' AND id != ?`,
      ).bind(user.id, row.content_type, row.locale, row.slug, row.id),
      c.env.DB.prepare(
        `UPDATE content_entries
            SET status = 'published', approved_by = ?, approved_at = CURRENT_TIMESTAMP,
                published_at = CURRENT_TIMESTAMP, rejection_reason = NULL,
                updated_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
      ).bind(user.id, user.id, row.id),
    ]);
    return c.json(ok({ status: "published" }));
  }
  if (user.role !== "superadmin") {
    return c.json({ error: "Aksi ini membutuhkan superadmin." }, 403);
  }
  if (action === "approve") {
    if (!canRunWorkflow(user.role, action, row.status, true)) {
      return c.json({ error: "Hanya konten pending review yang dapat dipublish." }, 409);
    }
    await c.env.DB.batch([
      c.env.DB.prepare(
        `UPDATE content_entries
            SET status = 'archived', updated_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE content_type = ? AND locale = ? AND slug = ?
            AND status = 'published' AND id != ?`,
      ).bind(user.id, row.content_type, row.locale, row.slug, row.id),
      c.env.DB.prepare(
        `UPDATE content_entries
            SET status = 'published', approved_by = ?, approved_at = CURRENT_TIMESTAMP,
                published_at = CURRENT_TIMESTAMP, rejection_reason = NULL,
                updated_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
      ).bind(user.id, user.id, row.id),
    ]);
    return c.json(ok({ status: "published" }));
  }
  if (action === "reject") {
    const body = z
      .object({ reason: z.string().min(3).max(500) })
      .parse(await c.req.json());
    if (!canRunWorkflow(user.role, action, row.status, true)) {
      return c.json({ error: "Hanya konten pending review yang dapat ditolak." }, 409);
    }
    await c.env.DB.prepare(
      `UPDATE content_entries
          SET status = 'rejected', rejection_reason = ?, updated_by = ?,
              updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
    )
      .bind(body.reason, user.id, row.id)
      .run();
    return c.json(ok({ status: "rejected" }));
  }
  if (action === "archive") {
    if (!canRunWorkflow(user.role, action, row.status, true)) {
      return c.json({ error: "Hanya konten published yang dapat di-archive." }, 409);
    }
    await c.env.DB.prepare(
      `UPDATE content_entries
          SET status = 'archived', updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
    )
      .bind(user.id, row.id)
      .run();
    return c.json(ok({ status: "archived" }));
  }
  return c.json({ error: "Aksi tidak dikenal." }, 404);
});

app.get("/admin/media", requireAuth, async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT * FROM media_assets ORDER BY created_at DESC",
  ).all();
  return c.json(ok(result.results, { total: result.results.length }));
});

app.post("/admin/media/upload", requireAuth, async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;
  const altText = typeof body.altText === "string" ? body.altText.trim() : "";
  if (!(file instanceof File)) return c.json({ error: "File wajib diisi." }, 400);
  const validation = validateUpload(file.type, file.size, altText);
  if (!validation.ok) return c.json({ error: validation.error }, validation.status);
  const safeName = normalizeFileName(file.name);
  const now = new Date();
  const key = `assets/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}-${safeName}`;
  await c.env.ASSETS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });
  const id = crypto.randomUUID();
  const publicUrl = `${c.env.PUBLIC_ASSET_BASE_URL.replace(/\/$/, "")}/${key}`;
  await c.env.DB.prepare(
    `INSERT INTO media_assets
      (id, file_key, public_url, original_name, alt_text, mime_type, size_bytes, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      key,
      publicUrl,
      file.name,
      altText,
      file.type,
      file.size,
      c.get("user").id,
    )
    .run();
  return c.json(ok({ id, publicUrl, key }), 201);
});

app.delete("/admin/media/:id", requireAuth, requireSuperadmin, async (c) => {
  const asset = await c.env.DB.prepare(
    "SELECT file_key FROM media_assets WHERE id = ? LIMIT 1",
  )
    .bind(c.req.param("id"))
    .first<{ file_key: string }>();
  if (!asset) return c.json({ error: "Media tidak ditemukan." }, 404);
  await c.env.ASSETS.delete(asset.file_key);
  await c.env.DB.prepare("DELETE FROM media_assets WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json(ok({ deleted: true }));
});

app.get("/admin/users", requireAuth, requireSuperadmin, async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT id, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC",
  ).all();
  return c.json(ok(result.results, { total: result.results.length }));
});

app.post("/admin/users", requireAuth, requireSuperadmin, async (c) => {
  const body = z
    .object({
      email: z.string().email(),
      password: z.string().min(12).max(128),
      role: roleSchema,
    })
    .parse(await c.req.json());
  const credentials = await hashPassword(body.password);
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO users
      (id, email, password_hash, password_salt, role, status)
      VALUES (?, ?, ?, ?, ?, 'active')`,
  )
    .bind(
      id,
      body.email.toLowerCase(),
      credentials.hash,
      credentials.salt,
      body.role,
    )
    .run();
  return c.json(ok({ id, email: body.email.toLowerCase(), role: body.role }), 201);
});

app.patch("/admin/users/:id", requireAuth, requireSuperadmin, async (c) => {
  const body = z.object({ role: roleSchema.optional(), status: z.enum(["active", "disabled"]).optional() }).refine((value) => value.role || value.status).parse(await c.req.json());
  if (c.req.param("id") === c.get("user").id && body.status === "disabled") return c.json({ error: "Superadmin tidak dapat menonaktifkan dirinya sendiri." }, 409);
  const current = await c.env.DB.prepare("SELECT role, status FROM users WHERE id = ? LIMIT 1").bind(c.req.param("id")).first<{role:Role;status:string}>();
  if (!current) return c.json({ error: "User tidak ditemukan." }, 404);
  await c.env.DB.prepare("UPDATE users SET role = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(body.role ?? current.role, body.status ?? current.status, c.req.param("id")).run();
  if (body.status === "disabled") await c.env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(c.req.param("id")).run();
  return c.json(ok({ id: c.req.param("id"), role: body.role ?? current.role, status: body.status ?? current.status }));
});

app.delete("/admin/users/:id", requireAuth, requireSuperadmin, async (c) => {
  if (c.req.param("id") === c.get("user").id) return c.json({ error: "Superadmin tidak dapat menonaktifkan dirinya sendiri." }, 409);
  const result = await c.env.DB.prepare("UPDATE users SET status = 'disabled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(c.req.param("id")).run();
  if (!result.meta.changes) return c.json({ error: "User tidak ditemukan." }, 404);
  await c.env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(c.req.param("id")).run();
  return c.json(ok({ id: c.req.param("id"), status: "disabled" }));
});
app.all("*", (c) => c.json({ error: "Route tidak ditemukan." }, 404));

export default app;




