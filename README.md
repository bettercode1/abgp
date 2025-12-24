# Akhil Bhartiya Grahak Panchayat (ABGP) Portal

A modern, government-style, multilingual React + Material UI homepage for Akhil Bhartiya Grahak Panchayat (ABGP) that reflects Indian Government website UX patterns and GIGW principles.

## Features

- **Modern React + TypeScript** - Built with React 18, TypeScript, and Vite
- **Material UI v5** - Comprehensive UI component library
- **Multilingual Support** - English and Hindi (हिंदी) using i18next
- **Multiple Theme Variants** - 5 different themes:
  - Classic Tricolor Theme (Government-style with Indian tricolor inspiration)
  - Modern Minimal Theme
  - High-Contrast Accessibility Theme
  - Traditional Maroon-Gold Theme
  - Dark Mode Theme
- **Accessibility Features**:
  - WCAG-compliant color contrast
  - Keyboard navigation support
  - Skip-to-content links
  - Font size controls (A-, A, A+)
  - Contrast mode toggle
  - ARIA labels and semantic HTML
- **Responsive Design** - Mobile-first approach with responsive breakpoints
- **Government-Style UX** - Follows Indian Government website patterns

## Project Structure

```
src/
├── components/
│   ├── sections/          # Page sections (Hero, Jago, Activities, etc.)
│   ├── ThemeSwitcher.tsx
│   ├── LanguageSwitcher.tsx
│   ├── GlobalLoader.tsx
│   ├── FontSizeControls.tsx
│   └── ContrastToggle.tsx
├── layouts/
│   └── MainLayout.tsx     # Main layout with header, nav, footer
├── pages/
│   └── HomePage.tsx       # Homepage composition
├── theme/
│   └── themes.ts          # Theme definitions
├── i18n/
│   └── index.ts           # i18next configuration and translations
├── App.tsx                # Main app component
└── main.tsx               # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Key Sections

### Hero Section
- ABGP mission and identity
- Founder information
- Timeline highlights
- Call-to-action buttons

### Jago Grahak Jago Section
- Awareness tiles grid
- Consumer education modules
- Campaigns and programs

### Activities Section
- Core activity types (Sanghatan, Jaagaran, Aandolan, Margadarshan Seva)
- Key sectors (Annam, Vastra, Aavas, Aarogya, Shikshana, Vyavahaar)

### About & History Section
- Organization overview
- Historical timeline
- Brand protection information

### Membership Section
- Membership benefits
- Constitution preview
- Registration information

### Media Section
- News, Events, Blogs, Videos tabs
- Latest updates from ABGP

### Contact Section
- Office addresses (Delhi and Pune)
- Key contact information
- Contact form

## Customization

### Themes
Themes can be customized in `src/theme/themes.ts`. User theme preferences are saved in localStorage.

### Translations
Translations for English and Hindi are in `src/i18n/index.ts`. Add new keys following the existing pattern.

### Routes
Currently, only the homepage route (`/`) is implemented. Future routes can be added in `src/App.tsx`:
- `/about` - About ABGP page
- `/activities` - Activities page
- `/membership` - Membership and Constitution page
- `/media` - Media page
- `/blogs` - Blogs page
- `/contact` - Contact page

## Accessibility

The application follows WCAG 2.1 guidelines:
- High contrast color schemes
- Keyboard navigation
- Screen reader support
- Focus indicators
- Semantic HTML structure
- ARIA labels

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is created for Akhil Bhartiya Grahak Panchayat (ABGP).

## Notes

- The Razorpay membership/donation link is integrated: `https://pages.razorpay.com/ABGPmembership`
- Contact information matches the actual ABGP contact details
- All content is based on the ABGP website structure and information

