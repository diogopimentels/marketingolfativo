import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Target,
  Brain,
  FlaskConical,
  TrendingUp
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Como transformar aroma em posicionamento de marca",
    description: "Descubra por que grandes marcas usam fragrâncias exclusivas para se fixar na mente (e no coração) dos clientes.",
  },
  {
    icon: Brain,
    title: "O poder do olfato no comportamento de compra",
    description: "Aprenda como a memória olfativa influencia decisões e fideliza consumidores.",
  },
  {
    icon: FlaskConical,
    title: "Como criar seu aroma com a Karui Cosméticos",
    description: "Entenda o processo completo e como ter um aroma sob medida, sem complicação.",
  },
  {
    icon: TrendingUp,
    title: "Cases de Sucesso e Aplicações Práticas",
    description: "Veja exemplos reais de como marcas de moda utilizaram o marketing olfativo para aumentar vendas e reconhecimento.",
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
    <section id="o-que-aprender" className="section-spacing">
      <div className="container-premium">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-left md:text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-accent uppercase tracking-widest mb-4 block">
              Conteúdo Exclusivo
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              O que você vai aprender com este E-book?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-0 md:mx-auto">
              No e-book, você descobrirá como escolher o aroma certo para sua marca de moda e como utilizar a fragrância para criar uma identidade marcante e cativante.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group text-left md:text-center p-6 rounded-2xl hover:bg-accent/5 transition-colors duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mr-auto md:mx-auto mb-6 group-hover:bg-accent/20 transition-colors duration-300">
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

