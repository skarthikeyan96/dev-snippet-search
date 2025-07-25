# 🔍 SnippetSearch

A powerful code snippet discovery and management platform that helps developers find, save, and organize code snippets from across the web. Built with Next.js, Algolia, and modern web technologies.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Algolia](https://img.shields.io/badge/Algolia-Search-orange?style=flat-square&logo=algolia)](https://www.algolia.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

## ✨ Features

### 🔍 **Advanced Search**

- **Real-time search** with instant results powered by Algolia InstantSearch.js
- **Smart highlighting** of search terms in titles and content
- **Faceted filtering** by source with real-time counts
- **Pagination** with mobile-optimized controls

### 📚 **Multi-Source Aggregation**

- **Dev.to API** integration (324+ snippets)
- **Hashnode RSS** feeds (32+ snippets)
- **CSS-Tricks** content (10+ snippets)
- **Smashing Magazine** articles (10+ snippets)
- **Web Design Ledger** resources (7+ snippets)
- **UX Movement** insights (5+ snippets)

### 💾 **Bookmark System**

- **Save snippets** to personal collection
- **localStorage persistence** across sessions
- **Modal view** for managing saved snippets
- **Toast notifications** for user feedback

### 🏷️ **Smart Content Processing**

- **HTML entity decoding** for clean content display
- **Tag extraction** and markdown formatting
- **Content cleaning** (removes images, normalizes whitespace)
- **Responsive design** optimized for all devices

### 📱 **Mobile-First Design**

- **Fully responsive** interface
- **Touch-friendly** interactions
- **Optimized layouts** for mobile devices
- **Fast loading** with performance optimizations

## 🚀 Live Demo

**🔗 [Try SnippetSearch Live](https://dev-snippet-search.vercel.app)**

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with SSR support
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives

### Search & Data

- **Algolia InstantSearch.js** - Real-time search UI
- **Algolia Search API** - Powerful search backend
- **Custom scrapers** - Multi-source data aggregation
- **HTML entity decoding** - Content cleaning

### Development & Deployment

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Vercel** - Deployment platform
- **Git** - Version control

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Algolia account (for search functionality)

### 1. Clone the Repository

```bash
git clone https://github.com/skarthikeyan96/dev-snippet-search.git
cd dev-snippet-search
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Algolia Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=your_index_name

# Optional: Algolia Admin API Key (for data upload)
ALGOLIA_ADMIN_API_KEY=your_algolia_admin_api_key
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Configuration

### Algolia Setup

1. **Create Algolia Account**

   - Sign up at [algolia.com](https://www.algolia.com/)
   - Create a new application

2. **Configure Search Index**

   - Create an index named `snippets` (or your preferred name)
   - Configure searchable attributes: `title`, `snippet`, `tags`, `source`
   - Set up faceting for `source` attribute

3. **Get API Keys**
   - **Search-Only API Key**: For frontend search functionality
   - **Admin API Key**: For uploading data to Algolia (keep secure)

### Data Upload

Use the provided scripts to upload data to Algolia:

```bash
# Upload scraped snippets to Algolia
node scripts/upload-to-algolia.mjs

# Run enhanced scraper to collect data
node scripts/enhanced-scraper.mjs
```

## 📁 Project Structure

```
dev-snippet-search/
├── public/                 # Static assets
├── scripts/               # Data scraping and upload scripts
│   ├── dev-scraper.mjs    # Dev.to API scraper
│   ├── enhanced-scraper.mjs # Multi-source scraper
│   └── upload-to-algolia.mjs # Algolia upload script
├── src/
│   ├── components/        # React components
│   │   └── ui/           # UI component library
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Next.js pages
│   └── styles/           # Global styles
├── .env.example          # Environment variables template
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
└── tailwind.config.ts    # Tailwind CSS configuration
```

## 🎯 Usage

### Search Interface

1. **Navigate** to the search page
2. **Type** your search query in the search bar
3. **Filter** results by source using the checkboxes
4. **Browse** through paginated results
5. **Bookmark** interesting snippets for later

### Bookmark Management

1. **Click** the bookmark icon on any snippet
2. **View** saved snippets via the "X snippets saved" link
3. **Remove** snippets from your collection as needed
4. **Access** your collection across browser sessions

### Mobile Experience

- **Responsive design** adapts to all screen sizes
- **Touch-friendly** buttons and interactions
- **Optimized** pagination for mobile devices
- **Fast loading** with performance optimizations

## 🔄 Data Sources

The application aggregates code snippets from multiple sources:

| Source            | Count | Type | Status    |
| ----------------- | ----- | ---- | --------- |
| Dev.to            | 324+  | API  | ✅ Active |
| Hashnode          | 32+   | RSS  | ✅ Active |
| CSS-Tricks        | 10+   | RSS  | ✅ Active |
| Smashing Magazine | 10+   | RSS  | ✅ Active |
| Web Design Ledger | 7+    | RSS  | ✅ Active |
| UX Movement       | 5+    | RSS  | ✅ Active |

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**

   - Push code to GitHub
   - Connect repository to Vercel

2. **Configure Environment Variables**

   - Add Algolia credentials in Vercel dashboard
   - Set production environment variables

3. **Deploy**
   - Vercel automatically deploys on push to main branch
   - Custom domain configuration available

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify** - Static site generation
- **AWS Amplify** - Full-stack deployment
- **Railway** - Container deployment
- **Docker** - Containerized deployment

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Data Management
npm run scrape       # Run data scraper
npm run upload       # Upload data to Algolia
```

### Code Quality

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Component-based** architecture
- **Custom hooks** for reusable logic

## 📊 Performance

### Optimizations

- **Bundle splitting** for faster loading
- **Code splitting** by routes
- **Image optimization** with Next.js
- **Tree shaking** for unused code removal
- **CDN caching** for static assets

### Metrics

- **Bundle Size**: 224 kB total (optimized)
- **Search Performance**: Sub-second results
- **Mobile Score**: 100% responsive
- **Lighthouse Score**: 95+ performance

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test on multiple devices
- Ensure accessibility compliance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Algolia** for powerful search capabilities
- **Next.js** team for the amazing framework
- **Tailwind CSS** for utility-first styling
- **Dev.to** and other sources for content
- **Open source community** for inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/skarthikeyan96/dev-snippet-search/issues)
- **Discussions**: [GitHub Discussions](https://github.com/skarthikeyan96/dev-snippet-search/discussions)
- **Email**: [Contact via GitHub](https://github.com/skarthikeyan96)

---

**Built with ❤️ using Next.js, Algolia, and modern web technologies.**

⭐ **Star this repository if you find it helpful!**
