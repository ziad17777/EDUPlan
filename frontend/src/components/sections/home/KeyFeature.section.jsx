import {Upload ,FileQuestionMark , Sparkles } from "lucide-react"

export default function KeyFeatureSection() {
  return (
    <section className="min-h-[calc{85dvh}] py-16 md:py-24 bg-background/50 flex flex-col justify-center items-center gap-4">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Key Features</h2>
          <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
            Empowering Students with a suite of features designed to enhance
            your learning experience.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Upload/>
            </div>
            <h3 className="text-lg font-bold text-white">Upload</h3>
            <p className="mt-2 text-sm text-gray-400">
              Upload study materials in various formats, including notes,
              assignments, and textbooks.
            </p>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4">
              <FileQuestionMark/>
            </div>
            <h3 className="text-lg font-bold text-white">Ask</h3>
            <p className="mt-2 text-sm text-gray-400">
              Ask any question related to your uploaded documents and get
              instant, accurate answers.
            </p>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Sparkles/>
            </div>
            <h3 className="text-lg font-bold text-white">Learn</h3>
            <p className="mt-2 text-sm text-gray-400">
              Learn effectively with AI-powered explanations, summaries, and
              personalized study aids.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
