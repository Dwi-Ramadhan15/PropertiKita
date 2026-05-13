import HeroCarousel from "../components/HeroCarousel";
import PropertyList from "../components/PropertyList";

export default function Home() {
  return (
    <main className="overflow-x-hidden w-full">
      <HeroCarousel />
      <PropertyList type="all" />
    </main>
  );
}