import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[calc(100dvh-52px)] w-full overflow-hidden flex justify-center items-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[url(/images/home/hero-section.webp)] bg-cover bg-fixed bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-900/60 to-transparent pointer-events-none"></div>

      <div className="relative container mx-auto flex flex-col justify-center items-center h-full w-full px-6 py-20">
        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <span className="mr-2">✨</span>
            AI-Powered Learning Platform
          </div>
        </motion.div>

        {/* Main headline with gradient text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-center max-w-5xl"
        >
          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Unlock Your Learning Potential
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            with AI
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-3xl mx-auto text-center text-lg md:text-xl text-slate-300 leading-relaxed"
        >
          EduPlan helps students master their subjects by using advanced AI to
          analyze documents, provide instant answers, and deliver personalized
          learning experiences.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
        >
          <Button
            asChild
            size="lg"
            className="font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group"
          >
            <Link to="/auth/signin" className="flex items-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="font-semibold bg-white/5 border-white/20 hover:bg-white/10 text-white backdrop-blur-sm"
          >
            <Link to="#features" className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Learn More
            </Link>
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-slate-400"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Trusted by students</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>AI-powered insights</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span>Secure & private</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
