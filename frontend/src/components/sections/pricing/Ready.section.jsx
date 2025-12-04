import { Link } from "react-router-dom";
export default function ReadySection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Ready to transform your learning experience?
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Join thousands of students who are achieving their academic goals
            with EduPlan.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
            to="/auth/signup"
              className="rounded-lg bg-primary px-5 py-3 text-base font-bold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Get started now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

