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
          <div className="space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-snug">
              Você investe em coleção, loja, visual, atendimento.
              <br />
              <span className="text-muted-foreground">Mas, no fim, muitas clientes ainda escolhem pela etiqueta.</span>
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto pt-4">
              Quando a experiência é igual à das outras lojas, a decisão vira comparação.
              E comparação leva ao preço.
            </p>

            <div className="pt-6">
              <span className="inline-block px-4 py-2 rounded-full bg-destructive/10 text-destructive font-medium text-lg">
                Marcas memoráveis não vivem disso.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
