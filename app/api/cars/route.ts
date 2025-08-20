import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getMongoClient } from '../../_lib/mongodb';

export async function GET(request: Request) {
  // No 'client' declaration needed outside try/catch now that finally is gone
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const carType = searchParams.get('carType') || '';
    const transmission = searchParams.get('transmission') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get the connected client (getMongoClient should handle connection pooling)
    const client = await getMongoClient();
    const db = client.db('cars'); // Or use getMongoDb() if you added it

    let query: any = {};

    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }
    if (carType) query.carType = carType;
    if (transmission) query.transmission = transmission;

    // Get the total number of matching cars
    const totalCars = await db.collection('cars').countDocuments(query);

    // Fetch the cars for the current page
    const cars = await db
      .collection('cars')
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    console.log('GET /api/cars - Query:', query, 'Page:', page, 'Limit:', limit, 'Cars found:', cars.length, 'Total Cars:', totalCars);

    return NextResponse.json({ cars, total: totalCars });
  } catch (error: any) {
    console.error('GET /api/cars - Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  
  try {
    const { make, model, year, price, mileage, carType, transmission, imageUrl } = await request.json();
    if (!make || !model || !year || !price || !mileage || !carType || !transmission) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db('cars');

    const result = await db.collection('cars').insertOne({
      make,
      model,
      year,
      price,
      mileage,
      carType,
      transmission,
      imageUrl: imageUrl || null, // Include the imageUrl field
    });

    console.log('POST /api/cars - Created car:', { _id: result.insertedId });
    return NextResponse.json(
      { _id: result.insertedId, make, model, year, price, mileage, carType, transmission, imageUrl },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/cars - Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}