import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Users, Award, Globe } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "250%",
    label: "Lorem ipsum dolor",
    description: "Consectetur adipiscing elit sed do eiusmod",
  },
  {
    icon: Users,
    value: "50K+",
    label: "Ut enim ad minim",
    description: "Veniam quis nostrud exercitation ullamco",
  },
  {
    icon: Award,
    value: "4.9",
    label: "Duis aute irure",
    description: "In reprehenderit in voluptate velit esse",
  },
  {
    icon: Globe,
    value: "35+",
    label: "Excepteur sint",
    description: "Cupidatat non proident sunt in culpa",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-spacing bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground))_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container-premium relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-primary-foreground/70 uppercase tracking-widest mb-4 block">
              Resultados
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Numquam eius modi tempora
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-6">
                  <stat.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="font-display text-4xl md:text-5xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="font-medium text-lg mb-2">{stat.label}</div>
                <p className="text-sm text-primary-foreground/70">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
