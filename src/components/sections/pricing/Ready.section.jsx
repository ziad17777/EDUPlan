import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ReadySection() {
  return (
    <section className="py-16 sm:py-24">

      <div className="container mx-auto px-4 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false, amount: 0.3 }}
          className="mx-auto max-w-2xl text-center"
        >
          {/* Title */}
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Ready to transform your learning experience?
          </h2>

          {/* Description */}
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Join thousands of students who are achieving their academic goals
            with EduPlan.
          </p>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false, amount: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link
              to="/auth/signup"
              className="
                rounded-lg bg-primary px-5 py-3
                text-base font-bold text-white
                shadow-sm transition-all duration-300
                hover:bg-primary/90 hover:shadow-lg
              "
            >
              Get started now
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}