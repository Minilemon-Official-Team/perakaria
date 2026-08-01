# Perakaria Design QA

- source visual truth path: `docs/references/perakaria-option-3.png`
- source pixels: 864 × 1821 PNG
- revision evidence: `docs/references/revision-jumbotron-before.png` (624 × 962) and `docs/references/revision-hero-metadata-before.png` (608 × 235)
- implementation screenshots:
  - `docs/qa/implementation-desktop-full.png` — 1440 × 6982, CSS viewport 1440 × 1000, deviceScaleFactor 1, captureBeyondViewport
  - `docs/qa/implementation-desktop-1440.png` — 1440 × 1000, deviceScaleFactor 1
  - `docs/qa/implementation-tablet-768.png` — 768 × 1024, deviceScaleFactor 1
  - `docs/qa/implementation-mobile-390.png` — 390 × 844, deviceScaleFactor 1
  - `docs/qa/implementation-reference-mobile-624.png` — 624 × 962, matched to the supplied revision screenshot
  - `docs/qa/implementation-expertise-desktop.png` — 1440 × 1000, active hover detail plate
  - `docs/qa/implementation-expertise-mobile.png` — 390 × 844, active tap disclosure
  - `docs/qa/implementation-cms-expertise.png` — 1440 × 1000, CMS copy/skill/team-photo editor
- comparison inputs:
  - `docs/qa/comparison-full.png`
  - `docs/qa/comparison-first-view.png`
- state: public default published/fallback seed, dark theme, Bahasa Indonesia
- density normalization: source and implementation are shown in equal CSS-width columns for the full board; the first-view before/after comparison uses the exact supplied 624 × 962 frame size.

## Findings

No actionable P0, P1, or P2 fidelity differences remain.

- Fonts and typography: Archivo 400/700 is loaded locally, display/body hierarchy and tight grotesk treatment follow the approved direction. PP Neue Montreal remains an intentional replacement item pending licensed assets.
- Spacing and layout rhythm: desktop now uses a single full-bleed hero canvas with no separate copy panel. Mobile keeps only title and description over the media. Sharp zero-radius geometry, editorial whitespace, filmstrip pacing, divided service rows, image/copy About, proof wall, editorial About Company + Expertise split, and anchored contact close remain intact.
- Colors and tokens: Night `#15161B`, deep surface `#090A0D`, white/slate, and restrained `#FFC700` map directly to the source world. CMS contrast validation protects publish.
- Image quality and asset fidelity: all decisive media regions use authored generated raster assets with intentional cinematic subjects and crops; no CSS/SVG stand-ins, fake brands, or watermarks are used. Contact now uses a distinct conversation image.
- Copy and content: the information sequence matches the brief; all unverified company, portfolio, metric, and client content is explicitly represented as replaceable placeholder content.
- Icons and states: controls use one Tabler stroke family. Focus, reduced motion, fallback content, video failure, menu, disclosure, draft/review/published/rejected/archived policy, empty media/review states, and responsive preview are implemented.

## Browser Evidence

`docs/qa/runtime-evidence.json` records:

- desktop hero media fills the complete hero bounds and copy background is transparent;
- hero metadata and the secondary “Lihat karya” link are absent;
- mobile hero height equals the viewport and its only visible copy children are `h1` and `.hero-body`;
- Selected Work auto-advances on desktop, advances through mouse drag, and advances through a real touch swipe at 390px;
- opening the second Capability leaves exactly one row open and closes the first;
- desktop anchor navigation progresses with exponential easing and settles exactly 76px below the fixed header;
- CMS Media Library exposes brand logo, favicon, OG image, one direct target for every client logo, and one direct team-photo target for every skill;
- About Company + Expertise is placed immediately before Contact; desktop mouse hover reveals one loaded detail plate and mobile touch sequence opens one inline detail without page overflow;
- CMS About & Expertise loads four repeatable skill editors and four generated placeholder team-photo previews;
- mobile menu, skip-link focus, and zero horizontal page overflow remain valid;
- console errors: none.

Primary interactions tested in browser: global section-anchor smooth scroll, desktop autoplay, pointer drag, mobile touch swipe, single-open accordion, mobile menu, keyboard focus, CMS logo-target discovery, and responsive overflow. Component tests additionally cover accordion exclusivity, full CMS draft editing/save, media assignment/deletion, and full-site preview messaging.
## Focused Region Comparison

`docs/qa/comparison-first-view.png` compares the supplied 624 × 962 stacked mobile jumbotron against the revised 624 × 962 full-bleed implementation. It verifies removal of eyebrow, CTA, “Lihat karya”, and metadata while preserving the title, description, brand, menu, crop, and palette.

## Comparison History

### Iteration 1

Earlier findings: layout-affecting width/max-height transitions, AI-like CMS side tabs, CTA/metadata pressure at 1440 × 1000, mobile secondary CTA clipping risk, static filmstrip, repeated contact imagery, hero-only CMS preview, incomplete API-connected CMS actions, and no published-slug draft revision path.

Fixes made:

