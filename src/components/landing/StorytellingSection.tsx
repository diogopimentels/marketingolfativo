import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export const StorytellingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="sobre" className="section-spacing overflow-hidden">
      <div className="container-premium">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-sm font-medium text-accent uppercase tracking-widest mb-4 block">
              O Erro Comum
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8 leading-tight">
              Perfumar a loja não é o mesmo que <span className="text-gradient">construir identidade.</span>
            </h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                Fragrâncias genéricas deixam o ambiente agradável. Mas não constroem lembrança. Não criam conexão. Não comunicam posicionamento.
              </p>
              <p className="border-l-4 border-accent pl-4 italic text-foreground/80">
                O olfato é memória emocional. Se o cheiro não é estratégico, ele é só decoração.
              </p>

              <h3 className="font-display text-2xl text-foreground font-semibold mt-8 pt-4">
                A virada de chave
              </h3>
              <p>
                É aqui que o marketing olfativo deixa de ser “cheirinho” e passa a ser <strong>branding sensorial</strong>.
              </p>
              <p>
                Nós desenvolvemos assinaturas olfativas exclusivas que traduzem a essência da sua marca em uma experiência invisível — mas impossível de ignorar.
              </p>
              <p>
                A cliente pode não perceber conscientemente. Mas ela sente. E lembra.
              </p>
              <p className="font-semibold text-foreground text-xl">
                E é isso que diferencia marcas comuns de marcas desejadas.
              </p>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src="/section.png"
                alt="Marketing Olfativo"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

