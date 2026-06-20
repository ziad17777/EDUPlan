import { BookOpenText, BadgeQuestionMark, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function WhyEduSection() {
  const items = [
    {
      icon: <BookOpenText className="text-3xl" />,
      title: "Vast Resource Library",
      desc: "Access a wide range of study materials, including textbooks, notes, and practice exams, all in one place.",
    },
    {
      icon: <BadgeQuestionMark className="text-3xl" />,
      title: "Interactive Learning Tools",
      desc: "Engage with interactive quizzes, flashcards, and study guides designed to enhance understanding and retention.",
    },
    {
      icon: <Users className="text-3xl" />,
      title: "Collaborative Environment",
      desc: "Connect with peers, share resources, and study together in a supportive online community.",
    },
  ];

  return (
    <section className="bg-slate-50 dark:bg-slate-900/70 py-16 sm:py-24">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false, amount: 0.3 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Why eduplan vs. Traditional Study?
          </h2>

          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            eduplan offers a modern, efficient approach to learning, surpassing
            traditional methods in several key areas.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
              }}
              viewport={{ once: false, amount: 0.3 }}
              className="
                group
                flex flex-col items-center text-center
                p-6 rounded-xl

                border border-transparent
                bg-white/0 dark:bg-transparent

                transition-all duration-500
                cursor-pointer

                hover:-translate-y-2
                hover:border-primary/50
                hover:bg-primary/5
                hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]
              "
            >
              {/* Icon */}
              <div className="
                flex h-12 w-12 items-center justify-center rounded-full
                bg-primary/10 text-primary
                transition-all duration-500
                group-hover:bg-primary/20
                group-hover:scale-110
              ">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
                {item.title}
              </h3>

              {/* Desc */}
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}