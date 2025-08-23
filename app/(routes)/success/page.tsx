// app/(routes)/bookings/success/page.tsx
import Link from 'next/link';
import { stripe } from '../../_lib/stripe';
import { redirect } from 'next/navigation';
import { Stripe } from 'stripe';

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function Success({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    console.error('Missing session_id in success page search params');
    redirect('/');
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer_details', 'line_items.data.price.product'],
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error retrieving Stripe session ${session_id}:`, error.message);
    } else {
      console.error(`Error retrieving Stripe session ${session_id}:`, error);
    }
    redirect('/');
  }

  const { customer_details, line_items } = session;
  const customerEmail = customer_details?.email || 'Customer';

  // Safely type the booked item
  let bookedItem: Stripe.Product | null = null;
  const lineItem = line_items?.data[0];
  if (lineItem?.price?.product && typeof lineItem.price.product !== 'string') {
    bookedItem = lineItem.price.product as Stripe.Product;
  }

  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-black text-white px-4">
      <div className="max-w-lg w-full text-center bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
        <p className="mb-6">
          Thank you for your booking, <strong>{customerEmail}</strong>! A confirmation email has been sent.
        </p>

        {bookedItem && (
          <div className="text-left mb-6 bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Booking Details:</h2>
            <ul className="space-y-1">
              <li><strong>Car:</strong> {bookedItem.name}</li>
              {bookedItem.description && <li><strong>Description:</strong> {bookedItem.description}</li>}
            </ul>
          </div>
        )}

        <Link
          href="/"
          className="inline-block bg-white text-black font-bold px-6 py-3 rounded hover:bg-gray-200 transition"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
