import { useCallback, useEffect, useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import type { PublicSitePayload } from "@perakaria/content-schema";
import { getV2Fallback, loadSiteContent } from "./lib/cms";
import { DesktopNav } from "./components/DesktopNav";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { ServicesSection } from "./components/ServicesSection";
import { ClientsSection } from "./components/ClientsSection";
import { ContactSection } from "./components/ContactSection";

function preloadImage(source: string) {
  return new Promise<void>((resolve) => { const image = new Image(); let settled = false; const complete = () => { if (settled) return; settled = true; resolve(); }; image.onload = complete; image.onerror = complete; image.src = source; if (image.complete) complete(); });
}

export default function App() {
  const [content, setContent] = useState<PublicSitePayload>(() => getV2Fallback());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [debugGrid, setDebugGrid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    const startedAt = performance.now();
    loadSiteContent().then(({ content: next }) => { if (mounted) setContent(next); }).finally(() => { const remaining = Math.max(0, 420 - (performance.now() - startedAt)); window.setTimeout(() => mounted && setIsLoading(false), remaining); });
    preloadImage(content.hero.posterImageUrl);
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    const receivePreview = (event: MessageEvent) => { const allowedOrigin = import.meta.env.VITE_CMS_PREVIEW_ORIGIN; if (allowedOrigin && event.origin !== allowedOrigin) return; if (event.data?.type === "perakaria:preview" && event.data.content) setContent(event.data.content as PublicSitePayload); };
    window.addEventListener("message", receivePreview);
    return () => window.removeEventListener("message", receivePreview);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key.toLowerCase() === "g" && !event.metaKey && !event.ctrlKey && !event.altKey && !(event.target instanceof HTMLInputElement)) setDebugGrid((value) => !value); if (event.key === "Escape") setMobileNavOpen(false); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = mobileNavOpen ? "hidden" : previousBodyOverflow;
    document.documentElement.style.overflow = mobileNavOpen ? "hidden" : previousDocumentOverflow;
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [mobileNavOpen]);
  useEffect(() => {
    const closeOnDesktop = () => { if (window.innerWidth > 768) setMobileNavOpen(false); };
    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);
  useEffect(() => { document.title = content.settings.seoTitle; document.querySelector('meta[name="description"]')?.setAttribute("content", content.settings.seoDescription); }, [content.settings]);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const navigation = content.settings.navigation;
  const theme = {
    "--theme-bg-primary": content.theme.palette.backgroundPrimary,
    "--theme-bg-secondary": content.theme.palette.backgroundSecondary,
    "--theme-title-primary": content.theme.palette.titlePrimary,
    "--theme-title-secondary": content.theme.palette.titleSecondary,
    "--theme-text-primary": content.theme.palette.textPrimary,
    "--theme-text-secondary": content.theme.palette.textSecondary,
  } as React.CSSProperties;
  return <div className={`site-shell ${content.theme.motionEnabled ? "" : "motion-disabled"}`} style={theme}>
    {isLoading && <div className="site-loader" role="status" aria-live="polite"><div className="site-loader-content"><p>Welcome to Perakaria - Please wait....</p><span className="site-loader-track" aria-hidden="true"><span className="site-loader-progress" /></span></div></div>}
    <DesktopNav navigation={navigation} />
    <button type="button" className="mobile-nav-trigger" aria-label="Open navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(true)}><IconMenu2 /></button>
    <div className={`mobile-nav-panel${mobileNavOpen ? " is-open" : ""}`} aria-hidden={!mobileNavOpen}><button type="button" className="mobile-nav-close" aria-label="Close navigation" onClick={closeMobileNav}><IconX /></button>{navigation.map((item) => <a key={item.href} href={item.href} onClick={closeMobileNav}>{item.label}</a>)}</div>
    <main><HeroSection content={content} debugGrid={debugGrid} /><AboutSection content={content} debugGrid={debugGrid} /><ServicesSection content={content} debugGrid={debugGrid} /><ClientsSection content={content} debugGrid={debugGrid} /><ContactSection content={content} debugGrid={debugGrid} /></main>
  </div>;
}