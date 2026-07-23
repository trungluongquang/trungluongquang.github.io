import type { Offer } from "../types";

export function buildOfferPopupUrl(
  offer: Offer,
  currentHref = window.location.href,
) {
  const url = new URL(currentHref);
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("offer", offer.id);
  return url.toString();
}

export function buildAffiliateUrl(offer: Offer, popupBlocked = false) {
  const url = new URL("/retailer", window.location.origin);
  url.searchParams.set("merchant", "freshbox");
  url.searchParams.set("offer_id", offer.id);
  url.searchParams.set("source", "couponlab");
  if (popupBlocked) url.searchParams.set("popup_blocked", "1");
  return url.toString();
}
