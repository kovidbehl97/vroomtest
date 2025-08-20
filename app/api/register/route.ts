// app/api/register/route.ts
import { MongoClient } from 'mongodb'; 
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { getMongoClient } from '../../_lib/mongodb'; 

export async function POST(request: Request) {
  // No 'client' declaration needed outside try/catch now
  try {
    const { email, password, name } = await request.json();

    // Use the shared, cached client promise
    const client: MongoClient = await getMongoClient();
    // Ensure your DB name for users is correct, maybe use process.env.DB_NAME
    const db = client.db('cars');

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      // Consider returning a more specific status like 409 Conflict
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword, // Store hashed password
      name,
      role: 'user', // Default role
      createdAt: new Date(), // Add creation timestamp
    });

    // DO NOT close the client here. getMongoClient manages the lifecycle.
    // await client.close(); // REMOVED
    // Return basic user info (avoid returning password)
    return NextResponse.json(
      { _id: result.insertedId, email, name, role: 'user' },
      { status: 201 }
    );

  } catch (error: any) { // Use any for error type
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 }); // Include message for debugging
  }
}