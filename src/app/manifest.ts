import type { MetadataRoute } from 'next'
import { NOME_BARBEARIA } from '../lib/constants'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: NOME_BARBEARIA,
    short_name: 'Jota Pê',
    description: 'Agendamento, assinaturas e gestão da barbearia.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0b0b',
    theme_color: '#4756e6',
    lang: 'pt-BR',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
