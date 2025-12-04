import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Users, Clock, Brain } from "lucide-react";

const stats = [
  {
    icon: Brain,
    value: "35%",
    label: "Memória Olfativa",
    description: "das pessoas lembram do cheiro",
  },
  {
    icon: TrendingUp,
    value: "76%",
    label: "Aumento em Vendas",
    description: "aumento médio nas vendas",
  },
  {
    icon: Clock,
    value: "33%",
    label: "Permanência",
    description: "mais tempo dentro da loja",
  },
  {
    icon: Users,
    value: "16%",
    label: "Fidelização",
    description: "memorizam marcas aromatizadas",
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
    <section id="estatisticas" className="section-spacing bg-primary text-primary-foreground relative overflow-hidden">
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
          <motion.div variants={itemVariants} className="text-left md:text-center mb-16 md:mb-20">
            <span className="text-sm font-medium text-primary-foreground/70 uppercase tracking-widest mb-4 block">
              Impacto Real
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Por que aromas transformam marcas de roupas?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-0 md:mx-auto">
              Dados que provam o poder do olfato no comportamento do consumidor – e por que ele pode ser o segredo por trás do sucesso da sua marca.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 text-left md:text-center border border-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors duration-300"
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

