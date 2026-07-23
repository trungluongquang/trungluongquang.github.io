import { useEffect, useRef, useState } from "react";
import { pushEvent } from "../lib/analytics";
import type { Offer } from "../types";

interface OfferModalProps {
  offer: Offer;
  onClose: () => void;
}

export function OfferModal({ offer, onClose }: OfferModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const trackedRef = useRef(false);
  const [copyLabel, setCopyLabel] = useState("Copy code");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    if (trackedRef.current) return;
    trackedRef.current = true;
    pushEvent({
      event: "offer_popup_open",
      merchant: "freshbox",
      offer_id: offer.id,
      offer_type: offer.type,
      is_verified: offer.verified,
    });
    const frame = requestAnimationFrame(() => {
      pushEvent({
        event: "offer_popup_view",
        merchant: "freshbox",
        offer_id: offer.id,
        offer_type: offer.type,
        is_verified: offer.verified,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [offer]);

  async function copyCoupon() {
    if (!offer.code) return;
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopyLabel("Copied!");
      pushEvent({
        event: "coupon_copy",
        merchant: "freshbox",
        offer_id: offer.id,
        offer_type: offer.type,
      });
    } catch {
      setCopyLabel("Select the code");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="offer-dialog"
      aria-labelledby="offer-dialog-title"
      onCancel={onClose}
      onClose={onClose}
    >
      <button
        className="dialog-close"
        type="button"
        onClick={onClose}
        aria-label="Close offer"
      >
        ×
      </button>
      <div className="dialog-merchant">
        <span className="freshbox-mark small" aria-hidden="true">
          FB
        </span>
        FreshBox
      </div>
      <p className="eyebrow">{offer.discountLabel}</p>
      <h2 id="offer-dialog-title">{offer.title}</h2>
      <p>{offer.description}</p>
      {offer.code ? (
        <div className="code-box">
          <code>{offer.code}</code>
          <button type="button" onClick={copyCoupon}>
            {copyLabel}
          </button>
        </div>
      ) : (
        <div className="deal-confirmation">
          This fictional deal is ready to test.
        </div>
      )}
      <p className="dialog-note">
        Practice only — this offer and code cannot be redeemed.
      </p>
    </dialog>
  );
}
