import Stripe from "stripe";

const KEY = process.env.STRIPE_SECRET_KEY || "";

export const stripeConfigured = !!KEY;

// Only instantiate when configured; routes guard on stripeConfigured first.
export const stripe = KEY ? new Stripe(KEY, { apiVersion: "2024-06-20" }) : (null as unknown as Stripe);
