'use client';
import { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
   useEffect(() => {
      const checkSession = async () => {
        const session = await getServerSession();
        if (!session || !session.user) {
          console.log("No session found, redirecting to login");
          redirect("/login");
        }
      };
      checkSession();
    }, []);
  useEffect(() => {
    async function initCheckout() {
      const stripe = await stripePromise;
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${process.env.API_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Pass booking data from previous page or context
          carId: 'example_car_id',
          startDate: '2025-04-20',
          endDate: '2025-04-22',
          totalPrice: 110,
        }),
      });
      const { id } = await res.json();

      if (stripe) {
        stripe.redirectToCheckout({ sessionId: id });
      }
    }
    initCheckout();
  }, []);

  return <div className="container mx-auto py-10">Redirecting to Stripe...</div>;
}