import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const FormSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Lorem ipsum dolor sit amet",
      description: "Consectetur adipiscing elit, sed do eiusmod tempor.",
    });
    
    setIsSubmitting(false);
  };

  return (
    <section className="section-spacing bg-secondary/30">
      <div className="container-premium">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-accent uppercase tracking-widest mb-4 block">
              Contato
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Fale conosco
            </h2>
            <p className="text-muted-foreground text-lg">
              Neque porro quisquam est qui dolorem ipsum quia dolor sit amet.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Lorem ipsum
                </label>
                <input
                  type="text"
                  id="name"
                  className="input-premium"
                  placeholder="Dolor sit amet"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Consectetur
                </label>
                <input
                  type="email"
                  id="email"
                  className="input-premium"
                  placeholder="adipiscing@elit.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                Sed do eiusmod
              </label>
              <input
                type="text"
                id="company"
                className="input-premium"
                placeholder="Tempor incididunt"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Ut labore et dolore
              </label>
              <textarea
                id="message"
                rows={5}
                className="input-premium resize-none"
                placeholder="Magna aliqua ut enim ad minim veniam..."
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent"
                className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="consent" className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
              </label>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Lorem ipsum...
                </>
              ) : (
                <>
                  Dolor Sit Amet
                  <Send className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
