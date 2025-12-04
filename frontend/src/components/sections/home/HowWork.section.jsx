import {FileUp ,Lightbulb , GraduationCap} from "lucide-react"
export default function HowWorkSection() {
  return (
    <section className="  min-h-[calc(70dvh)] flex flex-col justify-center items-center gap-4  ">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">How eduplan Works</h2>
        <p className="mt-2 text-gray-400">
          A simple, three-step process to academic success.
        </p>
      </div>
      <div className="mt-12 relative">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <FileUp className="text-3xl"/>
            </div>
            <h3 className="text-lg font-bold text-white">
              1. Upload Your Documents
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Easily upload your notes, assignments, and study materials.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Lightbulb className="text-3xl"/>
            </div>
            <h3 className="text-lg font-bold text-white">2. Ask Questions</h3>
            <p className="mt-1 text-sm text-gray-400">
              Get instant answers and explanations from our AI tutor.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <GraduationCap className="text-3xl"/>
            </div>
            <h3 className="text-lg font-bold text-white">3. Learn and Grow</h3>
            <p className="mt-1 text-sm text-gray-400">
              Improve your understanding and achieve better results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