- converted navigation/menu motion to transform/opacity and removed layout-thrashing disclosure animation;
- replaced side tabs with quiet full borders;
- tightened hero top rhythm and stacked mobile actions;
- added filmstrip reveal and scroll progress with reduced-motion handling;
- assigned distinct contact imagery;
- replaced preview approximation with actual public-site iframe fed the full draft through origin-checked `postMessage`;
- connected save, media, review, publish, logout, and users to the Worker;
- added hero/About/Contact/navigation/social/metadata/order/visibility/typography/motion editors;
- exposed every remaining hero/site/theme field, direct media assignment/deletion, reviewer-authored rejection reasons, and role/status user controls;
- added D1 draft revision migration and atomic archive+publish approval.

Post-fix evidence: final screenshots listed above, clean `runtime-evidence.json`, clean Impeccable detector, successful local E2E proving draft isolation, writer approval denial, upload rejection, session expiry, user role/status changes, disabled-login denial, and publish without rebuild.

### Iteration 2 — Jumbotron, Selected Work, Capabilities

User findings: the mobile jumbotron stacked too many elements before media, the desktop copy panel prevented a full-width media hero, Selected Work required direct swipe plus desktop autoplay, and multiple Capability rows could remain open.

Fixes made:

- moved hero image/video into one full-bleed background on desktop, tablet, and mobile;
- removed public hero metadata, secondary “Lihat karya”, media index, and showreel detail;
- reduced mobile hero copy to title and description only while retaining a single primary CTA on desktop;
- added desktop auto-advance with hover/focus/drag pause and reduced-motion protection;
- added pointer drag on desktop and touch swipe on mobile while preserving snap, progress, and arrow controls;
- lifted Capability disclosure state to the section so opening one row closes the previous row;
- added `aria-expanded` and `aria-controls` to every Capability trigger.

Post-fix evidence: `runtime-evidence.json` proves every requested state and gesture, screenshots cover 390px, 624px, 768px, and 1440px, and the updated first-view board compares the supplied before state to the final implementation.
### Iteration 3 — Global Smooth Scroll & CMS Logo Coverage

User findings: every section transition needed authored smooth scrolling, and every logo needed a verified CMS workflow.

Fixes made:

- added one global same-page anchor controller with exponential ease-out, 76px/66px fixed-header offsets, history updates, and cancellation on wheel, touch, or navigation keys;
- preserved native horizontal portfolio behavior and disabled authored scroll motion for `prefers-reduced-motion` or when the CMS Motion setting is disabled;
- added direct Media Library targets for the brand logo/wordmark, favicon, OG image, and every repeatable client logo;
- made client-logo assignment populate both URL and alt text, and added API/shared-schema validation that rejects a configured logo without alt text;
- added the missing CMS favicon so browser QA remains console-clean.

Post-fix evidence: `runtime-evidence.json` records smooth-scroll progress and exact header-offset settling, confirms all five seeded client-logo targets plus brand/favicon/OG targets, and reports zero console errors. Unit/component tests cover easing breakpoints, logo alt validation, and direct client-logo assignment.
### Iteration 4 — About Company & Interactive Expertise

User finding: sebelum Contact diperlukan About Company berisi title/body di kiri dan daftar skill sederhana di kanan; setiap skill harus membuka detail serta foto anggota tim ahli lewat hover desktop atau tap mobile, dan seluruh field harus dimiliki CMS.

Fixes made:

- menambahkan singleton `expertise` dan repeatable `skill` ke shared Zod contract, API aggregation, public fallback, serta D1 content-type migration;
- menempatkan section bernomor 05 tepat sebelum Contact dan menggeser Contact menjadi 06;
- membangun expert detail plate tanpa modal: desktop mouse hover/keyboard focus membuka satu plate, sedangkan touch membuka detail inline melalui tap;
- membedakan mouse dan touch lewat `PointerEvent.pointerType` sehingga synthetic hover pada perangkat touch tidak membuka-lalu-menutup state;
- menambahkan editor CMS untuk company headline/body/hint, nama/detail/order/visibility skill, nama/peran spesialis, foto, alt text, dan status placeholder;
- menambahkan direct Media Library target untuk foto setiap skill;
- membuat empat foto placeholder spesialis yang legal/generated dan dapat langsung diganti dari CMS.

Post-fix evidence: browser QA membuktikan section mendahului Contact, satu desktop plate aktif dan selesai ter-reveal, satu mobile disclosure aktif tanpa overflow, semua foto termuat, empat editor serta empat upload target tersedia di CMS, dan console errors tetap kosong.
## Open Questions

- Final licensed font assets, factual company details, portfolio/client data, logo/favicon, showreel URLs, social links, Cloudflare IDs, and custom domains remain intentionally unresolved CMS/deployment inputs.

## Follow-up Polish

- P3: once licensed PP Neue Montreal files arrive, compare its optical sizing against Archivo and update the font token asset mapping.
- P3: replace illustrative metrics/client labels with verified company data before public launch.

## Final Result

final result: passed