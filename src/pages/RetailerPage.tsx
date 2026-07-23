import { offers } from "../data/offers";
import { buildOfferPopupUrl } from "../lib/affiliate";
import { pushEvent } from "../lib/analytics";

export function RetailerPage() {
  const params = new URLSearchParams(window.location.search);
  const offer = offers.find((item) => item.id === params.get("offer_id"));
  const popupBlocked = params.get("popup_blocked") === "1";

  function retryPopup() {
    if (!offer) return;
    window.open(buildOfferPopupUrl(offer), "_blank");
  }

  return (
    <main className="retailer-page">
      <div className="retailer-nav">
        <a className="freshbox-wordmark" href="/">
          <span className="freshbox-mark small" aria-hidden="true">
            FB
          </span>
          FreshBox
        </a>
        <span>Fictional retailer practice page</span>
      </div>
      <section className="retailer-hero">
        <div>
          <p className="eyebrow">Easy dinners. Bright ingredients.</p>
          <h1>Your weeknight reset starts in this box.</h1>
          <p>
            Pick colourful recipes, set your schedule, and test a completely
            local affiliate journey without leaving the project.
          </p>
          <button
            type="button"
            onClick={() =>
              pushEvent({
                event: "retailer_cta",
                destination: "fictional_checkout",
                offer_id: offer?.id,
              })
            }
          >
            Build a practice box
          </button>
        </div>
        <div
          className="produce-art"
          aria-label="Abstract illustration of a FreshBox meal kit"
        >
          <span className="leaf leaf-one" />
          <span className="leaf leaf-two" />
          <span className="tomato" />
          <span className="box-lid">
            FRESH
            <br />
            BOX
          </span>
        </div>
      </section>
      {popupBlocked && (
        <aside className="popup-fallback" role="status">
          <div>
            <strong>Your browser blocked the offer tab.</strong>
            <p>Open it manually to view and copy the fictional coupon.</p>
          </div>
          <button type="button" onClick={retryPopup}>
            Open offer tab
          </button>
        </aside>
      )}
    </main>
  );
}
