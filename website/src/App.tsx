// Direction contract: split-screen studio signal; cinematic proof precedes explanation;
// sharp editorial geometry, near-black surfaces, and restrained gold actions.
import {
  IconArrowDownRight,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandVimeo,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  PublicSitePayload,
  SectionSettings,
} from "@perakaria/content-schema";
import { defaultSiteContent } from "@perakaria/content-schema";
import { loadPublicSite } from "./lib/cms";
import { cancelSmoothScroll, scrollToHash } from "./lib/smooth-scroll";

const primarySectionOrder = ["work", "clients", "about", "contact"] as const;

const sectionStyle = (section: SectionSettings) =>
  ({
    "--section-bg": section.backgroundColor,
    "--section-image":
      section.backgroundMode === "image" && section.backgroundImageUrl
        ? `url("${section.backgroundImageUrl}")`
        : "none",
    "--section-overlay": section.overlayOpacity,
    "--section-x": `${section.focalPoint.x}%`,
    "--section-y": `${section.focalPoint.y}%`,
  }) as React.CSSProperties;

function Brand({ content }: { content: PublicSitePayload }) {
  if (content.settings.logoUrl) {
    return (
      <img
        className="brand-logo"
        src={content.settings.logoUrl}
        alt={content.settings.brandName}
      />
    );
  }
  return (
    <span className="brand-wordmark">
      PERAKA<span>RIA</span>
    </span>
  );
}

