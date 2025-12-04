import {BookOpenText ,BadgeQuestionMark ,Users } from "lucide-react"
export default function WhyEduSection() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900/70 py-16 sm:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Why eduplan vs. Traditional Study?
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            eduplan offers a modern, efficient approach to learning, surpassing
            traditional methods in several key areas.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpenText className="text-3xl"/>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
              Vast Resource Library
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Access a wide range of study materials, including textbooks,
              notes, and practice exams, all in one place.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BadgeQuestionMark className="text-3xl"/>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
              Interactive Learning Tools
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Engage with interactive quizzes, flashcards, and study guides
              designed to enhance understanding and retention.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="text-3xl"/>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
              Collaborative Environment
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Connect with peers, share resources, and study together in a
              supportive online community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
