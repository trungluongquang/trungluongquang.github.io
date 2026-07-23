import { useEffect, useMemo, useState } from "react";
import { AnalyticsDebugger } from "./components/AnalyticsDebugger";
import { CookieConsent } from "./components/CookieConsent";
import { Header } from "./components/Header";
import { OfferCard } from "./components/OfferCard";
import { OfferModal } from "./components/OfferModal";
import { faqs, relatedStores } from "./data/content";
import { activeOffers, expiredOffers, offers } from "./data/offers";
import { buildAffiliateUrl, buildOfferPopupUrl } from "./lib/affiliate";
import { getConsent, pushEvent } from "./lib/analytics";
import { RetailerPage } from "./pages/RetailerPage";
import type { Offer, OfferFilter } from "./types";

function CouponPage() {
  const [filter, setFilter] = useState<OfferFilter>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(() => {
    const offerId = new URLSearchParams(window.location.search).get("offer");
    return offers.find((offer) => offer.id === offerId) ?? null;
  });

  const filteredOffers = useMemo(() => {
    if (filter === "codes")
      return activeOffers.filter((offer) => offer.type === "code");
    if (filter === "deals")
      return activeOffers.filter((offer) => offer.type === "deal");
    if (filter === "verified")
      return activeOffers.filter((offer) => offer.verified);
    return activeOffers;
  }, [filter]);

  useEffect(() => {
    if (getConsent() !== "granted") return;
    pushEvent({
      event: "page_view",
      page_type: "merchant_coupon_page",
      merchant: "freshbox",
    });
    pushEvent({
      event: "offer_list_view",
      merchant: "freshbox",
      offer_count: activeOffers.length,
      filter_name: "all",
    });
  }, []);

  useEffect(() => {
    const sent = new Set<number>();
    function trackScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const depth = Math.min(100, Math.round((window.scrollY / max) * 100));
      [25, 50, 75, 100].forEach((threshold) => {
        if (depth >= threshold && !sent.has(threshold)) {
          sent.add(threshold);
          pushEvent({
            event: "scroll_depth",
            percent_scrolled: threshold,
            page_type: "merchant_coupon_page",
          });
        }
      });
    }
    window.addEventListener("scroll", trackScroll, { passive: true });
    return () => window.removeEventListener("scroll", trackScroll);
  }, []);

  function chooseFilter(nextFilter: OfferFilter) {
    setFilter(nextFilter);
    pushEvent({
      event: "offer_filter",
      merchant: "freshbox",
      filter_name: nextFilter,
    });
  }

  function selectOffer(offer: Offer, position: number) {
    const common = {
      merchant: "freshbox",
      offer_id: offer.id,
      offer_type: offer.type,
      discount_label: offer.discountLabel,
      offer_position: position,
      is_verified: offer.verified,
      customer_segment: offer.segment,
      expiry_date: offer.expiryDate,
    };
    pushEvent({
      event: "offer_select",
      ...common,
      click_label: offer.type === "code" ? "see_code" : "see_deal",
    });

    const offerTab = window.open(buildOfferPopupUrl(offer), "_blank");
    const popupBlocked = offerTab === null;
    if (offerTab) {
      offerTab.blur();
      window.focus();
    }

    const destination = buildAffiliateUrl(offer, popupBlocked);
    pushEvent({
      event: "affiliate_redirect",
      ...common,
      destination,
      popup_blocked: popupBlocked,
    });
    window.location.assign(destination);
  }

  function closeModal() {
    setSelectedOffer(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("offer");
    window.history.replaceState({}, "", url);
  }

  async function share(channel: string) {
    pushEvent({
      event: "social_share_click",
      merchant: "freshbox",
      social_channel: channel,
      destination: window.location.href,
    });
    if (channel === "native" && navigator.share) {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    }
  }

  return (
    <>
      <Header />
      <main>
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="#similar-stores">Meal kits</a>
              </li>
              <li aria-current="page">FreshBox</li>
            </ol>
          </nav>

          <section className="merchant-hero">
            <div
              className="freshbox-logo"
              aria-label="FreshBox fictional merchant logo"
            >
              <span className="freshbox-mark" aria-hidden="true">
                FB
              </span>
              <strong>FreshBox</strong>
              <small>Good food, unpacked</small>
            </div>
            <div className="merchant-intro">
              <p className="eyebrow">Tested by the CouponLab editors</p>
              <h1>FreshBox coupons & offers</h1>
              <p className="hero-summary">
                Cook something brilliant for less with {activeOffers.length}{" "}
                fresh fictional offers, checked for this practice project.
              </p>
              <div className="hero-stats">
                <span>
                  <strong>
                    {activeOffers.filter((offer) => offer.verified).length}
                  </strong>{" "}
                  verified
                </span>
                <span>
                  <strong>$200</strong> best saving
                </span>
                <span>
                  <strong>Today</strong> last checked
                </span>
              </div>
            </div>
          </section>

          <aside className="disclosure">
            <span aria-hidden="true">i</span>
            <p>
              <strong>Practice disclosure:</strong> CouponLab may simulate a
              commission journey, but no real purchase, affiliate relationship,
              or tracking endpoint exists.
            </p>
          </aside>

          <div className="content-grid">
            <section
              className="offers-column"
              id="offers"
              aria-labelledby="offers-heading"
            >
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Freshly checked</p>
                  <h2 id="offers-heading">Today’s best offers</h2>
                </div>
                <span>{filteredOffers.length} results</span>
              </div>

              <div className="offer-filters" aria-label="Filter offers">
                {(["all", "codes", "deals", "verified"] as OfferFilter[]).map(
                  (name) => (
                    <button
                      key={name}
                      type="button"
                      className={filter === name ? "active" : ""}
                      aria-pressed={filter === name}
                      onClick={() => chooseFilter(name)}
                    >
                      {name[0].toUpperCase() + name.slice(1)}
                    </button>
                  ),
                )}
              </div>

              <div className="offer-list" aria-live="polite">
                {filteredOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    position={activeOffers.indexOf(offer) + 1}
                    onSelect={selectOffer}
                  />
                ))}
              </div>
            </section>

            <aside className="sidebar">
              <div className="editor-card">
                <div className="editor-avatar" aria-hidden="true">
                  CL
                </div>
                <p className="eyebrow">Editor’s note</p>
                <h2>Our pick</h2>
                <p>
                  The $200 welcome code offers the largest headline value if you
                  plan to order several boxes.
                </p>
                <a href="#saving-guide">Read the saving guide →</a>
              </div>
              <div className="quick-links">
                <strong>On this page</strong>
                <a href="#offers">Current offers</a>
                <a href="#special-savings">Special savings</a>
                <a href="#expired">Expired offers</a>
                <a href="#faq">FAQs</a>
              </div>
            </aside>
          </div>

          <section
            className="segment-grid"
            id="special-savings"
            aria-label="Special savings"
          >
            <article className="segment-card senior">
              <span className="segment-icon" aria-hidden="true">
                65+
              </span>
              <div>
                <p className="eyebrow">Senior savings</p>
                <h2>Stretch the weekly food budget</h2>
                <p>
                  FreshBox has no dedicated fictional senior code today, but
                  flexible plans and free-delivery deals can still lower the
                  weekly total.
                </p>
              </div>
            </article>
            <article className="segment-card student">
              <span className="segment-icon" aria-hidden="true">
                A+
              </span>
              <div>
                <p className="eyebrow">Student savings</p>
                <h2>Spend less time planning dinner</h2>
                <p>
                  Eligible students can test an ongoing 15% saving after
                  completing a fictional verification step.
                </p>
              </div>
            </article>
          </section>

          <section className="expired-section" id="expired">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Offer archive</p>
                <h2>Recently expired</h2>
              </div>
            </div>
            {expiredOffers.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                position={index + 1}
                onSelect={selectOffer}
                expired
              />
            ))}
          </section>

          <section className="guide" id="saving-guide">
            <div className="guide-heading">
              <p className="eyebrow">CouponLab field guide</p>
              <h2>How to make a meal-kit offer work harder</h2>
              <p>
                Our fictional editorial team’s practical playbook for comparing
                the headline number with the value you will actually receive.
              </p>
            </div>
            <div className="guide-grid">
              <article>
                <span>01</span>
                <h3>Read beyond “up to”</h3>
                <p>
                  Check how a discount is divided across deliveries and whether
                  the first box does most of the work.
                </p>
              </article>
              <article>
                <span>02</span>
                <h3>Set a reminder</h3>
                <p>
                  Review your plan before the promotional boxes finish so the
                  standard weekly price never surprises you.
                </p>
              </article>
              <article>
                <span>03</span>
                <h3>Compare the whole basket</h3>
                <p>
                  Factor in delivery, minimum servings, and meals you would
                  otherwise buy—not only the coupon amount.
                </p>
              </article>
            </div>
          </section>

          <section className="faq-section" id="faq">
            <div>
              <p className="eyebrow">Need to know</p>
              <h2>FreshBox coupon FAQs</h2>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={faq.question}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`faq-${index}`}
                        onClick={() => {
                          setOpenFaq(isOpen ? null : index);
                          if (!isOpen)
                            pushEvent({
                              event: "faq_expand",
                              faq_index: index + 1,
                              faq_question: faq.question,
                            });
                        }}
                      >
                        {faq.question}
                        <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                      </button>
                    </h3>
                    {isOpen && <p id={`faq-${index}`}>{faq.answer}</p>}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="related-section" id="similar-stores">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Keep exploring</p>
                <h2>Similar stores</h2>
              </div>
            </div>
            <div className="related-grid">
              {relatedStores.map((store) => (
                <a
                  href={`/?store=${store.name.toLowerCase()}`}
                  className={`related-card ${store.color}`}
                  key={store.name}
                  onClick={() =>
                    pushEvent({
                      event: "related_store_click",
                      merchant: "freshbox",
                      related_store: store.name,
                      destination: `store/${store.name.toLowerCase()}`,
                    })
                  }
                >
                  <span aria-hidden="true">{store.name.slice(0, 2)}</span>
                  <div>
                    <strong>{store.name}</strong>
                    <small>{store.offer}</small>
                  </div>
                  <b aria-hidden="true">→</b>
                </a>
              ))}
            </div>
          </section>

          <section className="share-strip" aria-label="Share this page">
            <div>
              <strong>Know a savvy cook?</strong>
              <span>Share these fictional FreshBox offers.</span>
            </div>
            <div>
              <button
                type="button"
                onClick={() => share("facebook")}
                aria-label="Share on Facebook"
              >
                f
              </button>
              <button
                type="button"
                onClick={() => share("email")}
                aria-label="Share by email"
              >
                @
              </button>
              <button
                type="button"
                onClick={() => share("native")}
                aria-label="Open device sharing"
              >
                ↗
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer>
        <div className="footer-inner">
          <div>
            <a className="brand light" href="/">
              <span aria-hidden="true">C</span>CouponLab
            </a>
            <p>Curious coupon experiences, built for learning.</p>
          </div>
          <div>
            <strong>CouponLab</strong>
            <a href="#saving-guide">How we test</a>
            <a href="#faq">Help centre</a>
            <a href="/contact.html">Contact</a>
          </div>
          <div>
            <strong>Legal-ish</strong>
            <a href="#privacy">Privacy practice</a>
            <a href="#terms">Terms of demo</a>
            <a href="#consent">Cookie choices</a>
          </div>
          <div>
            <strong>Learn</strong>
            <a href="#offers">Coupon basics</a>
            <a href="#saving-guide">Saving guides</a>
            <a href="#similar-stores">Browse stores</a>
          </div>
        </div>
        <p className="copyright">
          © 2026 CouponLab. A fictional practice project with no redeemable
          offers.
        </p>
      </footer>

      <CookieConsent />
      {(import.meta.env.DEV ||
        new URLSearchParams(window.location.search).get("debug") === "1") && (
        <AnalyticsDebugger />
      )}
      {selectedOffer && (
        <OfferModal offer={selectedOffer} onClose={closeModal} />
      )}
    </>
  );
}

export default function App() {
  return window.location.pathname === "/retailer" ? (
    <RetailerPage />
  ) : (
    <CouponPage />
  );
}
