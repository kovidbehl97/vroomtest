// app/(routes)/bookings/[id]/page.tsx

import { redirect } from "next/navigation";
import BookingFormClient from "../../../_components/BookingForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../_lib/auth"; // Adjust the import path as necessary

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const session = await getServerSession(authOptions);
  const carId  = await params;  // ✅ await because params is a Promise

  if (!session || !session.user) {
    redirect("/login");
  }

  return <BookingFormClient carId={carId.id} />;
}
