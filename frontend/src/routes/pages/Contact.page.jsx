import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message sent!");
  };

  return (
    
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Contact Us
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              We’d love to hear from you. Send us a message and we’ll get back to you shortly.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* ==== Contact Form ==== */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Your Name
                </label>
                <Input id="name" name="name" placeholder="Enter your name" />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Your Email
                </label>
                <Input id="email" name="email" placeholder="Enter your email" type="email" />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Message
                </label>
                <Textarea id="message" name="message" placeholder="Enter your message" rows={5} />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
                  Send Message
                </Button>
              </div>
            </form>

            {/* ==== Contact Info ==== */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Email</h3>
                  <p className="text-slate-600 dark:text-slate-400">support@eduplan.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Phone</h3>
                  <p className="text-slate-600 dark:text-slate-400">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Address</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    123 Learning Lane, Education City, 10001
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      
  );
}
