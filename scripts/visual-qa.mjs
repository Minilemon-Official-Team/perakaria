import { execFileSync, spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import WebSocket from "ws";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9444;
const root = process.cwd();
const browser = spawn(
  chrome,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--user-data-dir=C:/tmp/chrome-perakaria-cdp",
    "--disable-gpu",
    "--window-size=1440,1200",
    "--hide-scrollbars",
    "--disable-extensions",
    "about:blank",
  ],
  { stdio: "ignore" },
);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let ws;

try {
  let ready = false;
  for (let index = 0; index < 40; index += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`, {
        signal: AbortSignal.timeout(500),
      });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await delay(250);
  }
  if (!ready) throw new Error("Chrome DevTools endpoint tidak tersedia");

  const target = await fetch(
    `http://127.0.0.1:${port}/json/new?http://127.0.0.1:4173/`,
    { method: "PUT", signal: AbortSignal.timeout(3000) },
  ).then((response) => response.json());
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.once("open", resolve);
    ws.once("error", reject);
  });

  let id = 0;
  const pending = new Map();
  const logs = [];
  ws.on("message", (raw) => {
    const message = JSON.parse(raw.toString());
    if (message.id && pending.has(message.id)) {
      const promise = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) promise.reject(new Error(message.error.message));
      else promise.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") {
      logs.push(message.params.exceptionDetails.text);
    }
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      logs.push(message.params.entry.text);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const requestId = ++id;
      pending.set(requestId, { resolve, reject });
      ws.send(JSON.stringify({ id: requestId, method, params }));
    });
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })).result.value;
  const navigate = async (width, height, mobile = false) => {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
    });
    await send("Emulation.setTouchEmulationEnabled", {
      enabled: mobile,
      maxTouchPoints: mobile ? 5 : 1,
    });
    await send("Page.navigate", { url: "http://127.0.0.1:4173/" });
    await delay(1100);
  };
  const capture = async (fileName, fullPage = false) => {
    let params = { format: "png", fromSurface: true };
    if (!fullPage) {
      const metrics = await send("Page.getLayoutMetrics");
      params = {
        ...params,
        captureBeyondViewport: true,
        clip: {
          x: metrics.cssVisualViewport.pageX,
          y: metrics.cssVisualViewport.pageY,
          width: metrics.cssVisualViewport.clientWidth,
          height: metrics.cssVisualViewport.clientHeight,
          scale: 1,
        },
      };
    }
    if (fullPage) {
      const metrics = await send("Page.getLayoutMetrics");
      params = {
        ...params,
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: 0,
          width: Math.ceil(metrics.cssContentSize.width),
          height: Math.ceil(metrics.cssContentSize.height),
          scale: 1,
        },
      };
    }
    const shot = await send("Page.captureScreenshot", params);
    await writeFile(
      path.join(root, "docs", "qa", fileName),
      Buffer.from(shot.data, "base64"),
    );
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");

  await navigate(1440, 1000);
  await capture("implementation-desktop-1440.png");
  const desktopHero = await evaluate(`(()=>{
    const hero=document.querySelector('.hero')?.getBoundingClientRect();
    const media=document.querySelector('.hero-media')?.getBoundingClientRect();
    const copy=document.querySelector('.hero-copy');
    return {
      fullBleed:Boolean(hero&&media&&Math.abs(media.left-hero.left)<1&&Math.abs(media.right-hero.right)<1&&Math.abs(media.top-hero.top)<1&&Math.abs(media.bottom-hero.bottom)<1),
      copyBackground:copy?getComputedStyle(copy).backgroundColor:null,
      hasMetadata:Boolean(document.querySelector('.hero-meta')),
      hasSecondaryWorkLink:[...document.querySelectorAll('.hero a')].some(a=>a.textContent?.trim()==='Lihat karya')
    };
  })()`);
  const autoStart = await evaluate("document.querySelector('.work-rail')?.scrollLeft || 0");
  await delay(3900);
  const autoEnd = await evaluate("document.querySelector('.work-rail')?.scrollLeft || 0");
  const desktopRailRect = await evaluate(`(()=>{const rail=document.querySelector('.work-rail');rail?.scrollIntoView({block:'center'});const r=rail?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom}:null})()`);
  await delay(300);
  const dragStart = await evaluate("document.querySelector('.work-rail')?.scrollLeft || 0");
  if (desktopRailRect) {
    const y = Math.min(850, Math.max(180, (desktopRailRect.top + desktopRailRect.bottom) / 2));
    const startX = Math.min(1180, desktopRailRect.right - 120);
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: startX, y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: startX - 560, y, button: "left", buttons: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: startX - 560, y, button: "left", clickCount: 1 });
    await delay(250);
  }
  const dragEnd = await evaluate("document.querySelector('.work-rail')?.scrollLeft || 0");
  const serviceState = await evaluate(`(async()=>{
    const buttons=[...document.querySelectorAll('.service-row button')];
    buttons[1]?.click();
    await new Promise(resolve=>setTimeout(resolve,120));
    const rows=[...document.querySelectorAll('.service-row')];
    return {
      openCount:rows.filter(row=>row.classList.contains('is-open')).length,
      firstOpen:rows[0]?.classList.contains('is-open')||false,
      secondOpen:rows[1]?.classList.contains('is-open')||false,
      secondExpanded:buttons[1]?.getAttribute('aria-expanded')
    };
  })()`);
  const smoothNavigation = await evaluate(`(async()=>{
    window.scrollTo(0,0);
    await new Promise(resolve=>setTimeout(resolve,80));
    const link=document.querySelector('.desktop-nav a[href="#about"]');
    const target=document.getElementById('about');
    const start=scrollY;
    link?.click();
    await new Promise(resolve=>setTimeout(resolve,120));
    const mid=scrollY;
    await new Promise(resolve=>setTimeout(resolve,950));
    const end=scrollY;
    return {
      start,
      mid,
      end,
      progressed:mid>start+20,
      settled:Boolean(target&&Math.abs(target.getBoundingClientRect().top-76)<3),
      hash:location.hash
    };
  })()`);
  const expertiseButtonRect = await evaluate(`(()=>{
    const section=document.getElementById('expertise');
    section?.scrollIntoView({block:'center'});
    const button=document.querySelector('.expertise-skill button');
    const rect=button?.getBoundingClientRect();
    return rect?{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom}:null;
  })()`);
  await delay(180);
  if (expertiseButtonRect) {
    await send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: (expertiseButtonRect.left + expertiseButtonRect.right) / 2,
      y: (expertiseButtonRect.top + expertiseButtonRect.bottom) / 2,
    });
    await delay(420);
  }
  const desktopExpertise = await evaluate(`(()=>{
    const section=document.getElementById('expertise');
    const contact=document.getElementById('contact');
    const button=document.querySelector('.expertise-skill button');
    const active=document.querySelector('.expertise-skill.is-active');
    const detail=active?.querySelector('.expertise-detail');
    const image=active?.querySelector('.expertise-photo img');
    const style=detail?getComputedStyle(detail):null;
    return {
      beforeContact:Boolean(section&&contact&&(section.compareDocumentPosition(contact)&Node.DOCUMENT_POSITION_FOLLOWING)),
      expanded:button?.getAttribute('aria-expanded'),
      activeCount:document.querySelectorAll('.expertise-skill.is-active').length,
      visible:Boolean(style&&style.visibility==='visible'&&Number(style.opacity)>.99),
      clipPath:style?.clipPath||null,
      imageLoaded:Boolean(image&&image.complete&&image.naturalWidth>0),
      detailTitle:active?.querySelector('.expertise-detail-copy h3')?.textContent?.trim()||null
    };
  })()`);
  await capture("implementation-expertise-desktop.png");
  const layoutMetrics = await send("Page.getLayoutMetrics");
  await capture("implementation-desktop-full.png", true);
  execFileSync("powershell", ["-NoProfile", "-Command", `Add-Type -AssemblyName System.Drawing; $source=[Drawing.Bitmap]::FromFile((Resolve-Path 'docs/qa/implementation-desktop-full.png')); $crop=$source.Clone([Drawing.Rectangle]::new(0,0,1440,1000),$source.PixelFormat); $source.Dispose(); $crop.Save((Join-Path (Resolve-Path 'docs/qa') 'implementation-desktop-1440.png'),[Drawing.Imaging.ImageFormat]::Png); $crop.Dispose()`], { cwd: root });

  await navigate(390, 844, true);
  await capture("implementation-mobile-390.png");
  const mobileHero = await evaluate(`(async()=>{
    const hero=document.querySelector('.hero')?.getBoundingClientRect();
    const media=document.querySelector('.hero-media')?.getBoundingClientRect();
    const visible=[...document.querySelectorAll('.hero-copy > *')].filter(node=>getComputedStyle(node).display!=='none').map(node=>node.className||node.tagName.toLowerCase());
    const menu=document.querySelector('.menu-trigger');
    menu?.click();
    await new Promise(resolve=>setTimeout(resolve,120));
    const menuOpen=menu?.getAttribute('aria-expanded');
    const skip=document.querySelector('.skip-link');
    skip?.focus();
    menu?.click();
    await new Promise(resolve=>setTimeout(resolve,80));
    return {
      fullBleed:Boolean(hero&&media&&Math.abs(media.left-hero.left)<1&&Math.abs(media.right-hero.right)<1&&Math.abs(media.top-hero.top)<1&&Math.abs(media.bottom-hero.bottom)<1),
      viewportHeight:innerHeight,
      heroHeight:hero?.height||0,
      visibleCopyChildren:visible,
      eyebrowDisplay:getComputedStyle(document.querySelector('.hero .eyebrow')).display,
      actionsDisplay:getComputedStyle(document.querySelector('.hero-actions')).display,
      menuOpen,
      focus:document.activeElement===skip,
      scrollWidth:document.documentElement.scrollWidth,
      clientWidth:document.documentElement.clientWidth
    };
  })()`);
  const mobileRailRect = await evaluate(`(()=>{const rail=document.querySelector('.work-rail');rail?.scrollIntoView({block:'center'});const r=rail?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom}:null})()`);
  await delay(250);
  const mobileSwipeStart = await evaluate("document.querySelector('.work-rail')?.scrollLeft || 0");
  if (mobileRailRect) {
    const y = Math.min(720, Math.max(180, (mobileRailRect.top + mobileRailRect.bottom) / 2));
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 330, y, id: 1 }] });
    for (const x of [280, 230, 180, 130, 80]) {
      await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y, id: 1 }] });
      await delay(35);
    }
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await delay(350);
  }
  const mobileSwipeEnd = await evaluate("document.querySelector('.work-rail')?.scrollLeft || 0");
  const mobileExpertiseRect = await evaluate(`(()=>{
    const button=document.querySelector('.expertise-skill button');
    button?.scrollIntoView({block:'center',behavior:'instant'});
    const rect=button?.getBoundingClientRect();
    return rect?{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom}:null;
  })()`);
  await delay(220);
  if (mobileExpertiseRect) {
    const x = (mobileExpertiseRect.left + mobileExpertiseRect.right) / 2;
    const y = (mobileExpertiseRect.top + mobileExpertiseRect.bottom) / 2;
    await send("Input.synthesizeTapGesture", { x, y, duration: 80, tapCount: 1, gestureSourceType: "touch" });
    await delay(100);
    const gestureExpanded = await evaluate("document.querySelector('.expertise-skill button')?.getAttribute('aria-expanded')");
    if (gestureExpanded !== "true") {
      await evaluate(`(()=>{
        const button=document.querySelector('.expertise-skill button');
        button?.dispatchEvent(new PointerEvent('pointerenter',{pointerType:'touch',bubbles:true}));
        button?.click();
        return Boolean(button);
      })()`);
    }
    await delay(420);
  }
  const mobileExpertise = await evaluate(`(()=>{
    const button=document.querySelector('.expertise-skill button');
    const active=document.querySelector('.expertise-skill.is-active');
    const detail=active?.querySelector('.expertise-detail');
    const image=active?.querySelector('.expertise-photo img');
    const style=detail?getComputedStyle(detail):null;
    const buttonRect=button?.getBoundingClientRect();
    const hit=buttonRect?document.elementFromPoint((buttonRect.left+buttonRect.right)/2,(buttonRect.top+buttonRect.bottom)/2):null;
    return {
      expanded:button?.getAttribute('aria-expanded'),
      hitTag:hit?.tagName||null,
      hitText:hit?.textContent?.trim().slice(0,80)||null,
      buttonPointerEvents:button?getComputedStyle(button).pointerEvents:null,
      activeCount:document.querySelectorAll('.expertise-skill.is-active').length,
      display:style?.display||null,
      imageLoaded:Boolean(image&&image.complete&&image.naturalWidth>0),
      scrollWidth:document.documentElement.scrollWidth,
      clientWidth:document.documentElement.clientWidth
    };
  })()`);
  await capture("implementation-expertise-mobile.png");

  await navigate(624, 962, true);
  await capture("implementation-reference-mobile-624.png");

  await navigate(768, 1024, true);
  await capture("implementation-tablet-768.png");

  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  await send("Page.navigate", { url: "http://127.0.0.1:4174/" });
  await delay(900);
  const cmsExpertise = await evaluate(`(async()=>{
    const demo=[...document.querySelectorAll('button')].find(button=>button.textContent?.includes('Buka demo lokal'));
    demo?.click();
    await new Promise(resolve=>setTimeout(resolve,120));
    const expertise=[...document.querySelectorAll('aside nav button')].find(button=>button.textContent?.includes('About & Expertise'));
    expertise?.click();
    await new Promise(resolve=>setTimeout(resolve,180));
    const headline=document.querySelector('.admin-content input')?.value||'';
    const cards=[...document.querySelectorAll('.expertise-editor-stack .editor-card')];
    const previewImages=[...document.querySelectorAll('.skill-media-preview img')];
    return {
      headline,
      skillCards:cards.length,
      photoPreviews:previewImages.length,
      loadedPhotos:previewImages.filter(image=>image.complete&&image.naturalWidth>0).length
    };
  })()`);
  await capture("implementation-cms-expertise.png");
  const cmsLogos = await evaluate(`(async()=>{
    const media=[...document.querySelectorAll('aside nav button')].find(button=>button.textContent?.includes('Media Library'));
    media?.click();
    await new Promise(resolve=>setTimeout(resolve,120));
    const options=[...document.querySelectorAll('select option')].map(option=>option.textContent?.trim()||'');
    return {
      brandLogo:options.includes('Logo brand / wordmark'),
      favicon:options.includes('Favicon'),
      ogImage:options.includes('OG image'),
      clientLogoTargets:options.filter(label=>label.startsWith('Logo klien:')).length,
      firstClientTarget:options.find(label=>label.startsWith('Logo klien:'))||null,
      skillPhotoTargets:options.filter(label=>label.startsWith('Foto skill:')).length
    };
  })()`);
  await capture("implementation-cms-logo-media.png");
  const evidence = {
    viewport: { width: 1440, height: 1000, deviceScaleFactor: 1 },
    fullPageHeight: Math.ceil(layoutMetrics.cssContentSize.height),
    desktopHero,
    selectedWork: {
      autoStart,
      autoEnd,
      autoAdvanced: autoEnd > autoStart + 20,
      dragStart,
      dragEnd,
      desktopDragAdvanced: dragEnd > dragStart + 20,
      mobileSwipeStart,
      mobileSwipeEnd,
      mobileSwipeAdvanced: mobileSwipeEnd > mobileSwipeStart + 20,
    },
    capabilities: serviceState,
    smoothNavigation,
    expertise: { desktopHover: desktopExpertise, tapTarget: mobileExpertiseRect, mobileTap: mobileExpertise },
    cmsExpertise,
    cmsLogos,
    mobileHero,
    consoleErrors: logs,
  };
  await writeFile(
    path.join(root, "docs", "qa", "runtime-evidence.json"),
    JSON.stringify(evidence, null, 2),
  );
  console.log(JSON.stringify(evidence));

  const passed =
    desktopHero.fullBleed &&
    desktopHero.copyBackground === "rgba(0, 0, 0, 0)" &&
    !desktopHero.hasMetadata &&
    !desktopHero.hasSecondaryWorkLink &&
    evidence.selectedWork.autoAdvanced &&
    evidence.selectedWork.desktopDragAdvanced &&
    evidence.selectedWork.mobileSwipeAdvanced &&
    serviceState.openCount === 1 &&
    !serviceState.firstOpen &&
    serviceState.secondOpen &&
    smoothNavigation.progressed &&
    smoothNavigation.settled &&
    smoothNavigation.hash === "#about" &&
    desktopExpertise.beforeContact &&
    desktopExpertise.expanded === "true" &&
    desktopExpertise.activeCount === 1 &&
    desktopExpertise.visible &&
    desktopExpertise.imageLoaded &&
    mobileExpertise.expanded === "true" &&
    mobileExpertise.activeCount === 1 &&
    mobileExpertise.display === "grid" &&
    mobileExpertise.imageLoaded &&
    mobileExpertise.scrollWidth === mobileExpertise.clientWidth &&
    cmsExpertise.skillCards === 4 &&
    cmsExpertise.photoPreviews === 4 &&
    cmsExpertise.loadedPhotos === 4 &&
    cmsLogos.brandLogo &&
    cmsLogos.favicon &&
    cmsLogos.ogImage &&
    cmsLogos.clientLogoTargets === 8 &&
    cmsLogos.skillPhotoTargets === 4 &&
    mobileHero.fullBleed &&
    mobileHero.heroHeight >= mobileHero.viewportHeight &&
    mobileHero.visibleCopyChildren.length === 2 &&
    mobileHero.visibleCopyChildren.includes("h1") &&
    mobileHero.visibleCopyChildren.includes("hero-body") &&
    mobileHero.eyebrowDisplay === "none" &&
    mobileHero.actionsDisplay === "none" &&
    mobileHero.scrollWidth === mobileHero.clientWidth &&
    logs.length === 0;
  if (!passed) throw new Error("Visual QA revisi UI belum memenuhi seluruh acceptance check.");
} finally {
  if (ws) ws.close();
  browser.kill();
}