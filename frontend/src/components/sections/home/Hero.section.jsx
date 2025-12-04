import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative min-h-[calc(100dvh-52px)] max-h-[calc(100dvh-52px)] w-full overflow-hidden flex justify-center items-center
                         bg-[url(/images/home/hero-section.webp)] bg-cover bg-fixed bg-center">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent min-h-[calc(100dvh-52px)] max-h-[calc(100dvh-52px)]  pointer-events-none"></div>

      <div className="relative  flex flex-col justify-center items-center h-full w-full px-4">
        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white">
          Unlock Your Learning Potential with AI
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-center text-base md:text-lg text-gray-300">
          eduplan helps students understand their school subjects better by
          using AI to analyze their documents and answer questions.
        </p>
        <Button asChild className="mt-8 font-bold shadow-lg">
          <Link to="/auth/signin">Start Learning With AI</Link>
        </Button>
      </div>
    </section>
  );
}
