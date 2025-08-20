import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import { getMongoClient } from '../../../_lib/mongodb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await getMongoClient();
    const db = client.db('cars');
    const paramsData = await params
    const car = await db.collection('cars').findOne({ _id: new ObjectId(paramsData.id) });
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    return NextResponse.json(car);
  } catch (error: unknown) {
    console.error('GET /api/cars/[id] - Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error', message: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const updateData = await request.json(); // Get the entire request body as updateData

    // Remove the _id from the update data if it exists, as we don't want to update the ID
    if (updateData._id) {
      delete updateData._id;
    }

    const client = await getMongoClient();
    const db = client.db('cars');
    
    const result = await db.collection('cars').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData } // Use the entire object to update all fields sent from the frontend
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
    return NextResponse.json({ error: 'Internal Server Error', message: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const client = await getMongoClient();
    const db = client.db('cars');
    const result = await db.collection('cars').deleteOne({ _id: new ObjectId(params.id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Car deleted' });
  } catch (error: unknown) {
    console.error('DELETE /api/cars/[id] - Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error', message: 'An unknown error occurred' }, { status: 500 });
  }
}