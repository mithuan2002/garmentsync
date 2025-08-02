# GarmentSync Manufacturing Communication Platform

## Overview

GarmentSync is a comprehensive manufacturing communication platform designed to streamline workflows between manufacturers and buyers in the garment industry. The platform features a modern 3-tab navigation system providing complete order management, notification handling, and media storage capabilities.

## Current Implementation Status (August 2025)

The application has been successfully restructured into a comprehensive 3-tab platform with the following features:

### Tab 1: Orders Management
- ✓ Clean order creation workflow with unique order IDs and shareable public links
- ✓ Comprehensive stakeholder management system with bulk email invitation functionality
- ✓ Role-based permissions (admin, factory_owner, factory_manager, buyer, buyer_employee)
- ✓ Order search and filtering capabilities
- ✓ Real-time order status tracking with visual status indicators
- ✓ Integrated stakeholder collaboration on each order

### Tab 2: Notifications
- ✓ Push notification details and email management
- ✓ In-app email reply functionality with rich HTML formatting
- ✓ Notification categorization (email, system, order_update)
- ✓ Read/unread status tracking
- ✓ Direct reply interface for seamless communication

### Tab 3: Media Management
- ✓ Product-related media storage and access
- ✓ File categorization (product_photos, technical_drawings, specifications, samples)
- ✓ Multi-file upload with drag-and-drop support
- ✓ Order-based media organization
- ✓ File preview and download capabilities
- ✓ Advanced search and filtering by category and order

The platform now provides a complete manufacturing communication ecosystem with stakeholder management, notification handling, and media organization all integrated into a unified interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built as a Single Page Application (SPA) using React with TypeScript, providing a responsive and interactive user experience. The application uses Wouter for client-side routing, offering a lightweight alternative to React Router. The UI leverages shadcn/ui components built on top of Radix UI primitives, ensuring accessibility and consistent design patterns. Tailwind CSS handles styling with a design system that supports both light and dark themes through CSS variables.

State management is handled through TanStack Query (React Query) for server state management, which provides caching, background updates, and optimistic updates. The application uses a centralized query client configuration that handles authentication, error handling, and request/response formatting.

### Backend Architecture
The server-side architecture follows a REST API pattern built on Express.js with TypeScript. The application uses a layered architecture with clear separation between routes, business logic, and data access. The storage layer implements an interface-based design pattern, currently using an in-memory storage implementation for development with demo data seeding.

The server implements custom middleware for request logging, error handling, and development-specific features. In development mode, Vite's middleware is integrated for hot module replacement and asset serving, while production builds serve static assets directly.

### Data Storage Solutions
The application is designed with PostgreSQL as the primary database, using Drizzle ORM for database operations and schema management. The schema defines five main entities: users, projects, updates, comments, and files, with appropriate relationships and constraints. Database migrations are handled through Drizzle Kit, providing version control for schema changes.

Currently, the application includes a memory-based storage implementation for development and testing purposes, which can be easily replaced with the PostgreSQL implementation through the storage interface pattern.

### Authentication and Authorization
The application implements a role-based access control system with two primary user types: manufacturers and buyers. Authentication is currently implemented as a mock system returning a default manufacturer user for development purposes. The system is designed to support session-based authentication with secure cookie handling.

User roles determine access permissions and available features within the application, with manufacturers having different capabilities than buyers in terms of project management and status updates.

### Component Architecture
The frontend follows a modular component architecture with clear separation of concerns. Components are organized into feature-based directories (dashboard, project, layout, ui) with shared UI components in a dedicated directory. The application uses compound component patterns for complex UI elements and implements proper prop typing with TypeScript.

The UI system is built on a design token approach using CSS custom properties, enabling consistent theming and easy customization. Components follow accessibility best practices through the use of Radix UI primitives.

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive collection of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Icon library providing consistent iconography
- **shadcn/ui**: Pre-built component library extending Radix UI with styled components

### State Management and Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition

### Database and ORM
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Neon Database**: Serverless PostgreSQL database provider
- **Drizzle Kit**: Database migration and schema management tools

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **PostCSS**: CSS transformation and optimization
- **ESBuild**: Fast JavaScript bundler for production builds

### Utilities and Enhancements
- **date-fns**: Date manipulation and formatting library
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Conditional className utility for dynamic styling
- **wouter**: Lightweight client-side routing library