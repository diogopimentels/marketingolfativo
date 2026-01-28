import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Zap, Shield, Heart } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Lorem ipsum dolor sit",
    description: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    icon: Shield,
    title: "Ut enim ad minim",
    description: "Veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    icon: Heart,
    title: "Duis aute irure dolor",
    description: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    icon: Check,
    title: "Excepteur sint occaecat",
    description: "Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
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

export const BenefitsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="beneficios" className="section-spacing bg-secondary/30">
      <div className="container-premium">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-accent uppercase tracking-widest mb-4 block">
              Posicionamento
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Autoridade + Sofisticação
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trabalhamos com marcas que já entenderam o jogo do alto valor.
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <motion.div variants={itemVariants} className="card-premium group">
              <div className="flex flex-col items-center text-center gap-5">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    Experiência vende mais
                  </h3>
                  <p className="text-muted-foreground">
                    Do que qualquer argumento lógico de venda.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="card-premium group">
              <div className="flex flex-col items-center text-center gap-5">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    Percepção de valor
                  </h3>
                  <p className="text-muted-foreground">
                    Vale muito mais do que desconto na etiqueta.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="card-premium group">
              <div className="flex flex-col items-center text-center gap-5">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    Marca forte é sentida
                  </h3>
                  <p className="text-muted-foreground">
                    Não precisa ser explicada o tempo todo.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Text */}
          <motion.div variants={itemVariants} className="text-center mt-12 md:mt-16">
            <p className="text-xl md:text-2xl font-display font-medium text-foreground">
              "Não é sobre perfumar o ambiente. É sobre ocupar a memória da cliente."
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
