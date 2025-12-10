import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import { useEffect } from "react";
import ReactPixel from "react-facebook-pixel";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // COLOQUE O ID DIRETO AQUI (Hardcode)
    // Isso elimina qualquer dúvida se a variável está funcionando ou não
    const pixelId = '695180576776458'; 
    
    ReactPixel.init(pixelId);
    ReactPixel.pageView();
    
    // Log para você ver no console do navegador (F12) se funcionou
    console.log("Pixel iniciado manualmente com ID:", pixelId);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
