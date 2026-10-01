import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Padrão do Next.js é 1MB — baixo demais pra foto de celular (atendimento,
      // avatar de barbeiro). Sem isso, o upload falha com uma exceção não
      // tratada e derruba a tela inteira em produção.
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
