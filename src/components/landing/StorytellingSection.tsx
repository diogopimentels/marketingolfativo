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
              Marketing Olfativo
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8 leading-tight">
              O que o marketing olfativo pode fazer pela sua marca de moda?
            </h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                Descubra como grandes marcas usam fragrâncias para criar conexão emocional, aumentar vendas e fidelizar clientes.
              </p>
              <p>
                Você já se perguntou por que certas marcas deixam uma impressão tão profunda, que até o aroma delas parece inesquecível? O segredo está no marketing olfativo.
              </p>
              <p>
                Em um mundo onde todos disputam atenção com imagens e sons, as marcas que tocam o coração – e o olfato – criam experiências verdadeiramente memoráveis.
              </p>
              <p>
                Um aroma exclusivo transforma a simples visita a uma loja em um momento de encantamento, um encontro sensorial que gera conexão, confiança e desejo.
              </p>
              <p>
                Grandes marcas já entenderam que o cheiro certo faz toda a diferença: cria identidade, reforça valores e se torna uma extensão natural do que a marca é.
              </p>
              <p>
                O marketing olfativo não é apenas um detalhe: é a emoção que sua cliente leva para casa, associada à sensação de bem-estar, elegância e exclusividade.
              </p>
              <p className="font-semibold text-foreground">
                Porque no final das contas, a cliente pode até esquecer o que viu ou ouviu... Mas nunca vai esquecer como você a fez se sentir.
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

