import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Solutions from "@/components/Solutions";
import BioSphere from "@/components/BioSphere";
import Values from "@/components/Values";
import Story from "@/components/Story";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Solutions />
      <Values />
      <BioSphere />
      <Story />
      <Footer />
    </main>
  );
}
