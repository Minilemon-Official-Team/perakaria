// Direction contract: split-screen studio signal; cinematic proof precedes explanation;
// sharp editorial geometry, near-black surfaces, and restrained gold actions.
import {
  IconArrowDownRight,
  IconArrowLeft,
  IconArrowRight,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandVimeo,
  IconMenu2,
  IconPlayerPlay,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  PublicSitePayload,
  SectionSettings,
  Service,
} from "@perakaria/content-schema";
import { defaultSiteContent } from "@perakaria/content-schema";
import { loadPublicSite } from "./lib/cms";
import { cancelSmoothScroll, scrollToHash } from "./lib/smooth-scroll";

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
        {content.settings.navigation.map((item) => (
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
        {content.settings.navigation.map((item, index) => (
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
        <p className="eyebrow">
          <span />
          {content.hero.eyebrow}
        </p>
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
  const rail = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
  });
  const autoPaused = useRef(false);
  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      const node = rail.current;
      if (!node || autoPaused.current || window.innerWidth < 1025) return;
      const firstCard = node.querySelector<HTMLElement>(".work-card");
      if (!firstCard) return;
      const max = node.scrollWidth - node.clientWidth;
      const gap = Number.parseFloat(getComputedStyle(node).gap) || 0;
      const next = node.scrollLeft + firstCard.offsetWidth + gap;
      node.scrollTo({
        left: next >= max - 4 ? 0 : Math.min(next, max),
        behavior: "smooth",
      });
    }, 3600);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const scroll = (direction: number) =>
    rail.current?.scrollBy({
      left: direction * Math.min(620, window.innerWidth * 0.72),
      behavior: "smooth",
    });
  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const node = event.currentTarget;
    drag.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: node.scrollLeft,
    };
    autoPaused.current = true;
    node.classList.add("is-dragging");
    node.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const deltaX = event.clientX - drag.current.startX;
    const deltaY = event.clientY - drag.current.startY;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
    event.preventDefault();
    event.currentTarget.scrollLeft = drag.current.scrollLeft - deltaX;
  };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    autoPaused.current = false;
    event.currentTarget.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section
      className="content-section work-section"
      id="work"
      style={sectionStyle(section)}
    >
      <div className="section-backdrop" />
      <div className="section-heading">
        <div>
          <p className="section-index">01 — WORK & SERVICES</p>
          <h2>{section.label}</h2>
        </div>
        <p>{section.intro}</p>
        <div className="rail-status">
          <span>Auto / swipe</span>
          <div className="rail-progress">
            <i
              style={{
                transform: `scaleX(${Math.max(0.06, progress / 100)})`,
              }}
            />
          </div>
        </div>
        <div className="rail-controls">
          <button onClick={() => scroll(-1)} aria-label="Karya sebelumnya">
            <IconArrowLeft />
          </button>
          <button onClick={() => scroll(1)} aria-label="Karya berikutnya">
            <IconArrowRight />
          </button>
        </div>
      </div>
      <div
        className="work-rail"
        ref={rail}
        aria-label="Work & Services, geser untuk melihat karya lain"
        onMouseEnter={() => { autoPaused.current = true; }}
        onMouseLeave={() => { autoPaused.current = false; }}
        onFocusCapture={() => { autoPaused.current = true; }}
        onBlurCapture={() => { autoPaused.current = false; }}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onScroll={(event) => {
          const node = event.currentTarget;
          const range = node.scrollWidth - node.clientWidth;
          setProgress(range > 0 ? (node.scrollLeft / range) * 100 : 100);
        }}
      >
        {content.portfolio
          .filter((item) => item.featured && item.isVisible)
          .sort((a, b) => a.order - b.order)
          .map((item, index) => (
            <article className="work-card" key={item.id}>
              <div className="work-image">
                <img src={item.coverImageUrl} alt={item.coverImageAlt} />
                {item.mediaType === "video" && (
                  <span className="play-mark" aria-label="Konten video">
                    <IconPlayerPlay />
                  </span>
                )}
                <span className="work-number">0{index + 1}</span>
              </div>
              <div className="work-details">
                <p>{item.client}</p>
                <h3>{item.title}</h3>
                <div>
                  <span>{item.category}</span>
                  <span>{item.year}</span>
                  
                </div>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
function ServiceRow({
  service,
  index,
  open,
  onToggle,
}: {
  service: Service;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const disclosureId = `service-${service.id}-disclosure`;
  return (
    <article className={`service-row ${open ? "is-open" : ""}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={disclosureId}
        onClick={onToggle}
      >
        <span className="service-number">0{index + 1}</span>
        <span className="service-title">{service.title}</span>
        <span className="service-category">{service.category}</span>
        <IconPlus className="service-plus" />
      </button>
      <div className="service-disclosure" id={disclosureId}>
        <p>{service.description}</p>
        <ul>
          {service.details.map((detail) => <li key={detail}>{detail}</li>)}
        </ul>
      </div>
    </article>
  );
}

function ServicesSection({
  content,
  section,
}: {
  content: PublicSitePayload;
  section: SectionSettings;
}) {
  const services = useMemo(
    () =>
      content.services
        .filter((service) => service.isVisible)
        .sort((a, b) => a.order - b.order),
    [content.services],
  );
  const [openServiceId, setOpenServiceId] = useState<string | null>(
    services[0]?.id ?? null,
  );

  useEffect(() => {
    setOpenServiceId((current) =>
      current && services.some((service) => service.id === current)
        ? current
        : services[0]?.id ?? null,
    );
  }, [services]);

  return (
    <section
      className="content-section services-section"
      id="services"
      style={sectionStyle(section)}
    >
      <div className="section-backdrop" />
      <div className="service-lead">
        <p className="section-index">02 — CAPABILITIES</p>
        <h2>{section.label}</h2>
        <p>{section.intro}</p>
      </div>
      <div className="service-list">
        {services.map((service, index) => (
          <ServiceRow
            key={service.id}
            service={service}
            index={index}
            open={openServiceId === service.id}
            onToggle={() =>
              setOpenServiceId((current) =>
                current === service.id ? null : service.id,
              )
            }
          />
        ))}
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
      style={sectionStyle(section)}
    >
      <div className="section-backdrop" />
      <div className="about-image">
        <img src={content.about.imageUrl} alt={content.about.imageAlt} />
        <span>CRAFT / SYSTEM / IMPACT</span>
      </div>
      <div className="about-copy">
        <p className="section-index">03 — {content.about.kicker}</p>
        <h2>{content.about.headline}</h2>
        <p className="manifesto">{content.about.body}</p>
        <dl className="metrics">
          {content.about.metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.value}</dt>
              <dd>
                {metric.label}
                
              </dd>
            </div>
          ))}
        </dl>
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
  return (
    <section
      className="content-section clients-section"
      id="clients"
      style={sectionStyle(section)}
    >
      <div className="section-backdrop" />
      <p className="section-index">04 — OUR CLIENTS</p>
      <div className="clients-intro">
        <h2>{section.label}</h2>
        <p>{section.intro}</p>
      </div>
      <div className="client-wall" aria-label="Daftar klien dan kolaborator">
        {content.clients
          .sort((a, b) => a.order - b.order)
          .map((client, index) => (
            <a
              key={client.id}
              href={client.websiteUrl || undefined}
              aria-label={client.name}
              className={!client.websiteUrl ? "is-static" : ""}
            >
              <span>0{index + 1}</span>
              {client.logoUrl ? (
                <img src={client.logoUrl} alt={client.logoAlt} />
              ) : (
                <strong>{client.name}</strong>
              )}
              
            </a>
          ))}
      </div>
    </section>
  );
}

function ExpertiseSection({
  content,
  section,
}: {
  content: PublicSitePayload;
  section: SectionSettings;
}) {
  const skills = useMemo(
    () =>
      content.skills
        .filter((skill) => skill.isVisible)
        .sort((a, b) => a.order - b.order),
    [content.skills],
  );
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const finePointer = useRef(false);

  useEffect(() => {
    finePointer.current =
      window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
  }, []);

  useEffect(() => {
    setActiveSkillId((current) =>
      current && skills.some((skill) => skill.id === current) ? current : null,
    );
  }, [skills]);

  const leaveStage = () => {
    if (!stage.current?.contains(document.activeElement)) setActiveSkillId(null);
  };

  return (
    <section
      className="content-section expertise-section"
      id="expertise"
      style={sectionStyle(section)}
    >
      <div className="section-backdrop" />
      <div className="expertise-copy">
        <p className="section-index">05 — {section.label}</p>
        <h2>{content.expertise.headline}</h2>
        <p>{content.expertise.body}</p>
        <small>{content.expertise.interactionHint}</small>
      </div>
      <div
        className="expertise-stage"
        ref={stage}
        onMouseLeave={leaveStage}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setActiveSkillId(null);
          }
        }}
      >
        {skills.length ? (
          <div className="expertise-list">
            {skills.map((skill, index) => {
              const active = activeSkillId === skill.id;
              const detailId = `skill-detail-${skill.id}`;
              return (
                <article
                  className={`expertise-skill ${active ? "is-active" : ""}`}
                  key={skill.id}
                >
                  <button
                    type="button"
                    aria-expanded={active}
                    aria-controls={detailId}
                    onPointerEnter={(event) => {
                      const hasMousePointer = event.pointerType === "mouse";
                      finePointer.current = hasMousePointer;
                      if (hasMousePointer) setActiveSkillId(skill.id);
                    }}
                    onFocus={() => setActiveSkillId(skill.id)}
                    onClick={() =>
                      setActiveSkillId((current) =>
                        finePointer.current
                          ? skill.id
                          : current === skill.id
                            ? null
                            : skill.id,
                      )
                    }
                  >
                    <span>0{index + 1}</span>
                    <strong>{skill.name}</strong>
                    <IconPlus />
                  </button>
                  <div
                    className="expertise-detail"
                    id={detailId}
                    role="region"
                    aria-label={`Detail ${skill.name}`}
                  >
                    <div className="expertise-photo">
                      <img
                        src={skill.photoUrl}
                        alt={skill.photoAlt}
                        loading="lazy"
                        decoding="async"
                      />
                      
                    </div>
                    <div className="expertise-detail-copy">
                      <p>{skill.specialistRole}</p>
                      <h3>{skill.name}</h3>
                      <p>{skill.description}</p>
                      <div>
                        <strong>{skill.specialistName}</strong>
                        <span>{skill.specialistRole}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="expertise-empty">Daftar skill sedang dipersiapkan.</p>
        )}
      </div>
    </section>
  );
}
function ContactSection({
  content,
  section,
}: {
  content: PublicSitePayload;
  section: SectionSettings;
}) {
  const whatsapp = `https://wa.me/${content.settings.whatsapp.replace(/\D/g, "")}`;
  return (
    <section
      className="content-section contact-section"
      id="contact"
      style={sectionStyle(section)}
    >
      <div className="contact-media">
        <img src={content.contact.imageUrl} alt={content.contact.imageAlt} />
      </div>
      <div className="contact-copy">
        <p className="section-index">06 — CONTACT</p>
        <h2>{content.contact.headline}</h2>
        <p>{content.contact.body}</p>
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
        <footer>
          <Brand content={content} />
          <p>{content.contact.footerNote}</p>
          <div className="socials">
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
        </footer>
      </div>
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
        .filter((section) => section.isVisible)
        .sort((a, b) => a.order - b.order),
    [content.sections],
  );
  const renderers = {
    work: WorkSection,
    services: ServicesSection,
    about: AboutSection,
    clients: ClientsSection,
    expertise: ExpertiseSection,
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
          const Component = renderers[section.id];
          return <Component key={section.id} content={content} section={section} />;
        })}
      </main>
    </div>
  );
}
