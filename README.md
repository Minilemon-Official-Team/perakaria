# Perakaria

Perakaria adalah monorepo single-brand untuk website creative-technology studio berbahasa Indonesia, custom CMS, dan Cloudflare Worker API. Public website mengikuti visual option 3 yang dipilih dan revisi UI terbaru: full-bleed hero sinematik, global smooth section navigation, filmstrip portfolio yang auto-advance serta swipeable, single-open Capability accordion, About Company + interactive Expertise index, sharp editorial geometry, Night surfaces, dan restrained gold accent.

## Struktur

- `website/` — React 18 + TypeScript + Vite public single page.
- `cms-admin/` — React 18 + TypeScript + Vite + Tiptap CMS.
- `cms-api/` — Hono Worker, D1, R2, auth, RBAC, review/publish workflow.
- `shared/content-schema/` — single source of truth Zod schemas dan TypeScript types.
- `docs/` — source markdown, approved comp, assets, dan QA evidence.
- `PRODUCT.md` dan `DESIGN.md` — product truth dan canonical visual contract.

## Konten placeholder dan CMS

Semua struktur sudah ada walaupun detail perusahaan final belum tersedia. Seed content secara eksplisit dilabeli placeholder/ilustratif. CMS dapat mengatur:

- brand logo/wordmark, favicon, navigation, WhatsApp, email, social, SEO;
- color tokens, typography choice, motion, per-section background/overlay/focal point;
- hero visibility, copy, poster, video URL, alignment, primary CTA, media focal point, serta field tambahan yang tetap tersimpan untuk varian mendatang;
- About, metrics, Services, Portfolio, Clients, Contact, alt text;
- About Company copy serta repeatable Expertise: nama/detail skill, urutan, visibility, nama/peran ahli, foto tim, dan alt text;
- order dan visibility untuk section dan repeatable content;
- media JPEG/PNG/WebP maksimal 2 MB, lengkap dengan direct assignment ke brand logo, favicon, OG image, setiap client logo, setiap foto ahli per skill, section media/background, dan deletion;
- responsive preview yang merender actual public website dengan full draft payload;
- review rejection reason serta perubahan role/status user oleh superadmin.

CMS sengaja tidak menerima arbitrary CSS/HTML atau freeform page-building. Layout, zero-radius geometry, spacing grid, dan contrast gate tetap dikunci oleh design system.

## Local development

```bash
npm install --prefer-offline
npm run db:migrate:local --workspace cms-api
npm run dev:api
npm run dev:website
npm run dev:cms
```

Gunakan tombol `Buka demo lokal` untuk mengeksplor CMS tanpa user D1. Untuk login API, buat hash aman dengan:

```bash
npm run hash-password --workspace cms-api -- "password-minimal-12-karakter" "admin@perakaria.studio"
```

Masukkan output ke tabel `users` melalui Wrangler/D1. Jangan commit password atau `.dev.vars`.

## Workflow

- `admin_writer`: edit entry miliknya, membuat draft revision dari published content, submit review.
- `superadmin`: approve/reject, publish/archive, media, dan user management.
- Published revision lama tetap live saat draft baru dikerjakan. Approval mengarsipkan versi lama dan mem-publish revisi baru secara atomik.
- Public API hanya membaca `published` + `is_visible`, menggunakan ETag dan CDN cache singkat. Publish terlihat tanpa rebuild.

## Quality gates

```bash
npm run typecheck
npm test
npm run build
npm run impeccable:audit
npx impeccable@latest check
node scripts/e2e-api.mjs
node scripts/visual-qa.mjs
npm run test:sites --workspace website
npm run test:sites --workspace cms-admin
```

Browser evidence dan comparison boards tersimpan di `docs/qa/`; laporan akhir ada di `design-qa.md`.

## Cloudflare targets

- Pages: `perakaria-web`
- Pages: `perakaria-cms-admin`
- Worker: `perakaria-cms-api`
- D1: `perakaria_cms_db`
- R2: `perakaria-cms-assets`

`wrangler.jsonc` memakai compatibility date `2025-07-12`, yaitu tanggal terbaru yang didukung oleh Wrangler stabil yang dapat dipasang di environment ini. Naikkan Wrangler dan regenerate types sebelum menaikkan compatibility date.

Belum ada production deployment atau custom domain. Deployment hanya dilakukan setelah instruksi eksplisit.