function Header({ content }: { content: PublicSitePayload }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const navigation = useMemo(
    () =>
      [...content.settings.navigation].filter((item) => item.href !== "#services").sort((a, b) => {
        const aIndex = primarySectionOrder.indexOf(a.href.slice(1) as (typeof primarySectionOrder)[number]);
        const bIndex = primarySectionOrder.indexOf(b.href.slice(1) as (typeof primarySectionOrder)[number]);
        return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
      }),
    [content.settings.navigation],
  );
  useEffect(() => {
    const update = () => setSolid(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`site-header ${solid || open ? "is-solid" : ""}`}>
      <a className="brand-link" href="#top" aria-label="Perakaria, kembali ke atas">
        <Brand content={content} />
      </a>
      <nav className="desktop-nav" aria-label="Navigasi utama">
        {navigation.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <button
        className="menu-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span>Menu</span>
        {open ? <IconX /> : <IconMenu2 />}
      </button>
      <nav
        id="mobile-navigation"
        className={`mobile-nav ${open ? "is-open" : ""}`}
        aria-label="Navigasi mobile"
      >
        {navigation.map((item, index) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
            <span>0{index + 1}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Hero({ content }: { content: PublicSitePayload }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  return (
    <section className="hero" id="top">
      <div className="hero-media">
        {content.hero.videoUrl && !videoFailed && !reduceMotion ? (
          <video
            muted
            loop
            autoPlay
            playsInline
            poster={content.hero.posterImageUrl}
            onError={() => setVideoFailed(true)}
          >
            <source src={content.hero.videoUrl} />
          </video>
        ) : (
          <img
            src={content.hero.posterImageUrl}
            alt={content.hero.posterAlt}
            style={{
              objectPosition: `${content.hero.mediaFocalPoint.x}% ${content.hero.mediaFocalPoint.y}%`,
            }}
          />
        )}
      </div>
      <div className={`hero-copy hero-align-${content.hero.alignment}`}>
        <h1>{content.hero.headline}</h1>
        <p className="hero-body">{content.hero.body}</p>
        <div className="hero-actions">
          <a className="button button-primary" href={content.hero.ctaHref}>
            {content.hero.ctaLabel}
            <IconArrowDownRight />
          </a>
        </div>
      </div>
    </section>
  );
}
function WorkSection({
  content,
  section,
}: {
  content: PublicSitePayload;
  section: SectionSettings;
}) {
  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const portfolio = useMemo(
    () =>
      content.portfolio
        .filter((item) => item.isVisible)
        .sort((a, b) => a.order - b.order),
    [content.portfolio],
  );
  const serviceGroups = useMemo(() => {
    const services = content.services
      .filter((service) => service.isVisible)
      .sort((a, b) => a.order - b.order);
    const [production, ...creativeServices] = services;

    return [
      production && {
        id: production.id,
        title: production.title,
        details: production.details,
      },
      creativeServices.length > 0 && {
        id: "creative-services",
        title: creativeServices[0].title,
        details: creativeServices.flatMap((service) => service.details),
      },
    ].filter(Boolean) as { id: string; title: string; details: string[] }[];
  }, [content.services]);
  const galleryCards = useMemo(() => {
    if (!portfolio.length) return [];
    return serviceGroups.flatMap((group, groupIndex) =>
      Array.from({ length: 8 }, (_, cardIndex) => {
        const offset = groupIndex * 2 + cardIndex;
        return {
          id: `${group.id}-${cardIndex}`,
          groupId: group.id,
          front: portfolio[offset % portfolio.length],
          back: portfolio[(offset + 3) % portfolio.length],
        };
      }),
    );
  }, [portfolio, serviceGroups]);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(() => new Set());
  const lastFlippedCard = useRef<string | null>(null);

  useEffect(() => {
    if (reduceMotion || !galleryCards.length) return;
    const timer = window.setInterval(() => {
      const choices = galleryCards.filter((card) => card.id !== lastFlippedCard.current);
      const next = choices[Math.floor(Math.random() * choices.length)] ?? galleryCards[0];
      lastFlippedCard.current = next.id;
      setFlippedCards((current) => {
        const updated = new Set(current);
        updated.has(next.id) ? updated.delete(next.id) : updated.add(next.id);
        return updated;
      });
    }, 2200);
    return () => window.clearInterval(timer);
  }, [galleryCards, reduceMotion]);

  return (
    <section
      className="content-section work-section"
      id="work"
      style={sectionStyle(section)}
    >
      <div className="section-backdrop" />
      <div className="work-section-heading">
        <h2>{section.label}</h2>
      </div>
      <div className="work-service-list">
        {serviceGroups.map((group) => {
          const cards = galleryCards.filter((card) => card.groupId === group.id);
          return (
            <article className="work-service-group" key={group.id}>
              <div className="work-service-gallery" aria-label={`Galeri ${group.title}`}>
                {cards.map((card) => (
                  <figure
                    className={`work-gallery-card ${flippedCards.has(card.id) ? "is-flipped" : ""}`}
                    key={card.id}
                  >
                    <div className="work-gallery-card-inner" aria-hidden="true">
                      <div className="work-gallery-card-face">
                        <img src={card.front?.coverImageUrl} alt="" loading="lazy" decoding="async" />
                      </div>
                      <div className="work-gallery-card-face work-gallery-card-back">
                        <img src={card.back?.coverImageUrl} alt="" loading="lazy" decoding="async" />
                      </div>
                    </div>
                  </figure>
                ))}
              </div>
              <div className="work-service-copy">
                <h3>{group.title}</h3>
                <ul>
                  {group.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
function AboutSection({
  content,
  section,
}: {
  content: PublicSitePayload;
  section: SectionSettings;
}) {
  return (
    <section
      className="content-section about-section"
      id="about"
      style={{
        ...sectionStyle(section),
        "--about-grid-trim": `${content.about.gridTrim}px`,
        "--about-grid-label-size": `${content.about.gridLabelSize}px`,
        "--about-grid-vertical-padding": `${content.about.gridVerticalPadding}px`,
      } as React.CSSProperties}
    >
      <div className="section-backdrop" />
      <div className="about-copy">
        <h2>{content.about.headline}</h2>
        <p className="manifesto">{content.about.body}</p>

      </div>
      <div className="about-image-grid" aria-label="Bidang keahlian Perakaria">
        <div className="about-grid-left about-grid-composite">
          {content.about.gridImages.slice(0, 3).map((image, index) => (
            <figure className={`about-grid-tile about-grid-left-tile-${index + 1}`} key={`${image.label}-${index}`}>
              <img src={image.imageUrl} alt={image.imageAlt} loading="lazy" decoding="async" />
            </figure>
          ))}
          <span className="about-grid-label">{content.about.gridImages[0].label}</span>
        </div>
        <div className="about-grid-right">
          <div className="about-grid-pair about-grid-top">
            {content.about.gridImages.slice(5, 7).map((image, index) => (
              <figure className="about-grid-tile" key={`${image.label}-${index + 5}`}>
                <img src={image.imageUrl} alt={image.imageAlt} loading="lazy" decoding="async" />
                <figcaption>{image.label}</figcaption>
              </figure>
            ))}
          </div>
          <div className="about-grid-middle about-grid-composite">
            {content.about.gridImages.slice(3, 5).map((image, index) => (
              <figure className={`about-grid-tile about-grid-middle-tile-${index + 1}`} key={`${image.label}-${index + 3}`}>
                <img src={image.imageUrl} alt={image.imageAlt} loading="lazy" decoding="async" />
              </figure>
            ))}
            <span className="about-grid-label">{content.about.gridImages[3].label}</span>
          </div>
          <div className="about-grid-pair about-grid-bottom">
            {content.about.gridImages.slice(7, 9).map((image, index) => (
              <figure className="about-grid-tile" key={`${image.label}-${index + 7}`}>
                <img src={image.imageUrl} alt={image.imageAlt} loading="lazy" decoding="async" />
                <figcaption>{image.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClientsSection({
  content,
  section,
}: {
  content: PublicSitePayload;
  section: SectionSettings;
}) {
  const clients = useMemo(
    () => content.clients.filter((client) => client.isVisible && client.name !== "Puteri Indonesia" && client.name !== "Enjoy Jakarta").sort((a, b) => a.order - b.order),
    [content.clients],
  );
  const clientPages = useMemo(() => {
    const pages = [];
    for (let index = 0; index < clients.length; index += 3) pages.push(clients.slice(index, index + 3));
    return pages;
  }, [clients]);
  const [activePage, setActivePage] = useState(0);
  const [swipeStart, setSwipeStart] = useState<number | null>(null);
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !content.theme.motionEnabled;

  useEffect(() => {
    setActivePage((page) => Math.min(page, Math.max(clientPages.length - 1, 0)));
  }, [clientPages.length]);

  useEffect(() => {
    if (reduceMotion || clientPages.length < 2) return;
    const timer = window.setInterval(() => setActivePage((page) => (page + 1) % clientPages.length), 4800);
    return () => window.clearInterval(timer);
  }, [clientPages.length, reduceMotion]);

  const showPage = (page: number) => setActivePage((page + clientPages.length) % clientPages.length);

  return (
    <section
      className="content-section clients-section"
      id="clients"
      style={sectionStyle(section)}
    >
      <div className="section-backdrop" />
      <div className="clients-heading">
        <h2>{section.label}</h2>
      </div>
      {clientPages.length > 0 && (
        <div
          className="client-carousel"
          aria-roledescription="carousel"
          aria-label="Daftar klien dan kolaborator"
          onPointerDown={(event) => setSwipeStart(event.clientX)}
          onPointerUp={(event) => {
            if (swipeStart === null) return;
            const distance = event.clientX - swipeStart;
            if (Math.abs(distance) > 42) showPage(activePage + (distance < 0 ? 1 : -1));
            setSwipeStart(null);
          }}
          onPointerCancel={() => setSwipeStart(null)}
        >
          <div className="client-carousel-viewport">
            <div className="client-carousel-track" style={{ transform: `translateX(-${activePage * 100}%)` }}>
              {clientPages.map((page, pageIndex) => (
                <div className="client-carousel-page" aria-hidden={pageIndex !== activePage} key={`page-${pageIndex}`}>
                  {page.map((client) => (
                    <a
                      key={client.id}
                      href={client.websiteUrl || undefined}
                      aria-label={client.name}
                      tabIndex={pageIndex === activePage ? undefined : -1}
                      className={`client-carousel-item ${!client.websiteUrl ? "is-static" : ""}`}
                    >
                      {client.logoUrl ? <img src={client.logoUrl} alt={client.logoAlt} /> : <strong>{client.name}</strong>}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
       </div>
      )}
    </section>
  );
}
type ContactGalleryImage = PublicSitePayload["contact"]["galleryImages"][number];

function ContactSection({
  content,
  section,
}: {
  content: PublicSitePayload;
  section: SectionSettings;
}) {
  const whatsapp = `https://wa.me/${content.settings.whatsapp.replace(/\D/g, "")}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.settings.location)}`;
  const galleryImages = content.contact.galleryImages;
  const [activeImage, setActiveImage] = useState<ContactGalleryImage | null>(null);

  useEffect(() => {
    if (!activeImage) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [activeImage]);

  return (
    <section
      className="content-section contact-section"
      id="contact"
      style={sectionStyle(section)}
    >
      <div className="section-backdrop" />
      <div className={`contact-gallery contact-gallery-${content.contact.galleryVerticalAlignment}`} aria-label="Pilihan visual Perakaria">
        {galleryImages.map((image, index) => (
          <button
            className="contact-gallery-card"
            type="button"
            key={`${image.title}-${index}`}
            onClick={() => setActiveImage(image)}
            aria-label={`Buka gambar ${image.title}`}
            style={{
              "--stack-index": index,
              "--stack-depth": galleryImages.length - index,
              "--stack-bottom": content.contact.galleryDirection === "descending-right" ? galleryImages.length - index - 1 : index,
            } as React.CSSProperties}
          >
            <img src={image.imageUrl} alt={image.imageAlt} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
      <div className="contact-copy">
        <h2>{content.contact.headline}</h2>
        <div className="contact-links">
          <a href={whatsapp} target="_blank" rel="noreferrer">
            {content.contact.whatsappLabel}
            <IconArrowDownRight />
          </a>
          <a href={`mailto:${content.settings.email}`}>
            {content.contact.emailLabel}
            <IconArrowDownRight />
          </a>
        </div>
        <div className="contact-location">
          <p>Alamat</p>
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <span>{content.settings.location}</span>
            <IconArrowDownRight />
          </a>
        </div>
        <div className="socials" aria-label="Media sosial Perakaria">
          {content.settings.instagramUrl && (
            <a href={content.settings.instagramUrl} aria-label="Instagram">
              <IconBrandInstagram />
            </a>
          )}
          {content.settings.linkedinUrl && (
            <a href={content.settings.linkedinUrl} aria-label="LinkedIn">
              <IconBrandLinkedin />
            </a>
          )}
          {content.settings.vimeoUrl && (
            <a href={content.settings.vimeoUrl} aria-label="Vimeo">
              <IconBrandVimeo />
            </a>
          )}
        </div>
      </div>      {activeImage && (
        <div className="contact-lightbox" role="dialog" aria-modal="true" aria-label={`Preview ${activeImage.title}`} onClick={() => setActiveImage(null)}>
          <button className="contact-lightbox-close" type="button" aria-label="Tutup preview" onClick={() => setActiveImage(null)}>
            <IconX />
          </button>
          <img src={activeImage.imageUrl} alt={activeImage.imageAlt} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
export default function App() {
  const [content, setContent] = useState(defaultSiteContent);

  useEffect(() => {
    const receivePreview = (event: MessageEvent) => {
      const allowedOrigin = import.meta.env.VITE_CMS_PREVIEW_ORIGIN;
      if (allowedOrigin && event.origin !== allowedOrigin) return;
      if (event.data?.type === "perakaria:preview" && event.data.content) {
        setContent(event.data.content as PublicSitePayload);
      }
    };
    window.addEventListener("message", receivePreview);
    return () => window.removeEventListener("message", receivePreview);
  }, []);

  useEffect(() => {
    loadPublicSite()
      .then(({ data }) => {
        setContent(data);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    document.title = content.settings.seoTitle;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", content.settings.seoDescription);
    if (content.settings.faviconUrl) {
      const link =
        document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
        document.head.appendChild(document.createElement("link"));
      link.rel = "icon";
      link.href = content.settings.faviconUrl;
    }
  }, [content.settings]);

  useEffect(() => {
    const handleAnchor = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const source = event.target;
      if (!(source instanceof Element)) return;
      const anchor = source.closest<HTMLAnchorElement>('a[href^="#"]');
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) return;

      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        !url.hash
      ) return;

      const isSkipLink = anchor.classList.contains("skip-link");
      const completed = scrollToHash(url.hash, {
        motionEnabled: content.theme.motionEnabled,
        onComplete: isSkipLink
          ? () => {
              const target = document.getElementById(
                decodeURIComponent(url.hash.slice(1)),
              );
              if (!target) return;
              target.tabIndex = -1;
              target.focus({ preventScroll: true });
            }
          : undefined,
      });
      if (!completed) return;

      event.preventDefault();
      window.history.pushState(null, "", url.hash);
    };

    const cancelOnKey = (event: KeyboardEvent) => {
      if (
        [
          "ArrowDown",
          "ArrowUp",
          "End",
          "Home",
          "PageDown",
          "PageUp",
          " ",
        ].includes(event.key)
      ) cancelSmoothScroll();
    };

    document.addEventListener("click", handleAnchor);
    window.addEventListener("wheel", cancelSmoothScroll, { passive: true });
    window.addEventListener("touchstart", cancelSmoothScroll, { passive: true });
    window.addEventListener("keydown", cancelOnKey);
    return () => {
      cancelSmoothScroll();
      document.removeEventListener("click", handleAnchor);
      window.removeEventListener("wheel", cancelSmoothScroll);
      window.removeEventListener("touchstart", cancelSmoothScroll);
      window.removeEventListener("keydown", cancelOnKey);
    };
  }, [content.theme.motionEnabled]);

  const orderedSections = useMemo(
    () =>
      content.sections
        .filter((section) => section.isVisible && primarySectionOrder.includes(section.id as (typeof primarySectionOrder)[number]))
        .sort((a, b) => {
          const aIndex = primarySectionOrder.indexOf(a.id as (typeof primarySectionOrder)[number]);
          const bIndex = primarySectionOrder.indexOf(b.id as (typeof primarySectionOrder)[number]);
          return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
        }),
    [content.sections],
  );
  const renderers = {
    work: WorkSection,
    about: AboutSection,
    clients: ClientsSection,
    contact: ContactSection,
  };
  const theme = {
    "--color-bg": content.theme.background,
    "--color-surface": content.theme.surface,
    "--color-text": content.theme.text,
    "--color-muted": content.theme.muted,
    "--color-accent": content.theme.accent,
    "--color-accent-secondary": content.theme.accentSecondary,
    "--color-danger": content.theme.danger,
    "--font-family": content.theme.fontFamily === "PP Neue Montreal" ? '"PP Neue Montreal", "Archivo", Arial, sans-serif' : '"Archivo", Arial, sans-serif',
  } as React.CSSProperties;

  return (
    <div className={`site-shell ${content.theme.motionEnabled ? "" : "motion-disabled"}`} style={theme}>
      <a className="skip-link" href="#work">Lewati ke konten</a>
      <Header content={content} />
      <main>
        {content.hero.isVisible && <Hero content={content} />}
        {orderedSections.map((section) => {
          if (section.id === "services" || section.id === "expertise") return null;
          const Component = renderers[section.id];
          return <Component key={section.id} content={content} section={section} />;
        })}
      </main>
      <footer className="site-footer">
        <small>{content.contact.footerNote}</small>
      </footer>
    </div>
  );
}
