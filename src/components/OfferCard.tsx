import { useState } from "react";
import { pushEvent } from "../lib/analytics";
import type { Offer } from "../types";

interface OfferCardProps {
  offer: Offer;
  position: number;
  onSelect: (offer: Offer, position: number) => void;
  expired?: boolean;
}

export function OfferCard({
  offer,
  position,
  onSelect,
  expired = false,
}: OfferCardProps) {
  const [termsOpen, setTermsOpen] = useState(false);
  const termsId = `terms-${offer.id}`;

  function toggleTerms() {
    const next = !termsOpen;
    setTermsOpen(next);
    if (next) {
      pushEvent({
        event: "offer_terms_open",
        merchant: "freshbox",
        offer_id: offer.id,
        offer_position: position,
        offer_type: offer.type,
      });
    }
  }

  return (
    <article className={`offer-card ${expired ? "is-expired" : ""}`}>
      <div className="discount-block" aria-label={offer.discountLabel}>
        <strong>{offer.discountLabel.split(" ")[0]}</strong>
        <span>{offer.discountLabel.split(" ").slice(1).join(" ")}</span>
      </div>
      <div className="offer-copy">
        <div className="offer-meta">
          <span className={`type-pill ${offer.type}`}>
            {offer.type === "code" ? "Code" : "Deal"}
          </span>
          {offer.verified && (
            <span className="verified">
              <span aria-hidden="true">✓</span> Verified
            </span>
          )}
        </div>
        <h3>{offer.title}</h3>
        <p>{offer.description}</p>
        <div className="offer-details">
          <span>
            Expires {new Date(offer.expiryDate).toLocaleDateString("en-AU")}
          </span>
          <button
            className="text-button"
            type="button"
            aria-expanded={termsOpen}
            aria-controls={termsId}
            onClick={toggleTerms}
          >
            {termsOpen ? "Hide terms" : "Terms"}
          </button>
        </div>
        {termsOpen && (
          <p className="terms" id={termsId}>
            {offer.terms}
          </p>
        )}
      </div>
      <button
        className="offer-cta"
        type="button"
        disabled={expired}
        onClick={() => onSelect(offer, position)}
        aria-label={`${offer.type === "code" ? "See code" : "See deal"}: ${offer.title}`}
      >
        {expired ? "Expired" : offer.type === "code" ? "See code" : "See deal"}
        {!expired && <span aria-hidden="true">›</span>}
      </button>
    </article>
  );
}
