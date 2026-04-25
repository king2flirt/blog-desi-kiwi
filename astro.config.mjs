import { defineConfig, envField } from 'astro/config'
import { fileURLToPath } from 'url'
import cloudflare from '@astrojs/cloudflare'
import compress from 'astro-compress'
import icon from 'astro-icon'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { enhanceConfigForWorkspace } from './scripts/workspace-config.js'

// Vite configuration with path aliases and SCSS settings
const viteConfig = {
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [fileURLToPath(new URL('./src/assets', import.meta.url))],
        // Astro 6/Vite 7 uses the modern sass API by default
        api: 'modern-compiler', 
        logger: {
          warn: () => {},
        },
      },
    },
  },
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@public': fileURLToPath(new URL('./public', import.meta.url)),
      '@post-images': fileURLToPath(new URL('./public/posts', import.meta.url)),
      '@project-images': fileURLToPath(new URL('./public/projects', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@theme-config': fileURLToPath(new URL('./theme.config.ts', import.meta.url)),
    },
  },
}

export default defineConfig({
  // Top-level Astro 6 Settings
  site: 'https://hi.desi.kiwi',
  output: 'server', 
  
  adapter: cloudflare({
    // Forces the build to ignore local wrangler files that cause the "Chicken and Egg" crash
    configPath: null, 
    // Uses Cloudflare's workerd runtime for local dev/prerendering
    prerenderEnvironment: 'workerd',
    // Ensures the platform proxy is enabled for local development
    platformProxy: {
      enabled: true,
    },
  }),
  
  // HTML Compression
  compressHTML: true,
  
  integrations: [
    icon(), 
    mdx(), 
    sitemap(),
    // Move compress to the end of the list for best results
    compress({
      CSS: true,
      HTML: {
        "removeAttributeQuotes": false,
      },
      Image: false, 
    }),
  ],

  // Apply your custom workspace enhancements to the vite config
  vite: enhanceConfigForWorkspace(viteConfig),

  env: {
    schema: {
      BLOG_API_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
        default: 'https://jsonplaceholder.typicode.com/posts',
      }),
    },
  },
})