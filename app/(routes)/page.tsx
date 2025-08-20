import Hero from "../_components/Hero";
import CarList from "../_components/CarList";

export default function Home() {
  return (
    <>
      <main className="overflow-hidden">
        <Hero />
        <CarList />
      </main>
    </>
  );
}
