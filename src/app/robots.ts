import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/planos',
      disallow: ['/admin', '/barbeiro', '/cliente', '/api'],
    },
    sitemap: 'https://nexobarber.nexosystem.online/sitemap.xml',
  }
}
