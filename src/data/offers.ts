import type { Offer } from "../types";

export const offers: Offer[] = [
  {
    id: "freshbox_200_new_customer",
    discountLabel: "$200 OFF",
    title: "Save across your first five FreshBox deliveries",
    description:
      "A generous welcome saving spread across five flexible meal boxes.",
    type: "code",
    code: "FRESHSTART200",
    verified: true,
    expiryDate: "2026-12-31",
    terms:
      "New FreshBox customers only. Minimum box value applies. Discount is split across five consecutive deliveries.",
    segment: "new_customer",
  },
  {
    id: "freshbox_40_first_box",
    discountLabel: "40% OFF",
    title: "Take 40% off your first recipe box",
    description:
      "Choose from speedy dinners, vegetarian favourites, and family classics.",
    type: "code",
    code: "TRYFRESH40",
    verified: true,
    expiryDate: "2026-10-15",
    terms:
      "Valid on the first delivery for new subscriptions. Cannot be combined with another promotion.",
    segment: "new_customer",
  },
  {
    id: "freshbox_free_delivery",
    discountLabel: "FREE SHIP",
    title: "Free delivery on selected weekly plans",
    description:
      "Get delivery included when your weekly plan meets the minimum basket value.",
    type: "deal",
    verified: true,
    expiryDate: "2026-11-30",
    terms:
      "Available on marked plans only. Regional exclusions and minimum order values apply.",
    segment: "all",
  },
  {
    id: "freshbox_student_15",
    discountLabel: "15% OFF",
    title: "Ongoing student saving on flexible boxes",
    description:
      "A smaller weekly price for verified students while eligibility remains active.",
    type: "deal",
    verified: false,
    expiryDate: "2026-09-30",
    terms:
      "Student status must be verified through the fictional CouponLab practice flow. Revalidation may be required.",
    segment: "student",
  },
  {
    id: "freshbox_autumn_25",
    discountLabel: "25% OFF",
    title: "Autumn menu promotion",
    description: "An archived seasonal saving included for interface testing.",
    type: "code",
    code: "AUTUMN25",
    verified: false,
    expiryDate: "2025-05-31",
    terms: "This fictional promotion has expired and cannot be redeemed.",
    segment: "all",
    expired: true,
  },
];

export const activeOffers = offers.filter((offer) => !offer.expired);
export const expiredOffers = offers.filter((offer) => offer.expired);
