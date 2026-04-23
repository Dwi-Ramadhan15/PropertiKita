import HeroCarousel from "../components/HeroCarousel";
import PropertyList from "../components/PropertyList";

export default function Home() {
  return (
    <main>
      {/* HERO MASUK LAGI */}
      <HeroCarousel />

      {/* LIST PROPERTI */}
      <PropertyList type="all" />
    </main>
  );
}