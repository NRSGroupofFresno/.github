# Text Snake - Interactive Text on Path

An interactive text-on-path application that follows your cursor like a snake game. The text dynamically trails behind your mouse movement with smooth path interpolation.

## Features

- **Canvas-based rendering** with proper device pixel ratio for crisp text
- **Consistent character spacing** regardless of path length
- **Dynamic path management** that maintains a fixed length trail
- **Touch support** for mobile devices
- **Customizable controls**:
  - Text input
  - Font size slider (24-150px)
  - Letter spacing control (0.3-1.5)
  - Reset button

## Color Scheme

- Background: `#C4BAFF` (light purple)
- Active area: `#877A7A` (warm gray)
- Text color: `#FFC9C1` (soft peach/pink)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Deploy!

Or use Wrangler CLI:

```bash
npx wrangler pages deploy dist
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Canvas API

## License

MIT
