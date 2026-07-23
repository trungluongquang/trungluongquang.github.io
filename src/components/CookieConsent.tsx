import { useState } from "react";
import { getConsent, pushEvent, setConsent } from "../lib/analytics";

export function CookieConsent() {
  const [visible, setVisible] = useState(() => getConsent() === null);

  function choose(value: "granted" | "denied") {
    setConsent(value);
    if (value === "granted") {
      pushEvent({
        event: "page_view",
        page_type: "merchant_coupon_page",
        merchant: "freshbox",
      });
      pushEvent({
        event: "offer_list_view",
        merchant: "freshbox",
        offer_count: 4,
        filter_name: "all",
      });
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="cookie-banner" aria-label="Cookie consent">
      <div>
        <strong>Your practice, your choice</strong>
        <p>
          Allow optional analytics events in this browser? No data leaves this
          fictional demo.
        </p>
      </div>
      <div className="cookie-actions">
        <button
          className="button-secondary"
          type="button"
          onClick={() => choose("denied")}
        >
          Decline
        </button>
        <button type="button" onClick={() => choose("granted")}>
          Allow analytics
        </button>
      </div>
    </aside>
  );
}
