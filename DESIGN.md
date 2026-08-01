# Perakaria Design System

<!-- impeccable:design-schema 1 -->

## Direction Contract

**THESIS:** Karya bergerak sebagai bukti utama; Perakaria menolak hero agency generik dan mempertemukan narasi studio dengan filmstrip yang langsung dapat dijelajahi.

**OWN-WORLD:** Ruang near-black sinematik, bidang foto tegas, garis ukur tipis, Archivo grotesk, putih/slate, dan gold yang hanya menandai aksi atau status.

**STORY:** Pengunjung memahami fokus audio visual + technology, melihat karya, membaca kemampuan, mengenal company serta ahli di balik setiap skill, lalu memulai percakapan.

**FIRST VIEWPORT:** Hero full-bleed video/image dengan statement langsung di atas media. Desktop menampilkan eyebrow, judul, deskripsi, dan satu CTA utama; mobile hanya menampilkan judul dan deskripsi agar first view tetap sederhana.

**FORM:** Full-bleed studio signal yang dikembangkan dari visual option 3; portfolio dilanjutkan sebagai filmstrip horizontal yang auto-advance di desktop dan dapat di-swipe di semua ukuran.

## Mode and Physical Scene

- Public website: `Experience` dengan tugas sekunder `Persuade`.
- CMS admin: `Operate`.
- Public website dibayangkan dilihat oleh calon klien di ruang kerja dengan ambient light rendah ketika mengevaluasi reel dan portfolio; dark surface memberi konteks yang tepat untuk media.

## Color Strategy

Restrained: neutrals dengan satu accent.

| Token | Default | Role |
| --- | --- | --- |
| `--color-bg` | `#15161B` | Page background |
| `--color-surface` | `#090A0D` | Deep media and navigation surfaces |
| `--color-text` | `#FFFFFF` | Display and primary copy |
| `--color-muted` | `#D3D8E1` | Body and metadata |
| `--color-accent` | `#FFC700` | Primary action, active state, index |
| `--color-accent-secondary` | `#3B82F6` | Reserved secondary interaction |
| `--color-danger` | `#FF4D4D` | Error state |
| `--color-line` | `rgba(211,216,225,.22)` | Hairline dividers |

CMS may edit the solid color values. The publish action must validate text contrast. Gold stays an accent and may not become a large page fill.

## Typography

- Primary: `"Archivo", "Arial Narrow", Arial, sans-serif`.
- Only weights 400 and 700.
- Display: clamp from 48px mobile to 92px desktop, line-height 0.95–1, tracking no tighter than `-0.04em`.
- Section title: clamp from 32px to 56px.
- Body: 15–17px, line-height 1.5–1.7, maximum 68ch.
- Metadata: 10–12px with modest tracking; never below 10px.
- PP Neue Montreal can replace Archivo only when licensed WOFF2 files are supplied.

## Composition

- Zero border radius everywhere.
- Base spacing uses multiples of 4px.
- Page gutters: 20px mobile, 32px tablet, 40px desktop.
- Desktop content max-width: 1600px; media may be full bleed.
- First viewport memakai satu media full-bleed tanpa panel background terpisah untuk copy; mobile menumpuk judul dan deskripsi langsung di atas media.
- Portfolio is a horizontally scrollable filmstrip on desktop and snap list on mobile.
- Service rows use dividers and alignment, not cards.
- About alternates one decisive image with manifesto and metrics.
- Client proof is typographic and intentionally spacious.
- About Company + Expertise memakai split editorial: company copy di kiri dan skill index di kanan, tepat sebelum Contact. Satu detail ahli aktif pada satu waktu.

## Imagery

- Cinematic, low-key, high-contrast production imagery with practical light and visible craft.
- Required subject families: camera/production, live visual or performance, product/commercial, editing/post-production, and interactive installation.
- Every image needs a deliberate crop and focal point.
- No generic office stock, fake logos, recognizable brands, watermarks, or copyrighted campaign material.
- Placeholder content must be labeled as illustrative in CMS seed data.

## Components and States

- Header: transparent over hero, becomes deep surface after scroll; desktop anchor nav and accessible mobile menu.
- CTA: text or rectangular outline, gold focus/hover cue, no pill shape.
- Media item: image/poster with real play icon from an icon library, title, client placeholder, year, category, and optional video URL.
- Service row: number, title, concise description, disclosure/arrow affordance; accordion hanya mengizinkan satu row terbuka pada satu waktu.
- Expertise row: nama skill sederhana; desktop hover dan keyboard focus membuka satu detail plate berisi uraian, nama/peran spesialis, serta foto. Touch memakai tap untuk membuka detail inline.
- Inputs in CMS: rectangular, visible label, helpful validation copy, gold focus ring.
- Provide hover, focus-visible, loading, empty, error, disabled, draft, review, published, rejected, and archived states.

## Motion

- One authored motion system: global anchor-to-section smooth scroll, filmstrip reveal, desktop auto-advance, direct pointer/touch swipe, expertise plate reveal, and navigation progress.
- Content is visible by default; enhancement uses exponential ease-out.
- Avoid repeating identical fade-up animations on every section.
- Anchor navigation uses exponential ease-out, fixed-header offsets, and cancellation on manual wheel/touch/key input. Pause filmstrip auto-advance saat hover, focus, atau drag; disable authored scroll, autoplay, dan nonessential motion untuk `prefers-reduced-motion` atau saat Motion dimatikan dari CMS.
- Keep transforms GPU-friendly and avoid layout thrashing.

## Responsive Rules

- Mobile: 320–640px, full-bleed hero dengan judul + deskripsi saja, 20px gutters, 46–64px display, touch-first snap portfolio, dan detail skill yang dibuka inline melalui tap.
- Tablet: 641–1024px, 40px gutters, 64–72px display, two-column sections where readable.
- Desktop: 1025px+, full-bleed hero overlay, horizontal auto-advancing portfolio, 80–104px display.
- No horizontal page overflow; only the portfolio rail may intentionally scroll.

## CMS Customization Boundary

Admin may change copy, media, brand logo/wordmark, favicon, OG image, every client logo with required alt text, company/expertise copy, repeatable skill name/detail/order/visibility, specialist name/role, skill team photo with required alt text, color tokens, per-section solid/image background, overlay opacity, focal point, order, visibility, navigation labels, contacts, and homepage SEO.

Admin may not inject arbitrary CSS/HTML, create new layout primitives, change radius, bypass contrast validation, or construct freeform pages. A genuinely new section type requires a code change.

## Absolute Avoids

- Rounded cards or pills as the primary visual language.
- Decorative gradients, glows, glassmorphism, or shadow stacks.
- Repeated icon-card grids.
- Gold as a large background fill.
- Invented client logos, testimonials, awards, or performance claims.
- Placeholder boxes where authored imagery is required.
