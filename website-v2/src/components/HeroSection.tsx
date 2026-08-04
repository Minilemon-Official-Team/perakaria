import { useState } from "react";
import type { PublicSitePayload } from "@perakaria/content-schema";
import { LayoutGridDebug } from "./LayoutGridDebug";

export function HeroSection({ content, debugGrid }: { content: PublicSitePayload; debugGrid?: boolean }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const useVideo = Boolean(content.hero.videoUrl && content.theme.motionEnabled && !videoFailed);
  return (
    <section id="home" className="section hero" style={{ "--section-bg": content.theme.palette.backgroundPrimary, "--section-title": content.theme.palette.titlePrimary, "--section-text": content.theme.palette.textPrimary } as React.CSSProperties}>
      <div className="hero-bg">
        {useVideo ? <video src={content.hero.videoUrl} poster={content.hero.posterImageUrl} muted autoPlay loop playsInline onError={() => setVideoFailed(true)} /> : <img src={content.hero.posterImageUrl} alt={content.hero.posterAlt} loading="eager" decoding="sync" style={{ objectPosition: `${content.hero.mediaFocalPoint.x}% ${content.hero.mediaFocalPoint.y}%` }} />}
      </div>
      {debugGrid && <LayoutGridDebug columns={1} />}
      <div className="hero-content">
        <h1 className="hero-title-primary">CREATIVE</h1>
        <h2 className="hero-title-secondary">PRODUCTION</h2>
        <p className="hero-script">Services</p>
        <p className="hero-body">{content.hero.body}</p>
      </div>
      <div className="hero-availability"><span className="hero-availability-circle" aria-hidden="true" /><span className="hero-availability-text">AVAILABLE FOR PROJECT</span></div>
    </section>
  );
}