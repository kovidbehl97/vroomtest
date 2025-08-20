// app/(routes)/bookings/[id]/page.tsx

import { redirect } from "next/navigation";
import BookingFormClient from "../../../_components/BookingForm";
import { getServerSession } from "next-auth";

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const session = await getServerSession();
  const { id: carId } = await params;  // ✅ await because params is a Promise

  if (!session || !session.user) {
    redirect("/login");
  }

  return <BookingFormClient carId={carId} />;
}
