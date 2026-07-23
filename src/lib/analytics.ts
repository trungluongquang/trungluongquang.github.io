export type DataLayerValue = string | number | boolean | undefined;
export type DataLayerEvent = { event: string; [key: string]: DataLayerValue };

declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}

const CONSENT_KEY = "couponlab_analytics_consent";
const listeners = new Set<() => void>();

export function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

export function getConsent(): "granted" | "denied" | null {
  return localStorage.getItem(CONSENT_KEY) as "granted" | "denied" | null;
}

export function setConsent(value: "granted" | "denied") {
  localStorage.setItem(CONSENT_KEY, value);
  ensureDataLayer().push({
    event: "consent_update",
    analytics_storage: value,
  });
  listeners.forEach((listener) => listener());
}

export function pushEvent(payload: DataLayerEvent, essential = false) {
  if (!essential && getConsent() !== "granted") return false;
  ensureDataLayer().push(payload);
  listeners.forEach((listener) => listener());
  return true;
}

export function subscribeToDataLayer(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetAnalyticsForTests() {
  window.dataLayer = [];
  localStorage.removeItem(CONSENT_KEY);
}
