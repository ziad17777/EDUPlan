import { Upload, FileQuestionMark, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function KeyFeatureSection() {
  const features = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Upload",
      desc: "Upload study materials in various formats, including notes, assignments, and textbooks.",
    },
    {
      icon: <FileQuestionMark className="w-6 h-6" />,
      title: "Ask",
      desc: "Ask any question related to your uploaded documents and get instant, accurate answers.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Learn",
      desc: "Learn effectively with AI-powered explanations, summaries, and personalized study aids.",
    },
  ];

  return (
    <section className="min-h-[85vh] py-16 md:py-24 bg-background/50 flex flex-col justify-center items-center overflow-hidden">
      
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, amount: 0.3 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Key Features
        </h2>

        <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
          Empowering students with a suite of features designed to enhance
          your learning experience.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="mt-14 grid md:grid-cols-3 gap-8 w-full max-w-6xl px-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.15,
            }}
            viewport={{ once: true, amount: 0.3 }}
            className="
              group
              bg-gray-900/50
              p-6
              rounded-2xl
              border border-gray-800
              backdrop-blur-sm
              transition-all duration-500
              hover:-translate-y-3
              hover:border-primary/40
              hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]
            "
          >
            {/* Icon */}
            <div
              className="
                w-14 h-14 rounded-xl
                bg-primary/20
                flex items-center justify-center
                text-primary mb-5
                transition-all duration-500
                group-hover:scale-110
                group-hover:rotate-6
              "
            >
              {feature.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="mt-3 text-sm leading-6 text-gray-400">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}