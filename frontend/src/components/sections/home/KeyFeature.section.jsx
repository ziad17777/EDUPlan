import { Upload, FileQuestionMark, Sparkles, Zap, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Upload,
    title: "Upload & Analyze",
    description:
      "Upload study materials in various formats. Our AI instantly processes notes, assignments, and textbooks.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: FileQuestionMark,
    title: "Ask Questions",
    description:
      "Get instant, accurate answers to any question related to your uploaded documents with AI-powered insights.",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Sparkles,
    title: "Learn Smarter",
    description:
      "Receive AI-powered explanations, summaries, and personalized study aids tailored to your learning style.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Get answers in seconds, not hours. Our advanced AI processes information at incredible speeds.",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your documents and data are encrypted and protected. We take your privacy seriously.",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Clock,
    title: "24/7 Available",
    description:
      "Study on your schedule. Access your AI tutor anytime, anywhere, from any device.",
    color: "from-pink-500 to-pink-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function KeyFeatureSection() {
  return (
    <section id="features" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-background pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Key Features
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              excel
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Empowering students with a comprehensive suite of AI-powered tools
            designed to transform your learning experience.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-slate-700/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 backdrop-blur-sm"
              >
                {/* Icon with gradient background */}
                <div className="relative mb-6">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="absolute inset-0 w-14 h-14 rounded-xl bg-gradient-to-br opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl pointer-events-none"></div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
