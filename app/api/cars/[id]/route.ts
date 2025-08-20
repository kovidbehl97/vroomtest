import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../_lib/auth';
import { getMongoClient } from '../../../_lib/mongodb';

export async function GET(request: Request) {
  // Extract `id` from the URL
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1]; // last segment is the car ID

  try {
    const client = await getMongoClient();
    const db = client.db('cars');
    const car = await db.collection('cars').findOne({ _id: new ObjectId(id) });

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json(car);
  } catch (error: unknown) {
    console.error('GET /api/cars/[id] - Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error', message: 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const updateData = await request.json();
    delete updateData._id;

    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const id = segments[segments.length - 1];

    const client = await getMongoClient();
    const db = client.db('cars');

    const result = await db.collection('cars').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Car updated' });
  } catch (error: unknown) {
    console.error('PUT /api/cars/[id] - Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error', message: 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const id = segments[segments.length - 1];

    const client = await getMongoClient();
    const db = client.db('cars');

    const result = await db.collection('cars').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Car deleted' });
  } catch (error: unknown) {
    console.error('DELETE /api/cars/[id] - Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error', message: 'Unknown error' }, { status: 500 });
  }
}