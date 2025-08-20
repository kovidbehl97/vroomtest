// app/(routes)/bookings/success/page.tsx

import Link from 'next/link';
import { stripe } from '../../_lib/stripe';
import { redirect } from 'next/navigation';

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function Success({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams; // ✅ correctly awaited

  if (!session_id) {
    console.error('Missing session_id in success page search params');
    redirect('/');
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer_details'],
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error retrieving Stripe session ${session_id}:`, error.message);
    } else {
      console.error(`Error retrieving Stripe session ${session_id}:`, error);
    }
    redirect('/');
  }

  const { customer_details } = session;
  const customerEmail = customer_details?.email;

  return (
    <section id="success">
      <p>
        Thank you for your booking! A confirmation email will be sent to{' '}
        <strong>{customerEmail}</strong> shortly.
      </p>
      <Link
        href="/"
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4 inline-block"
      >
        Back to Home
      </Link>
    </section>
  );
}
