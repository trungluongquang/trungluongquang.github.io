export type OfferType = "code" | "deal";
export type CustomerSegment =
  "new_customer" | "existing_customer" | "student" | "all";

export interface Offer {
  id: string;
  discountLabel: string;
  title: string;
  description: string;
  type: OfferType;
  code?: string;
  verified: boolean;
  expiryDate: string;
  terms: string;
  segment: CustomerSegment;
  expired?: boolean;
}

export type OfferFilter = "all" | "codes" | "deals" | "verified";
