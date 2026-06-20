import { FileUp, Lightbulb, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function HowWorkSection() {
  const steps = [
    {
      icon: <FileUp className="w-8 h-8" />,
      title: "1. Upload Your Documents",
      desc: "Easily upload your notes, assignments, and study materials.",
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "2. Ask Questions",
      desc: "Get instant answers and explanations from our AI tutor.",
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "3. Learn and Grow",
      desc: "Improve your understanding and achieve better results.",
    },
  ];

  return (
    <section className="min-h-[70dvh] flex flex-col justify-center items-center py-20 px-6">

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: false, amount: 0.3 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white">
          How Eduplan Works
        </h2>

        <p className="mt-2 text-gray-400">
          A simple, three-step process to academic success.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="mt-14 grid md:grid-cols-3 gap-10 w-full max-w-6xl">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.15,
            }}
            viewport={{ once: false, amount: 0.3 }}
            className="
              group
              flex flex-col items-center text-center
              bg-gray-900/40
              border border-gray-800
              rounded-2xl
              p-8
              transition-all duration-500
              hover:-translate-y-2
              hover:border-primary/40
              hover:shadow-[0_0_25px_rgba(59,130,246,0.12)]
            "
          >
            {/* Icon */}
            <div
              className="
                w-16 h-16 rounded-full
                bg-primary/20
                flex items-center justify-center
                text-primary mb-5
                transition-all duration-500
                group-hover:scale-110
              "
            >
              {step.icon}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors duration-300">
              {step.title}
            </h3>

            {/* Desc */}
            <p className="mt-2 text-sm text-gray-400 leading-6">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>

    </section>
  );
}