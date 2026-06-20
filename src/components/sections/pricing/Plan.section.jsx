import { CircleCheckBig } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PlanSection() {
  const plans = [
    {
      name: "Pro",
      price: "$9",
      period: "/month",
      desc: "Perfect for serious students.",
      features: [
        "Everything in Basic",
        "AI-powered answers",
        "Advanced study tools",
      ],
    },
    {
      name: "Basic",
      price: "Free",
      period: "/forever",
      desc: "Essential tools to get you started.",
      features: [
        "Upload and manage documents",
        "Basic study tools",
        "Community support",
      ],
    },
    {
      name: "Premium",
      price: "$19",
      period: "/month",
      desc: "Full access to everything.",
      features: [
        "Everything in Pro",
        "Priority support",
        "Unlimited AI usage",
      ],
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Choose the plan that's right for you
          </h1>

          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Join thousands of students achieving their academic goals with eduplan.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3 px-4">

          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
              }}
              viewport={{ once: false, amount: 0.3 }}
              whileHover={{
                y: -10,
                scale: 1.03,
              }}
              className="
                group flex flex-col rounded-xl p-6 cursor-pointer

                border border-slate-200
                bg-white dark:bg-slate-900/50
                dark:border-slate-800

                transition-all duration-300

                hover:border-primary/50
                hover:bg-primary/5
                hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]
              "
            >
              {/* Name */}
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {plan.name}
              </h3>

              {/* Price */}
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {plan.period}
                </span>
              </p>

              {/* Desc */}
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                {plan.desc}
              </p>

              {/* Button */}
              <Link
                to="/auth/signup"
                className="
                  mt-6 w-full rounded-lg
                  bg-primary/10 px-4 py-2
                  text-center text-sm font-bold text-primary
                  transition-all duration-300

                  hover:bg-primary/20
                  dark:bg-primary/20 dark:hover:bg-primary/30
                "
              >
                Get started
              </Link>

              {/* Features */}
              <ul className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CircleCheckBig className="text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}