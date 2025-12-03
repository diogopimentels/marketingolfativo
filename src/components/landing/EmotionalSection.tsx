import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

export const EmotionalSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-spacing bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="container-premium">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          <Quote className="w-16 h-16 text-primary/20 mx-auto mb-8" />
          
          <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-foreground leading-snug mb-10">
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          </blockquote>

          <div className="flex items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-serif text-xl text-primary">JD</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-foreground">John Doe Lorem</div>
              <div className="text-sm text-muted-foreground">CEO, Ipsum Corporation</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
