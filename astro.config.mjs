import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  server: { host: '127.0.0.1', port: 4326 },
  site: 'https://vendorcheckuk.co.uk',
  integrations: [sitemap()],
});
