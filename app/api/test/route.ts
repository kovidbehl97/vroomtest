import { NextResponse } from 'next/server';
import { getMongoClient } from '../../_lib/mongodb';

export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db('cars');
    const result = await db.collection('bookings').insertOne({ test: 'ok', createdAt: new Date() });

    console.log('Mongo test insert result:', result);
    return NextResponse.json({ message: 'Inserted successfully', id: result.insertedId }, { status: 200 });
  } catch (err: any) {
    console.error('Mongo test error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
