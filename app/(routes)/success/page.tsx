// app/(routes)/bookings/success/page.tsx
import Link from 'next/link';
import { stripe } from '../../_lib/stripe';
import { redirect } from 'next/navigation';

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
  const customerEmail = customer_details?.email;
  const bookedItem = line_items?.data[0].price?.product as any;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-yellow-400">Booking Confirmed!</h1>
        <p className="mb-6">
          Thank you, <strong>{customerEmail}</strong>, for your booking.
        </p>

        {bookedItem && (
          <div className="text-left mb-6">
            <h2 className="text-xl font-semibold mb-2">Booking Details:</h2>
            <ul className="space-y-1">
              <li><strong>Car:</strong> {bookedItem.name}</li>
              <li><strong>Description:</strong> {bookedItem.description}</li>
            </ul>
          </div>
        )}

        <p className="mb-6 text-gray-300">
          A confirmation email has been sent with all your booking details.
        </p>

        <Link
          href="/"
          className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-md transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
