export const SETTINGS_KEY = "smash_settings";

export type BrandingSettings = {
  brandName?: string;
  primaryColor?: string;
  brandLogoUrl?: string;
  faviconUrl?: string;
  appleTouchIconUrl?: string;
};

export function readBranding(): BrandingSettings {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SETTINGS_KEY) : null;
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return {
      brandName: obj.brandName,
      primaryColor: obj.primaryColor,
      brandLogoUrl: obj.brandLogoUrl,
      faviconUrl: obj.faviconUrl,
      appleTouchIconUrl: obj.appleTouchIconUrl,
    };
  } catch {
    return {};
  }
}

export function setFavicon(href: string, doc: Document = document) {
  if (!href) return;
  let link = doc.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = doc.createElement("link");
    link.rel = "icon";
    doc.head.appendChild(link);
  }
  link.href = href;
}

export function setAppleTouchIcon(href: string, doc: Document = document) {
  if (!href) return;
  let link = doc.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
  if (!link) {
    link = doc.createElement("link");
    link.rel = "apple-touch-icon";
    link.sizes = "180x180";
    doc.head.appendChild(link);
  }
  link.href = href;
}

export function applyBranding(doc: Document = document) {
  const b = readBranding();
  if (b.faviconUrl) setFavicon(b.faviconUrl, doc);
  if (b.appleTouchIconUrl) setAppleTouchIcon(b.appleTouchIconUrl, doc);
}
