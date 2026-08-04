import { useEffect, useMemo, useState } from "react";
import type { PublicSitePayload } from "@perakaria/content-schema";
import { LayoutGridDebug } from "./LayoutGridDebug";

const DESKTOP_VISIBLE_CLIENTS = 4;
const SLIDE_INTERVAL_MS = 4000;

function getVisibleClientCount() {
  if (typeof window === "undefined") return DESKTOP_VISIBLE_CLIENTS;
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return DESKTOP_VISIBLE_CLIENTS;
}

export function ClientsSection({ content, debugGrid }: { content: PublicSitePayload; debugGrid?: boolean }) {
  const clients = useMemo(
    () => content.clients.filter((client) => client.isVisible).sort((a, b) => a.order - b.order),
    [content.clients],
  );
  const [visibleClientCount, setVisibleClientCount] = useState(DESKTOP_VISIBLE_CLIENTS);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const updateVisibleClientCount = () => setVisibleClientCount(getVisibleClientCount());
    updateVisibleClientCount();
    window.addEventListener("resize", updateVisibleClientCount);
    return () => window.removeEventListener("resize", updateVisibleClientCount);
  }, []);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const syncPreference = () => setPrefersReducedMotion(query.matches);
    syncPreference();
    query.addEventListener?.("change", syncPreference);
    return () => query.removeEventListener?.("change", syncPreference);
  }, []);

  const slides = useMemo(() => {
    const nextSlides: typeof clients[] = [];
    for (let index = 0; index < clients.length; index += visibleClientCount) {
      nextSlides.push(clients.slice(index, index + visibleClientCount));
    }
    return nextSlides;
  }, [clients, visibleClientCount]);

  useEffect(() => {
    setActiveSlide((current) => Math.min(current, Math.max(0, slides.length - 1)));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused || prefersReducedMotion || !content.theme.motionEnabled) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [content.theme.motionEnabled, isPaused, prefersReducedMotion, slides.length]);

  return (
    <section
      id="clients"
      className="section clients"
      aria-label="Klien Perakaria"
      style={{
        "--section-bg": content.theme.palette.backgroundSecondary,
        "--section-title": content.theme.palette.titlePrimary,
        "--section-text": content.theme.palette.textPrimary,
      } as React.CSSProperties}
    >
      <div className="section-inner clients-inner">
        {debugGrid && <LayoutGridDebug columns={4} />}
        <div
          className="clients-viewport"
          aria-roledescription="carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          <div
            className="clients-track"
            style={{ transform: `translate3d(-${activeSlide * 100}%, 0, 0)` }}
          >
            {slides.map((slide, slideIndex) => {
              const isActive = slideIndex === activeSlide;
              return (
                <div
                  className="clients-grid"
                  key={`client-slide-${slideIndex}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Klien ${slideIndex + 1} dari ${slides.length}`}
                  aria-hidden={!isActive}
                >
                  {slide.map((client) => (
                    <a
                      className="client-logo"
                      key={client.id}
                      href={client.websiteUrl || undefined}
                      aria-label={client.name}
                      tabIndex={isActive ? 0 : -1}
                    >
                      {client.logoUrl ? (
                        <img src={client.logoUrl} alt={client.logoAlt || client.name} loading="lazy" />
                      ) : (
                        <strong>{client.name}</strong>
                      )}
                    </a>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
