# Nuxt Development Server Setup Guide

This guide provides comprehensive instructions for setting up and running a Nuxt development server for NRSGroupofFresno.com.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Starting the Development Server](#starting-the-development-server)
- [Development Server Configuration](#development-server-configuration)
- [Environment Variables](#environment-variables)
- [Hot Module Replacement (HMR)](#hot-module-replacement-hmr)
- [Network Access](#network-access)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Next Steps](#next-steps)

---

## Overview

Nuxt is a powerful framework built on Vue.js that provides an intuitive and performant development experience. The development server includes features like hot module replacement (HMR), automatic routing, and optimized build tooling.

### Key Features

- **Hot Module Replacement**: Instant updates without full page reload
- **File-based Routing**: Automatic route generation from file structure
- **Server-Side Rendering (SSR)**: Built-in SSR support
- **TypeScript Support**: First-class TypeScript integration
- **Auto-imports**: Components, composables, and utilities automatically imported
- **Development Tools**: Built-in DevTools for debugging

---

## Prerequisites

Before setting up the Nuxt development server, ensure you have the following installed:

### Node.js

Nuxt requires Node.js version 18.0.0 or higher.

```bash
# Check your Node.js version
node --version

# Should output v18.0.0 or higher
```

### Package Manager

Choose one of the following package managers:

| Package Manager | Minimum Version | Installation |
|----------------|-----------------|--------------|
| **npm** | 9.0.0+ | Included with Node.js |
| **yarn** | 1.22.0+ | `npm install -g yarn` |
| **pnpm** | 8.0.0+ | `npm install -g pnpm` |
| **bun** | 1.0.0+ | `curl -fsSL https://bun.sh/install \| bash` |
| **deno** | 1.40.0+ | `curl -fsSL https://deno.land/install.sh \| sh` |

---

## Project Setup

### Creating a New Nuxt Project

If you haven't created a Nuxt project yet:

```bash
# Using npx
npx nuxi@latest init nrsgroup-website

# Using yarn
yarn dlx nuxi@latest init nrsgroup-website

# Using pnpm
pnpm dlx nuxi@latest init nrsgroup-website

# Using bun
bunx nuxi@latest init nrsgroup-website
```

### Installing Dependencies

After creating the project, install dependencies:

```bash
# Navigate to project directory
cd nrsgroup-website

# Install with your preferred package manager
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

---

## Starting the Development Server

### Basic Commands

Start the development server using one of the following commands:

#### npm
```bash
npm run dev
```

#### yarn
```bash
yarn dev
```

#### pnpm
```bash
pnpm dev
```

#### bun
```bash
bun run dev
```

#### deno
```bash
deno task dev
```

### Opening Browser Automatically

Use the `-o` or `--open` flag to automatically open the browser:

```bash
npm run dev -- -o
# or
yarn dev -o
# or
pnpm dev -o
# or
bun run dev -o
```

### Default Server Location

The development server will start at:
- **URL**: `http://localhost:3000`
- **Port**: 3000 (configurable)

---

## Development Server Configuration

### Custom Port

Change the default port using command-line options or configuration:

#### Command Line
```bash
npm run dev -- --port 3001
```

#### nuxt.config.ts
```typescript
export default defineNuxtConfig({
  devServer: {
    port: 3001
  }
})
```

### Custom Host

Expose the server to your local network:

```bash
npm run dev -- --host 0.0.0.0
```

Or configure in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  devServer: {
    host: '0.0.0.0',
    port: 3000
  }
})
```

### HTTPS Development Server

Enable HTTPS for local development:

```typescript
export default defineNuxtConfig({
  devServer: {
    https: {
      key: './server.key',
      cert: './server.crt'
    }
  }
})
```

### Complete DevServer Configuration

```typescript
export default defineNuxtConfig({
  devServer: {
    port: 3000,
    host: 'localhost',
    https: false,
    // Open browser automatically
    open: true,
    // Configure middleware
    middleware: []
  }
})
```

---

## Environment Variables

### Development Environment Variables

Create a `.env` file in your project root:

```env
# .env
NUXT_PUBLIC_API_BASE=https://api.nrsgroupoffresno.com
NUXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/nrsgroup
API_SECRET=your-secret-key
```

### Environment Variable Types

Nuxt supports two types of environment variables:

#### Runtime Public Variables
Exposed to the client (prefix with `NUXT_PUBLIC_`):

```env
NUXT_PUBLIC_API_BASE=https://api.example.com
```

Access in code:
```typescript
const config = useRuntimeConfig()
console.log(config.public.apiBase)
```

#### Server-Only Variables
Available only on the server (no prefix):

```env
DATABASE_URL=postgresql://localhost:5432/db
API_SECRET=secret-key
```

Access in server routes:
```typescript
const config = useRuntimeConfig()
console.log(config.databaseUrl)
console.log(config.apiSecret)
```

### Configuration File

Define runtime config in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-only keys
    apiSecret: '',
    databaseUrl: '',

    // Public keys exposed to client
    public: {
      apiBase: '/api',
      siteUrl: 'http://localhost:3000'
    }
  }
})
```

---

## Hot Module Replacement (HMR)

### What is HMR?

Hot Module Replacement allows you to see changes instantly without losing application state or requiring a full page reload.

### Supported Files

HMR automatically works with:
- Vue components (`.vue`)
- JavaScript/TypeScript files (`.js`, `.ts`)
- CSS/SCSS files (`.css`, `.scss`)
- Nuxt pages and layouts
- Server API routes (with auto-restart)

### HMR Configuration

```typescript
export default defineNuxtConfig({
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 24678
      }
    }
  }
})
```

### When HMR Doesn't Work

Some changes require a full server restart:
- Changes to `nuxt.config.ts`
- Adding new plugins
- Modifying server middleware
- Changing build modules

Restart the server with `Ctrl+C` and `npm run dev`.

---

## Network Access

### Local Network Access

To access the dev server from other devices on your network:

1. **Start with host binding:**
   ```bash
   npm run dev -- --host 0.0.0.0
   ```

2. **Find your local IP:**
   ```bash
   # Linux/Mac
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

3. **Access from other devices:**
   ```
   http://192.168.x.x:3000
   ```

### Mobile Device Testing

For testing on mobile devices:

```bash
npm run dev -- --host 0.0.0.0
```

Then access via your local IP from mobile browser:
```
http://192.168.1.100:3000
```

### Network Configuration

```typescript
export default defineNuxtConfig({
  devServer: {
    host: '0.0.0.0',  // Allow external access
    port: 3000
  }
})
```

---

## Performance Optimization

### Development Build Performance

#### Enable Build Caching

```typescript
export default defineNuxtConfig({
  vite: {
    build: {
      // Enable caching for faster rebuilds
      cache: true
    }
  }
})
```

#### Optimize Dependencies

Pre-bundle dependencies for faster dev server startup:

```typescript
export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      include: ['lodash', 'axios']
    }
  }
})
```

#### Reduce Payload Size

```typescript
export default defineNuxtConfig({
  experimental: {
    payloadExtraction: true
  }
})
```

### Memory Management

For large projects, increase Node.js memory:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' nuxt dev"
  }
}
```

