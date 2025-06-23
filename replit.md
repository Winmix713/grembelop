# replit.md

## Overview

This is a full-stack web application built with React and Express that provides advanced Figma-to-code generation capabilities. The application allows users to upload Figma design files and convert them into production-ready code for multiple frameworks including React, Vue, and HTML with various styling options.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool and development server
- **shadcn/ui** component library built on top of Radix UI primitives
- **Tailwind CSS** for styling with custom design system variables
- **TanStack Query (React Query)** for server state management
- **Wouter** for client-side routing
- **React Hook Form** with Zod validation for form handling

### Backend Architecture
- **Express.js** with TypeScript running on Node.js
- **ESM modules** throughout the application
- **Custom storage abstraction** with in-memory implementation (ready for database integration)
- **Drizzle ORM** configured for PostgreSQL integration
- **RESTful API** design with proper error handling and validation

### Key Components

1. **Code Generation Engine**: Advanced system that analyzes Figma designs and generates corresponding code
   - Multi-framework support (React, Vue, HTML)
   - Multiple styling approaches (Tailwind, CSS Modules, Styled Components, Plain CSS)
   - Accessibility analysis with WCAG compliance checking
   - Responsive design generation with custom breakpoints

2. **Figma Integration**: Handles Figma API data processing and validation
   - Figma design file parsing and validation
   - Component and node extraction
   - Design token analysis and conversion

3. **UI Components**: Comprehensive set of reusable components
   - Form components for generation options
   - Code preview with syntax highlighting
   - File upload with drag-and-drop support
   - Accessibility reporting dashboard

## Data Flow

1. User uploads Figma design data through the web interface
2. Frontend validates and sends data to `/api/generate` endpoint
3. Backend processes the Figma data using the AdvancedCodeGenerator
4. Generated components are analyzed for accessibility and responsiveness
5. Results are stored in the application's storage system
6. Frontend displays the generated code with preview and download options

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database driver for Neon PostgreSQL
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI primitives for accessibility
- **zod**: Runtime type validation and schema validation

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

The application is configured for deployment on Replit's autoscale infrastructure:

- **Development**: Runs with `npm run dev` using tsx for hot reloading
- **Production Build**: Uses Vite for frontend bundling and esbuild for backend
- **Runtime**: Node.js with Express serving both API and static files
- **Database**: Configured for PostgreSQL via Drizzle ORM
- **Port Configuration**: Runs on port 5000 internally, exposed on port 80

The build process creates a `dist` directory containing the production-ready application with the frontend assets in `dist/public` and the server bundle as `dist/index.js`.

## Changelog

Changelog:
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.