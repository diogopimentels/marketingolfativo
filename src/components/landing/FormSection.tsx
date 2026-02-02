import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
// import { submitToAgendor } from "@/services/agendor"; // Removed in favor of direct backend call
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Interface para o Window ter o fbq tipado (TypeScript)
declare global {
  interface Window {
    fbq: any;
  }
}

export const FormSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    telefone: "",
    nomeMarca: "",
    temMarca: "Confecção Atacado",
    newsletter: true
  });

  const ebookUrl = "https://drive.google.com/uc?export=download&id=1NoFqm9FwG9gEGVLnoC4K7Egc0J8DAyda";

  const phoneMask = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo que não é dígito
      .replace(/^(\d{2})(\d)/g, '($1) $2') // Coloca parênteses no DDD
      .replace(/(\d)(\d{4})$/, '$1-$2'); // Coloca hífen
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    // @ts-ignore
    const checked = e.target.checked;
    // @ts-ignore
    const name = e.target.name;

    if (id === 'telefone') {
      const maskedValue = phoneMask(value);
      setFormData(prev => ({ ...prev, [id]: maskedValue }));
      return;
    }

    if (type === 'radio') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [id]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Gera ID único para deduplicação
    const eventId = uuidv4();
    const userAgent = navigator.userAgent;

    // 2. Browser Tracking (Pixel Nativo)
    try {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead', {}, { eventID: eventId });
      }
    } catch (pixelError) {
      console.error("Erro Pixel Browser:", pixelError);
    }

    try {
      // 3. Server-Side Centralizado Vercel (CAPI + Google Sheets)
      // CAMINHO RELATIVO (Vercel entende automaticamente)
      await axios.post('/api/conversion', {
        email: formData.email,
        eventId: eventId,
        userAgent: userAgent,
        nomeCompleto: formData.nomeCompleto,
        telefone: formData.telefone,
        nomeMarca: formData.nomeMarca,
        temMarca: formData.temMarca,
        newsletter: formData.newsletter
      });

      console.log("✅ Dados enviados para o Backend Vercel!");

      // 4. Sucesso
      toast({
        title: "Solicitação Enviada!",
        description: "Em breve entraremos em contato para agendar sua conversa estratégica.",
      });

      setIsSuccess(true);

      // (Opcional) Redirecionar para thank-you page ou apenas mostrar mensagem de sucesso
      // window.location.href = "/obrigado";

    } catch (error) {
      console.error("Erro no envio:", error);
      toast({
        title: "Atenção",
        description: "Houve uma instabilidade, mas seu download vai começar!",
      });
      // Mesmo com erro, deixa baixar (Fail-safe)
      setIsSuccess(true);
      // window.location.href = ebookUrl; // Removido fallback de download
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="baixar" className="py-24 md:py-32 bg-secondary/30">
      <div className="container-premium">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left Column: Copy */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-left lg:sticky lg:top-32"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold tracking-wider uppercase mb-6">
              Conversão Consultiva
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
              Sua marca já <br className="hidden lg:block" /> evoluiu?
            </h2>

            <div className="space-y-8 text-lg md:text-xl text-muted-foreground leading-relaxed">
              <p>
                Se você sente que sua marca atingiu um novo patamar de maturidade — mas a experiência dentro da loja ainda não reflete essa sofisticação —
                <strong className="text-foreground font-semibold"> chegou a hora de conversar.</strong>
              </p>

              <div className="pl-6 border-l-2 border-accent/30 space-y-4">
                <p>
                  Nossa equipe fará uma análise profunda do seu:
                </p>
                <ul className="space-y-2 text-foreground font-medium">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Posicionamento de Mercado
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Perfil do Público-Alvo
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Objetivos de Branding
                  </li>
                </ul>
              </div>

              <p className="text-base">
                O objetivo é entender se uma <strong>Identidade Olfativa Estratégica</strong> é o próximo passo ideal para o seu negócio agora.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="bg-card border border-border/50 shadow-2xl shadow-primary/5 rounded-3xl p-6 md:p-8 lg:p-10 relative overflow-hidden">

              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

              <div className="mb-8">
                <h3 className="text-2xl font-display font-semibold text-foreground mb-2">Receba nosso contato</h3>
                <p className="text-sm text-muted-foreground">Preencha para receber nosso contato.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="nomeCompleto" className="block text-sm font-medium text-foreground/80 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={handleChange}
                    className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300"
                    placeholder="Seu nome"
                    required
                    disabled={isSuccess}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300"
                    placeholder="exemplo@suamarca.com.br"
                    required
                    disabled={isSuccess}
                  />
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-foreground/80 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300"
                    placeholder="(00) 00000-0000"
                    required
                    disabled={isSuccess}
                    maxLength={15}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="nomeMarca" className="block text-sm font-medium text-foreground/80 mb-2">
                      Nome da Marca
                    </label>
                    <input
                      type="text"
                      id="nomeMarca"
                      value={formData.nomeMarca}
                      onChange={handleChange}
                      className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300"
                      placeholder="Nome da loja"
                      required
                      disabled={isSuccess}
                    />
                  </div>
                  <div>
                    <label htmlFor="temMarca" className="block text-sm font-medium text-foreground/80 mb-2">
                      Tipo de Negócio
                    </label>
                    <select
                      id="temMarca"
                      value={formData.temMarca}
                      onChange={handleChange}
                      className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300"
                      required
                      disabled={isSuccess}
                    >
                      <option value="Confecção Atacado">Confecção Atacado</option>
                      <option value="Confecção Varejo">Confecção Varejo</option>
                      <option value="Loja Boutique de Roupas">Boutique</option>
                      <option value="Loja de departamento">Departamento</option>
                      <option value="Varejo de Moda">Varejo de Moda</option>
                      <option value="Atacado de Moda">Atacado de Moda</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="newsletter"
                    checked={formData.newsletter}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-primary focus:ring-primary rounded border-input"
                    disabled={isSuccess}
                  />
                  <label htmlFor="newsletter" className="text-xs text-muted-foreground cursor-pointer leading-tight">
                    Concordo em receber comunicações sobre marketing sensorial e estratégias de marca.
                  </label>
                </div>

                {isSuccess ? (
                  <Button
                    type="button"
                    variant="hero"
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-emerald-900/10 mt-4"
                    disabled
                  >
                    Solicitação Recebida!
                    <Check className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full py-6 text-base md:text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 mt-4 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Agendar conversa estratégica
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                )}
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};