### Faster Startup Times

```typescript
export default defineNuxtConfig({
  // Disable features not needed in development
  devtools: { enabled: false },

  // Reduce initial build time
  vite: {
    build: {
      sourcemap: false
    }
  }
})
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

**Problem:** Port 3000 is already occupied.

**Solution:**
```bash
# Use a different port
npm run dev -- --port 3001

# Or kill the process using port 3000
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Module Not Found Errors

**Problem:** Import errors or missing modules.

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Nuxt cache
rm -rf .nuxt
npm run dev
```

#### Hot Module Replacement Not Working

**Problem:** Changes not reflecting in browser.

**Solution:**
```bash
# Clear .nuxt cache
rm -rf .nuxt

# Restart dev server
npm run dev
```

#### Slow Performance

**Problem:** Dev server is slow or unresponsive.

**Solution:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      include: ['your-heavy-dependencies']
    }
  }
})
```

#### Network Access Issues

**Problem:** Cannot access dev server from other devices.

**Solution:**
```bash
# Check firewall settings
# Linux
sudo ufw allow 3000

# Mac
# System Preferences > Security & Privacy > Firewall > Firewall Options

# Windows
# Windows Defender Firewall > Advanced Settings > Inbound Rules
```

---

## Best Practices

### Development Workflow

