import { CircleCheckBig} from "lucide-react"
import { Link } from "react-router-dom";
export default function PlanSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Choose the plan that's right for you
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Join thousands of students achieving their academic goals with
            eduplan.
          </p>
        </div>
        <div className="flex-grow flex items-center justify-center px-4 py-8 sm:py-16">
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Basic
            </h3>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Free
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                /forever
              </span>
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Essential tools to get you started.
            </p>
            <Link
              className="mt-6 w-full rounded-lg bg-primary/10 px-4 py-2 text-center text-sm font-bold text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
              to="/auth/signup"
            >
              Get started
            </Link>
            <ul className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-3">
                <CircleCheckBig className="text-2xl "/>
                Upload and manage documents
              </li>
              <li className="flex items-center gap-3">
                <CircleCheckBig className="text-2xl "/>
                Basic study tools
              </li>
              <li className="flex items-center gap-3">
                <CircleCheckBig className="text-2xl "/>
                Community support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
