import { useEffect, useState } from "react";
import {
  getConsent,
  pushEvent,
  subscribeToDataLayer,
  type DataLayerEvent,
} from "../lib/analytics";

const exampleEvent: DataLayerEvent = {
  event: "practice_cta_click",
  cta_name: "open_saving_guide",
  page_type: "merchant_coupon_page",
  merchant: "freshbox",
};

export function DataLayerPractice() {
  const [consent, setConsentState] = useState(() => getConsent());
  const [sent, setSent] = useState(false);

  useEffect(
    () =>
      subscribeToDataLayer(() => {
        setConsentState(getConsent());
      }),
    [],
  );

  function sendExample() {
    if (!pushEvent({ ...exampleEvent })) return;
    setSent(true);
  }

  return (
    <section className="data-layer-practice" aria-labelledby="data-layer-heading">
      <div>
        <p className="eyebrow">GTM practice lab</p>
        <h2 id="data-layer-heading">Push a test event to the data layer</h2>
        <p>
          Allow analytics, send the event, then inspect it in GTM Preview or
          the on-page analytics debugger.
        </p>
        <button
          type="button"
          onClick={sendExample}
          disabled={consent !== "granted"}
        >
          {sent ? "Event sent ✓" : "Send practice event"}
        </button>
        {consent !== "granted" && (
          <small>Choose “Allow analytics” below to enable this example.</small>
        )}
      </div>
      <pre aria-label="Example data layer payload">
        <code>{JSON.stringify(exampleEvent, null, 2)}</code>
      </pre>
    </section>
  );
}
