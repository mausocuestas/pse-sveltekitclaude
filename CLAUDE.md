# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server (optionally add `-- --open` to auto-open browser)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run check` - TypeScript and Svelte type checking
- `npm run check:watch` - Type checking in watch mode  
- `npm run lint` - ESLint code linting

## Architecture Overview

This is a **SvelteKit** application with **TypeScript** support, using modern Svelte 5 features including the new `$props()` API.

### Key Stack Components
- **Frontend**: SvelteKit with Svelte 5, TypeScript
- **Styling**: TailwindCSS 4.0 with custom CSS variables for theming
- **UI Components**: shadcn-svelte component library with bits-ui primitives
- **Forms**: Superforms with Formsnap and Zod validation
- **Database**: PostgreSQL with `postgres` client library
- **Build Tool**: Vite with SvelteKit plugin

### Project Structure
```
src/
├── routes/             # SvelteKit file-based routing
├── lib/
│   ├── components/ui/  # Reusable UI components (shadcn-svelte)
│   ├── assets/         # Static assets
│   └── utils.ts        # Utility functions
├── app.html           # HTML template
├── app.css            # Global styles with CSS variables
└── app.d.ts           # TypeScript app definitions
```

### UI Component System
- Uses **shadcn-svelte** with extensive pre-built components (Button, Dialog, Select, Form, Table, etc.)
- Components follow a consistent pattern with TypeScript definitions
- Path aliases configured: `$lib/components/ui` maps to UI components
- Custom CSS variables for theming support (light/dark mode ready)

### Styling Architecture
- **TailwindCSS 4.0** with modern features
- Custom CSS variables defined in `app.css` for consistent theming
- Dark mode support via `.dark` class
- Uses OKLCH color space for better color consistency

### Key Configuration Files
- `components.json` - shadcn-svelte configuration with path aliases
- `svelte.config.js` - SvelteKit configuration with adapter-auto
- `vite.config.ts` - Vite configuration with TailwindCSS plugin
- TypeScript strict mode enabled with modern module resolution

### Database Integration
- PostgreSQL client (`postgres` package) included
- Zod schema validation available for type-safe data handling
- Ready for form processing with Superforms integration

## Development Notes

### Component Development
- Components use Svelte 5 syntax with `$props()` runes
- UI components follow shadcn-svelte patterns for consistency
- TypeScript is strictly enforced - run `npm run check` before committing

### Path Aliases (configured in components.json)
- `$lib` → `src/lib`
- `$lib/components/ui` → UI components
- `$lib/utils` → Utility functions

### Styling Guidelines
- Use TailwindCSS classes for styling
- Leverage CSS variables for theme consistency
- Component variants handled via `tailwind-variants` library