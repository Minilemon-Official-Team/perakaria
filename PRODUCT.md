# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Perakaria melayani tim brand, marketing, komunikasi, dan perusahaan yang membutuhkan partner kreatif untuk kampanye, produksi audio visual, live experience, serta implementasi teknologi pendukung.

Pengunjung utama website sedang mengevaluasi kemampuan studio, kualitas karya, pengalaman, dan kecocokan Perakaria sebelum memulai percakapan proyek melalui WhatsApp atau email.

## Product Purpose

Website Perakaria memperkenalkan studio creative-technology dengan fokus sekitar 70% pada audio visual dan 30% pada technology. Website harus membuat calon klien memahami kemampuan studio, melihat contoh karya, menemukan bukti pengalaman, lalu menghubungi tim.

CMS single-brand memungkinkan pengelola mengganti seluruh copy, karya, layanan, klien, company profile, repeatable skill beserta profil/foto ahlinya, media, kontak, SEO homepage, urutan section, visibility, dan theme tokens tanpa mengubah kode atau melakukan redeploy website.

## Positioning

Perakaria menyatukan storytelling audio visual end-to-end dengan kemampuan teknologi interaktif dalam satu partner produksi yang berorientasi pada pengalaman dan dampak.

## Operating Context

- Public website adalah single-page berbahasa Indonesia.
- CMS admin terpisah dipakai superadmin dan admin writer.
- Content workflow: draft, pending review, published, rejected, dan archived.
- Gambar diunggah ke Cloudflare R2; video dikelola sebagai URL dengan poster image.
- Kontak diarahkan ke WhatsApp dan email, tanpa form inquiry atau penyimpanan pesan.

## Capabilities and Constraints

- Public website: React 18, TypeScript, Vite, dan Tailwind CSS.
- CMS admin: React 18, TypeScript, Vite, Tailwind CSS, dan Tiptap.
- API: Cloudflare Worker, Hono, D1, dan R2.
- Content types: site settings, theme, section settings, hero, about, expertise, repeatable skill, service, portfolio, client, dan contact.
- Tidak ada blog, posts, form inquiry, multi-site, tabel sites, atau kolom site_id.
- Semua gambar editorial wajib memiliki alt text.
- Video tidak diunggah langsung ke R2 pada versi pertama.
- Domain produksi dan kredensial Cloudflare belum ditentukan.

## Brand Commitments

- Nama brand: Perakaria.
- Perakaria adalah creative-technology studio dengan dominasi audio visual.
- Bahasa utama: Bahasa Indonesia.
- Arah visual dipilih dari `docs/references/perakaria-option-3.png`.
- Referensi sistem visual berasal dari `docs/bloomparis.tv-DESIGN.md`, tanpa menyalin konten atau aset pihak lain.

## Evidence on Hand

- Blueprint arsitektur: `docs/SYSTEM_DESIGN_SINGLE_SITE_CMS.md`.
- Design-system reference: `docs/bloomparis.tv-DESIGN.md`.
- Approved visual composition: `docs/references/perakaria-option-3.png`.
- Detail perusahaan, karya, klien, angka pengalaman, logo, dan media final belum tersedia. Konten awal harus jelas berupa placeholder yang dapat diganti dari CMS dan tidak boleh dipresentasikan sebagai klaim faktual.

## Product Principles

1. Karya memimpin pengalaman; antarmuka tidak mengalahkan media.
2. Semua konten bisnis yang terlihat harus dapat diganti dari CMS.
3. Customization tetap terkurasi agar identitas dan aksesibilitas tidak rusak.
4. Public website tetap cepat dan berguna ketika CMS/API sedang tidak tersedia.
5. Tidak membuat klaim komersial, klien, atau capaian sebagai fakta sebelum disediakan pemilik.

## Accessibility & Inclusion

Website dan CMS menargetkan WCAG 2.2 AA: kontras minimum, keyboard navigation, focus state yang jelas, touch target minimal 44px, alt text, semantic landmarks, dan penghormatan terhadap `prefers-reduced-motion`.
