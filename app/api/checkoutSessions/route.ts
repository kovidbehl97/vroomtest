// File: /app/api/checkout_sessions/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '../../_lib/stripe';
import { ObjectId } from 'mongodb';
import { getMongoClient } from '../../_lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { Car } from '../../_lib/types';

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://8dd49e955fd0.ngrok-free.app';

    const body = await req.json();
    const { carId, pickupDate, dropoffDate, pickupTime, dropoffTime, location } = body;

    // 1. Basic input validation
    if (!carId || !pickupDate || !dropoffDate || !pickupTime || !dropoffTime || !location) {
      console.error('API Error: Missing required booking data');
      return NextResponse.json({ error: 'Missing booking data' }, { status: 400 });
    }

    // 2. Fetch and validate car details
    const carDetails: Car | null = await getCarDetails(carId);
    if (!carDetails) {
      console.error('API Error: Car not found with ID:', carId);
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // 3. Validate price and dates before calculation
    const priceAsNumber = Number(carDetails.price);
    const startDate = new Date(pickupDate);
    const endDate = new Date(dropoffDate);

    if (isNaN(priceAsNumber) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('API Error: Invalid price or date data.');
      return NextResponse.json({ error: 'Invalid car price or date' }, { status: 400 });
    }
    
    // 4. Calculate total price and ensure it's an integer
    const totalPrice = calculateTotalPrice(priceAsNumber, startDate, endDate);
    const totalPriceInCents = Math.round(totalPrice * 100);

    // 5. Get user session for metadata
    const usersession = await getServerSession(authOptions);
    const sessionUser = usersession?.user;
    
    // 6. Log data for debugging before Stripe API call
    console.log('Creating Stripe checkout session with the following data:');
    console.log('  Car Price:', priceAsNumber, 'Total Price:', totalPrice, 'Total Price in Cents:', totalPriceInCents);
    console.log('  User Email:', sessionUser?.email || 'guest@example.com');

    const session = await stripe.checkout.sessions.create({
      customer_email: sessionUser?.email || 'guest@example.com',
      billing_address_collection: 'auto',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${carDetails.make} ${carDetails.model}`,
              description: `Car booking for ${carDetails.year}`,
            },
            unit_amount: totalPriceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        userId: sessionUser?.id || 'guest',
        carId,
        pickupDate,
        dropoffDate,
        pickupTime,
        dropoffTime,
        location,
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: unknown) {
    console.error('Stripe checkout error:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error', message: 'An unknown error occurred' }, { status: 500 });
  }
}

// Helper functions (no changes needed here)
async function getCarDetails(carId: string): Promise<Car | null> {
  try {
    const client = await getMongoClient();
    const db = client.db('cars');
    const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) }) as Car | null;
    return car;
  } catch (error) {
    console.error('Error fetching car details:', error);
    return null;
  }
}

function calculateTotalPrice(price: number, startDate: Date, endDate: Date): number {
  const daysBooked = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return price * daysBooked;
}