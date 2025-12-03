import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Lorem ipsum dolor",
    description: "Sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    number: "02",
    title: "Ut enim ad minim",
    description: "Veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    number: "03",
    title: "Duis aute irure dolor",
    description: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    number: "04",
    title: "Excepteur sint occaecat",
    description: "Cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="como-funciona" className="section-spacing">
      <div className="container-premium">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-5xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-accent uppercase tracking-widest mb-4 block">
              Como Funciona
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Nemo enim ipsam voluptatem
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute left-[4.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-primary/30" />

            <div className="space-y-8 lg:space-y-12">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex gap-6 lg:gap-10 items-start"
                >
                  {/* Number */}
                  <div className="flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-card shadow-lg border border-border flex items-center justify-center relative z-10">
                    <span className="font-display text-2xl lg:text-3xl font-bold text-primary">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-3 lg:pt-4">
                    <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
