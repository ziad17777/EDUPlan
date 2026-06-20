import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);

    setTimeout(() => {
      setSent(false);
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: false, amount: 0.3 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Contact Us
        </h2>

        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          We’d love to hear from you. Send us a message and we’ll get back to you shortly.
        </p>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          {["name", "email"].map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                Your {field}
              </label>

              <Input
                name={field}
                placeholder={`Enter your ${field}`}
                className="
                  transition-all duration-300
                  focus:ring-2 focus:ring-primary/50
                  focus:border-primary
                  focus:shadow-[0_0_10px_rgba(59,130,246,0.3)]
                "
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Message
            </label>

            <Textarea
              rows={5}
              placeholder="Enter your message"
              className="
                transition-all duration-300
                focus:ring-2 focus:ring-primary/50
                focus:border-primary
                focus:shadow-[0_0_10px_rgba(59,130,246,0.3)]
              "
            />
          </div>

          <div className="flex justify-end">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="
                  bg-primary text-white
                  hover:bg-primary/90
                  transition-all duration-300
                  min-w-[140px]
                "
              >
                {sent ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Sent
                  </span>
                ) : (
                  "Send Message"
                )}
              </Button>
            </motion.div>
          </div>
        </motion.form>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div className="flex items-start gap-4 hover:translate-x-1 transition">
            <Mail className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Email
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                support@eduplan.com
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 hover:translate-x-1 transition">
            <Phone className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Phone
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                +1 (555) 123-4567
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 hover:translate-x-1 transition">
            <MapPin className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Address
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                123 Learning Lane, Education City, 10001
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}