1. **Use `.env` files**: Keep sensitive data out of version control
   ```bash
   # .gitignore
   .env
   .env.local
   ```

2. **Enable DevTools**: Use Nuxt DevTools for debugging
   ```typescript
   export default defineNuxtConfig({
     devtools: { enabled: true }
   })
   ```

3. **TypeScript strict mode**: Catch errors early
   ```typescript
   export default defineNuxtConfig({
     typescript: {
       strict: true,
       typeCheck: true
     }
   })
   ```

4. **Auto-imports organization**: Keep track of what's auto-imported
   ```typescript
   export default defineNuxtConfig({
     imports: {
       // Disable auto-imports if you prefer explicit imports
       autoImport: true
     }
   })
   ```

### Code Organization

```
nrsgroup-website/
├── .nuxt/              # Build output (auto-generated)
├── assets/             # Uncompiled assets (CSS, images)
├── components/         # Vue components
├── composables/        # Composable functions
├── layouts/            # Layout templates
├── middleware/         # Route middleware
├── pages/              # Application pages (auto-routed)
├── plugins/            # Nuxt plugins
├── public/             # Static files (served as-is)
├── server/             # Server-side code
│   ├── api/           # API routes
│   └── middleware/    # Server middleware
├── .env                # Environment variables (not in git)
├── app.vue             # Main application component
├── nuxt.config.ts      # Nuxt configuration
└── package.json        # Dependencies
```

### Git Configuration

```bash
# .gitignore
.nuxt
.output
.env
.env.*
!.env.example
node_modules
.DS_Store
dist
```

### Environment Template

Create `.env.example` for team reference:

```env
# .env.example
NUXT_PUBLIC_API_BASE=
NUXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=
API_SECRET=
```

---

## Next Steps

### Learning Resources

- **Nuxt Documentation**: [https://nuxt.com/docs](https://nuxt.com/docs)
- **Nuxt Concepts**: [https://nuxt.com/docs/guide/concepts](https://nuxt.com/docs/guide/concepts)
- **Vue.js Guide**: [https://vuejs.org/guide](https://vuejs.org/guide)

### Recommended Reading

1. **Configuration**: Learn about `nuxt.config.ts` options
2. **Routing**: Understand file-based routing system
3. **Data Fetching**: Master `useFetch` and `useAsyncData`
4. **State Management**: Explore `useState` and Pinia
5. **SEO**: Configure meta tags and social sharing

### Building for Production

When ready to deploy:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Generate static site (if using SSG)
npm run generate
```

### CI/CD Integration

For automated deployments, see:
- [GitHub Actions Caching Guide](./github-actions-caching.md)
- Nuxt deployment documentation for your hosting provider

---

## Additional Resources

- [Nuxt Official Documentation](https://nuxt.com)
- [Nuxt GitHub Repository](https://github.com/nuxt/nuxt)
- [Nuxt Community Discord](https://discord.com/invite/nuxt)
- [Vue.js Documentation](https://vuejs.org)
- [Vite Documentation](https://vitejs.dev)

---

*Last updated: 2025-11-30*
*For NRSGroupofFresno.com development team*
