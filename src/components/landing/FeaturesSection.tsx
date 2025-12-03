import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Layers, 
  Palette, 
  Sparkles, 
  Target, 
  Compass, 
  Gem 
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Lorem ipsum dolor",
    description: "Sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt.",
  },
  {
    icon: Palette,
    title: "Ut labore et dolore",
    description: "Magna aliqua ut enim ad minim veniam quis nostrud exercitation.",
  },
  {
    icon: Sparkles,
    title: "Ullamco laboris nisi",
    description: "Ut aliquip ex ea commodo consequat duis aute irure dolor in.",
  },
  {
    icon: Target,
    title: "Reprehenderit in voluptate",
    description: "Velit esse cillum dolore eu fugiat nulla pariatur excepteur sint.",
  },
  {
    icon: Compass,
    title: "Occaecat cupidatat",
    description: "Non proident sunt in culpa qui officia deserunt mollit anim id.",
  },
  {
    icon: Gem,
    title: "Est laborum sed ut",
    description: "Perspiciatis unde omnis iste natus error sit voluptatem accusantium.",
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

export const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="recursos" className="section-spacing">
      <div className="container-premium">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-accent uppercase tracking-widest mb-4 block">
              Recursos
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Doloremque laudantium totam rem
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
