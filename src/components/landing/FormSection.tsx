import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { submitToAgendor } from "@/services/agendor";
import { v4 as uuidv4 } from 'uuid';
import ReactPixel from 'react-facebook-pixel';
import axios from 'axios';


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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const name = (e.target as HTMLInputElement).name;

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

    const eventId = uuidv4();
    const userAgent = navigator.userAgent;

    // Browser Tracking (Pixel)
    // @ts-ignore
    ReactPixel.track('Lead', {}, { eventID: eventId });


    try {
      await submitToAgendor({
        ...formData,
        temMarca: formData.temMarca
      });

      // Server-Side Tracking (CAPI) via Backend
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/facebook-conversion`, {
          email: formData.email,
          eventId,
          userAgent
        });
        console.log("CAPI event sent");
      } catch (capiError) {
        console.error("Failed to send CAPI event", capiError);
      }

      toast({
        title: "Sucesso!",
        description: "Seu E-book está sendo baixado!",
      });

      setIsSuccess(true);

      // Attempt auto-download
      window.open(ebookUrl, '_blank');

    } catch (error) {
      toast({
        title: "Erro",
        description: "Houve um problema ao enviar seus dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="baixar" className="section-spacing bg-secondary/30">
      <div className="container-premium">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-left md:text-center mb-12">
            <span className="text-sm font-medium text-accent uppercase tracking-widest mb-4 block">
              Download Gratuito
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Baixe o E-book Exclusivo Agora!
            </h2>
            <p className="text-muted-foreground text-lg">
              Em poucos minutos você entende o poder do olfato na fidelização de clientes e aprende como aplicar isso de forma prática na sua marca de roupas.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nomeCompleto" className="block text-sm font-medium text-foreground mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                id="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                className="input-premium"
                placeholder="Queremos personalizar a sua experiência"
                required
                disabled={isSuccess}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="input-premium"
                placeholder="Queremos conhecer melhor a sua marca"
                required
                disabled={isSuccess}
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-foreground mb-2">
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="input-premium"
                placeholder="Digite seu número de telefone"
                required
                disabled={isSuccess}
              />
            </div>

            <div>
              <label htmlFor="nomeMarca" className="block text-sm font-medium text-foreground mb-2">
                Nome da sua marca
              </label>
              <input
                type="text"
                id="nomeMarca"
                value={formData.nomeMarca}
                onChange={handleChange}
                className="input-premium"
                placeholder="Digite o nome da sua marca"
                required
                disabled={isSuccess}
              />
            </div>

            <div>
              <label htmlFor="temMarca" className="block text-sm font-medium text-foreground mb-2">
                Você tem marca de roupas ou confecção?
              </label>
              <select
                id="temMarca"
                value={formData.temMarca}
                onChange={handleChange}
                className="input-premium w-full"
                required
                disabled={isSuccess}
              >
                <option value="Confecção Atacado">Confecção Atacado</option>
                <option value="Confecção Varejo">Confecção Varejo</option>
                <option value="Loja Boutique de Roupas">Loja Boutique de Roupas</option>
                <option value="Loja de departamento">Loja de departamento</option>
                <option value="Varejo de Moda">Varejo de Moda</option>
                <option value="Atacado de Moda">Atacado de Moda</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="w-4 h-4 text-primary focus:ring-primary rounded"
                disabled={isSuccess}
              />
              <label htmlFor="newsletter" className="text-sm text-muted-foreground cursor-pointer">
                Quero receber novidades e conteúdos exclusivos.
              </label>
            </div>

            {isSuccess ? (
              <Button
                type="button"
                variant="hero"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.open(ebookUrl, '_blank')}
              >
                BAIXAR E-BOOK
                <Download className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    BAIXAR AGORA
                    <Download className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
};

