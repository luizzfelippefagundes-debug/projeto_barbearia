import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'jp-barbeiro.vercel.app' }],
        destination: 'https://nexobarber.nexosystem.online/:path*',
        permanent: true,
      },
    ]
  },
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
