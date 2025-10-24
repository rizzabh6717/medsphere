# MedSphere Connect

A modern healthcare appointment and consultation platform built with React, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Authentication System** - OTP-based login with simulated SMS verification
- 📅 **Appointment Booking** - Book, reschedule, and cancel appointments
- 👨‍⚕️ **Doctor Search** - Find doctors by name or specialization
- 📋 **Medical Records** - View prescriptions and doctor instructions
- 👥 **Family Management** - Add and manage family members
- 🔔 **Notifications** - Real-time appointment and system notifications
- 💾 **LocalStorage Persistence** - All data persists across browser sessions
- 🎨 **Modern UI** - Beautiful gradient design with shadcn/ui components

## Technologies

This project is built with:

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching

## Getting Started

### Prerequisites

- Node.js 16+ and npm installed

### Installation

```bash
# Clone the repository
git clone https://github.com/rizzabh6717/medsphere.git

# Navigate to the project directory
cd medsphere

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/      # Reusable UI components
│   └── ui/         # shadcn/ui components
├── pages/          # Page components
├── lib/            # Utility functions and storage
├── hooks/          # Custom React hooks
├── assets/         # Static assets
└── App.tsx         # Main application component
```

## Authentication

The OTP system is simulated for demo purposes:
- OTPs are logged to the browser console
- 6-digit codes with 5-minute expiry
- Maximum 3 verification attempts

See `OTP_SYSTEM.md` for details.

## Data Storage

All data is stored in browser localStorage:
- User profiles
- Appointments
- Notifications
- Family members

See `STORAGE_IMPLEMENTATION.md` for details.

## License

MIT License - feel free to use this project for your portfolio or learning purposes.
