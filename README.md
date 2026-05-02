#  EGA Roleplay - GTA V FiveM Roleplay Server

A modern, responsive landing page for EGA Roleplay, a GTA V FiveM roleplay server. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- 🎮 **Modern Design**: Clean, professional design with GTA V/FiveM theme
- 📱 **Responsive**: Fully responsive design that works on all devices
- ⚡ **Fast**: Built with Next.js 14 for optimal performance
- 🎨 **Beautiful UI**: Uses shadcn/ui components with Tailwind CSS
- 🔧 **TypeScript**: Full TypeScript support for better development experience

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Mono

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ega-roleplay/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles with shadcn/ui theme
│   │   ├── layout.tsx       # Root layout with metadata
│   │   └── page.tsx         # Main landing page
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   └── lib/
│       └── utils.ts         # Utility functions
├── components.json          # shadcn/ui configuration
└── package.json
```

## Customization

### Colors

The theme uses a dark slate background with green accents to match the GTA V/FiveM aesthetic. You can customize colors in `src/app/globals.css`.

### Content

Update the content in `src/app/page.tsx` to match your server's information:

- Server name and description
- Features and benefits
- Server statistics
- Social media links
- Contact information

### Components

Add more shadcn/ui components as needed:

```bash
npx shadcn@latest add [component-name]
```

## Deployment

This project can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

## License

© 2026 EGA Roleplay. All rights reserved.

---

Built with ❤️ for the GTA V FiveM roleplay community.
