import { useEffect, useRef, useState } from "react";
import type { PublicSitePayload } from "@perakaria/content-schema";
import { LayoutGridDebug } from "./LayoutGridDebug";

export function AboutSection({ content, debugGrid }: { content: PublicSitePayload; debugGrid?: boolean }) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !("IntersectionObserver" in window)) { setShouldLoadVideo(true); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setShouldLoadVideo(true); observer.disconnect(); } });
    observer.observe(media);
    return () => observer.disconnect();
  }, []);
  const paragraphs = content.about.body.split(/\n\s*\n/).filter(Boolean);
  const buttons = content.skills.filter((skill) => skill.isVisible).sort((a, b) => a.order - b.order).slice(0, 4).map((skill) => skill.name);
  return (
    <section id="reel" className="section about" style={{ "--section-bg": content.theme.palette.backgroundSecondary, "--section-title": content.theme.palette.titlePrimary, "--section-text": content.theme.palette.textPrimary } as React.CSSProperties}>
      <div className="section-inner about-inner">
        {debugGrid && <LayoutGridDebug columns={3} />}
        <div className="about-media" ref={mediaRef}>
          {content.about.mediaType === "video" && content.about.videoUrl && content.theme.motionEnabled ? <video src={shouldLoadVideo ? content.about.videoUrl : undefined} poster={content.about.imageUrl} autoPlay loop muted playsInline preload="none" /> : <img src={content.about.imageUrl} alt={content.about.imageAlt} loading="lazy" />}
        </div>
        <div className="about-panel">
          <h2 className="about-heading">PERAKARIA</h2>
          <div className="about-body">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <div className="about-buttons">{buttons.map((label) => <button key={label} type="button" className="about-button">{label}</button>)}</div>
        </div>
      </div>
    </section>
  );
}