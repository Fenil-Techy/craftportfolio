import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/workspace',
          '/playground',
          '/admin',
          '/api/',
          '/_next/',
        ],
      },
    ],
    sitemap: 'https://www.craftportfolio.online/sitemap.xml',
    host: 'https://www.craftportfolio.online',
  }
}
