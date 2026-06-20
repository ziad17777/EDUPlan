import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-[calc(100dvh-52px)] max-h-[calc(100dvh-52px)] w-full overflow-hidden flex justify-center items-center
      bg-[url(/images/home/home-image-matched.webp)] bg-cover bg-fixed bg-center">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent min-h-[calc(100dvh-52px)] max-h-[calc(100dvh-52px)]  pointer-events-none"></div>

      {/* Content */}
      <div className="relative flex flex-col justify-center items-center h-full w-full px-4">

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white text-center"
        >
          Unlock Your Learning Potential with AI
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-4 max-w-2xl mx-auto text-center text-base md:text-lg text-gray-300"
        >
          eduplan helps students understand their school subjects better by
          using AI to analyze their documents and answer questions.
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
        >
          <Button asChild className="mt-8 font-bold shadow-lg">
            <Link to="/auth/signin">
              Start Learning With AI
            </Link>
          </Button>
        </motion.div>

      </div>
    </section>
  );
}