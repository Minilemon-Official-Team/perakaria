import { IconBriefcase, IconHome, IconMail, IconPlayerPlay } from "@tabler/icons-react";
import type { PublicSitePayload } from "@perakaria/content-schema";

type NavItem = PublicSitePayload["settings"]["navigation"][number];
const navIcon = (item: NavItem) => {
  const key = `${item.label} ${item.href}`.toLowerCase();
  if (key.includes("reel") || key.includes("work")) return IconPlayerPlay;
  if (key.includes("service")) return IconBriefcase;
  if (key.includes("contact") || key.includes("kontak")) return IconMail;
  return IconHome;
};

export function DesktopNav({ navigation }: { navigation: NavItem[] }) {
  return (
    <nav className="desktop-nav" aria-label="Primary">
      <ul className="desktop-nav-list">
        {navigation.map((item) => {
          const Icon = navIcon(item);
          return <li key={`${item.href}-${item.label}`}><a href={item.href} className="desktop-nav-link"><span className="desktop-nav-label">{item.label}</span><span className="desktop-nav-block"><Icon size={26} stroke={1.5} /></span></a></li>;
        })}
      </ul>
    </nav>
  );
}