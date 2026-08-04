import { useEffect, useMemo, useRef, useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import type { PublicSitePayload } from "@perakaria/content-schema";
import { LayoutGridDebug } from "./LayoutGridDebug";

const FLIP_INTERVAL = 1000;
const VISIBLE_CARD_COUNT = 8;
const FLIP_BATCH_MIN = 3;
const FLIP_BATCH_MAX = 4;

type PortfolioItem = PublicSitePayload["portfolio"][number];
type CardSlot = {
  id: string;
  front: PortfolioItem;
  back: PortfolioItem;
  isFlipped: boolean;
};

function makeCardSlots(portfolio: PortfolioItem[]): CardSlot[] {
  const visibleCount = Math.min(VISIBLE_CARD_COUNT, portfolio.length);
  return Array.from({ length: visibleCount }, (_, index) => ({
    id: `card-${index}`,
    front: portfolio[index],
    back: portfolio[(index + VISIBLE_CARD_COUNT) % portfolio.length] ?? portfolio[index],
    isFlipped: false,
  }));
}

function pickRandomIndexes(total: number, count: number): number[] {
  const indexes = Array.from({ length: total }, (_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes.slice(0, count);
}

export function ServicesSection({ content, debugGrid }: { content: PublicSitePayload; debugGrid?: boolean }) {
  const services = useMemo(() => content.services.filter((service) => service.isVisible).sort((a, b) => a.order - b.order), [content.services]);
  const production = services.filter((service) => service.category === "creative").flatMap((service) => service.details.length ? service.details : [service.title]).slice(0, 5);
  const interactive = services.filter((service) => service.category === "technology").flatMap((service) => service.details.length ? service.details : [service.title]).slice(0, 5);
  const portfolio = useMemo(
    () => content.portfolio.filter((item) => item.isVisible && item.featured).sort((a, b) => a.order - b.order),
    [content.portfolio],
  );
  const [cardSlots, setCardSlots] = useState<CardSlot[]>(() => makeCardSlots(portfolio));
  const nextPortfolioIndex = useRef(Math.min(VISIBLE_CARD_COUNT, portfolio.length));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setCardSlots(makeCardSlots(portfolio));
    nextPortfolioIndex.current = Math.min(VISIBLE_CARD_COUNT, portfolio.length);
  }, [portfolio]);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const syncPreference = () => setPrefersReducedMotion(query.matches);
    syncPreference();
    query.addEventListener?.("change", syncPreference);
    return () => query.removeEventListener?.("change", syncPreference);
  }, []);

  useEffect(() => {
    if (!content.theme.motionEnabled || prefersReducedMotion || portfolio.length < 2 || cardSlots.length < 2) return;
    const timer = window.setInterval(() => {
      const batchSize = Math.min(cardSlots.length, Math.max(FLIP_BATCH_MIN, FLIP_BATCH_MAX));
      const selectedIndexes = pickRandomIndexes(cardSlots.length, batchSize);
      const nextByIndex = new Map<number, PortfolioItem>();
      selectedIndexes.forEach((cardIndex) => {
        const nextItem = portfolio[nextPortfolioIndex.current % portfolio.length];
        nextPortfolioIndex.current = (nextPortfolioIndex.current + 1) % portfolio.length;
        nextByIndex.set(cardIndex, nextItem);
      });
      setCardSlots((current) => current.map((slot, index) => {
        const nextItem = nextByIndex.get(index);
        if (!nextItem) return slot;
        return slot.isFlipped
          ? { ...slot, front: nextItem, isFlipped: false }
          : { ...slot, back: nextItem, isFlipped: true };
      }));
    }, FLIP_INTERVAL);
    return () => window.clearInterval(timer);
  }, [cardSlots.length, content.theme.motionEnabled, prefersReducedMotion, portfolio]);

  const renderList = (items: string[]) => <ul className="services-list">{items.map((item) => <li key={item}><span className="services-check"><IconCheck size={14} stroke={3} /></span>{item}</li>)}</ul>;

  return (
    <section id="services" className="section services" style={{ "--section-bg": content.theme.palette.backgroundPrimary, "--section-title": content.theme.palette.titlePrimary, "--section-text": content.theme.palette.textPrimary } as React.CSSProperties}>
      <div className="services-inner">
        {debugGrid && <LayoutGridDebug columns={4} />}
        <div className="services-heading-block"><h2 className="services-heading-1">WHAT</h2><h2 className="services-heading-2">WE DO</h2></div>
        <div className="services-lists">{renderList(production)}{renderList(interactive)}</div>
        <div className="services-thumbnails">{cardSlots.map((card) => <figure className={`flip-thumb${card.isFlipped ? " is-flipped" : ""}`} key={card.id}><div className="flip-thumb-inner"><div className="flip-thumb-face"><img src={card.front.coverImageUrl} alt={card.front.coverImageAlt} loading="lazy" /></div><div className="flip-thumb-face flip-thumb-back"><img src={card.back.coverImageUrl} alt={card.back.coverImageAlt} loading="lazy" /></div></div></figure>)}</div>
      </div>
    </section>
  );
}
