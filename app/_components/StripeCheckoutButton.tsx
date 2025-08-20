'use client';

import { useState } from 'react';
import getStripe from '../_lib/getStripe';

type Props = {
  carId: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  location: string;

};

export default function StripeCheckoutButton({ carId, pickupDate, dropoffDate, pickupTime, dropoffTime, location }: Props) {
  const [canceled] = useState(false);
console.log(pickupDate)
  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkoutSessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carId, pickupDate, dropoffDate, pickupTime, dropoffTime, location }),
      });

      const data = await res.json();

      if (data.sessionId) {
        const stripe = await getStripe();
        const { error } = await stripe!.redirectToCheckout({ sessionId: data.sessionId });
        if (error) {
          console.error(error);
        }
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error during checkout', error);
    }
  };

  return (
    <form>
      <section>
        <button className=' w-full bg-black font-bold text-white px-4 h-[47px] cursor-pointer mt-10 mb-5' type="button" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </section>
      {canceled && <p>Your order was canceled. Feel free to check out again.</p>}
    </form>
  );
}
