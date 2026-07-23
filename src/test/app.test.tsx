import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import { OfferModal } from "../components/OfferModal";
import { activeOffers } from "../data/offers";
import { buildAffiliateUrl, buildOfferPopupUrl } from "../lib/affiliate";
import { ensureDataLayer, pushEvent, setConsent } from "../lib/analytics";
import { RetailerPage } from "../pages/RetailerPage";

describe("coupon interactions", () => {
  it("filters the offer list by code", async () => {
    setConsent("granted");
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Codes" }));
    expect(
      screen
        .getAllByRole("article")
        .filter((item) => item.classList.contains("offer-card")),
    ).toHaveLength(3);
    expect(
      screen.queryByText("Free delivery on selected weekly plans"),
    ).not.toBeInTheDocument();
    expect(ensureDataLayer()).toContainEqual(
      expect.objectContaining({ event: "offer_filter", filter_name: "codes" }),
    );
  });

  it("expands offer terms and records the event", async () => {
    setConsent("granted");
    render(<App />);
    await userEvent.click(screen.getAllByRole("button", { name: "Terms" })[0]);
    expect(
      screen.getByText(/split across five consecutive deliveries/i),
    ).toBeVisible();
    expect(ensureDataLayer()).toContainEqual(
      expect.objectContaining({
        event: "offer_terms_open",
        offer_id: "freshbox_200_new_customer",
      }),
    );
  });

  it("opens one FAQ item at a time", async () => {
    setConsent("granted");
    render(<App />);
    await userEvent.click(
      screen.getByRole("button", { name: /How do I use a FreshBox coupon/i }),
    );
    expect(screen.getByText(/switch to the CouponLab tab/i)).toBeVisible();
    expect(ensureDataLayer()).toContainEqual(
      expect.objectContaining({ event: "faq_expand", faq_index: 1 }),
    );
  });

  it("renders the selected offer popup from the URL", async () => {
    setConsent("granted");
    window.history.replaceState({}, "", "/?offer=freshbox_40_first_box");
    render(<App />);
    expect(
      await screen.findByRole("dialog", { name: /Take 40% off/i }),
    ).toBeVisible();
    await waitFor(() =>
      expect(ensureDataLayer()).toContainEqual(
        expect.objectContaining({
          event: "offer_popup_view",
          offer_id: "freshbox_40_first_box",
        }),
      ),
    );
  });

  it("records coupon copy only after clipboard succeeds", async () => {
    setConsent("granted");
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<OfferModal offer={activeOffers[0]} onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("FRESHSTART200"),
    );
    expect(ensureDataLayer()).toContainEqual(
      expect.objectContaining({
        event: "coupon_copy",
        offer_id: "freshbox_200_new_customer",
      }),
    );
  });
});

describe("analytics and navigation helpers", () => {
  it("uses stable structured data-layer events", () => {
    setConsent("granted");
    pushEvent({
      event: "offer_select",
      merchant: "freshbox",
      offer_id: activeOffers[0].id,
      offer_type: activeOffers[0].type,
      offer_position: 1,
      is_verified: true,
    });
    expect(ensureDataLayer().at(-1)).toEqual({
      event: "offer_select",
      merchant: "freshbox",
      offer_id: "freshbox_200_new_customer",
      offer_type: "code",
      offer_position: 1,
      is_verified: true,
    });
  });

  it("blocks optional events when consent is absent or denied", () => {
    expect(pushEvent({ event: "page_view" })).toBe(false);
    setConsent("denied");
    expect(pushEvent({ event: "offer_filter" })).toBe(false);
    expect(ensureDataLayer()).toEqual([
      { event: "consent_update", analytics_storage: "denied" },
    ]);
  });

  it("constructs local popup and simulated affiliate URLs", () => {
    const popup = new URL(
      buildOfferPopupUrl(activeOffers[0], "http://localhost:5173/?debug=1"),
    );
    const affiliate = new URL(buildAffiliateUrl(activeOffers[0], true));
    expect(popup.pathname).toBe("/");
    expect(popup.searchParams.get("offer")).toBe(activeOffers[0].id);
    expect(affiliate.pathname).toBe("/retailer");
    expect(affiliate.searchParams.get("source")).toBe("couponlab");
    expect(affiliate.searchParams.get("popup_blocked")).toBe("1");
    expect(affiliate.hostname).toBe(window.location.hostname);
  });

  it("shows a manual retry when the popup was blocked", () => {
    window.history.replaceState(
      {},
      "",
      "/retailer?offer_id=freshbox_200_new_customer&popup_blocked=1",
    );
    render(<RetailerPage />);
    expect(screen.getByText(/browser blocked the offer tab/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Open offer tab" }),
    ).toBeEnabled();
  });
});
