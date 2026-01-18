# Multi-Brand Next.js Applications

This repository contains standalone Next.js applications for multiple brands, organized in a brand-based folder structure.

## Project Structure

```
brand/
├── proxe/
│   ├── build/                          # Complete PROXe Next.js app
│   │   ├── .next/                     # Build output
│   │   ├── public/                    # Public assets
│   │   ├── src/                       # Source code
│   │   ├── node_modules/              # Dependencies
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   ├── .env.local
│   │   ├── .gitignore
│   │   └── README.md
│   │
│   ├── supabase/                       # Database files
│   │   ├── migrations/
│   │   │   ├── 001_core_schema.sql
│   │   │   └── 002_rls_policies.sql
│   │   └── proxe-complete-schema.sql
│   │
│   └── docs/                           # Documentation
│       ├── BUILD.md
│       ├── API.md
│       ├── DEPLOYMENT.md
│       └── README.md
│
└── windchasers/
    ├── build/                          # Complete Windchasers Next.js app
    │   ├── .next/
    │   ├── public/
    │   ├── src/
    │   ├── package.json
    │   └── ...
    │
    ├── supabase/                       # Database files
    │   ├── migrations/
    │   └── windchasers-schema.sql
    │
    └── docs/                           # Documentation
        └── README.md
```

## Quick Start

Each brand application is completely standalone. To work with a specific brand:

### PROXe

```bash
cd brand/proxe/build
npm install
npm run dev
```

### Windchasers

```bash
cd brand/windchasers/build
npm install
npm run dev
```

## Brand Applications

### PROXe
- **Location**: `brand/proxe/build/`
- **Port**: Check `package.json` or `.env.local`
- **Documentation**: `brand/proxe/docs/`
- **Database**: `brand/proxe/supabase/`

### Windchasers
- **Location**: `brand/windchasers/build/`
- **Port**: Check `package.json` or `.env.local`
- **Documentation**: `brand/windchasers/docs/`
- **Database**: `brand/windchasers/supabase/`

## Features

- **Standalone Applications**: Each brand has its own complete Next.js app
- **Independent Dependencies**: Each app manages its own `node_modules` and `package.json`
- **Brand-Specific Assets**: Public assets and branding are isolated per brand
- **Separate Databases**: Each brand has its own Supabase schema and migrations
- **Clean Separation**: No shared code between brands

## Development

1. Navigate to the brand's `build/` directory
2. Install dependencies: `npm install`
3. Set up environment variables (see brand-specific docs)
4. Run development server: `npm run dev`

## Deployment

Each brand application can be deployed independently:
- Deploy `brand/proxe/build/` as a separate Next.js application
- Deploy `brand/windchasers/build/` as a separate Next.js application

For Vercel deployment, point to the respective `build/` directory as the root.

## Documentation

- General project documentation: `docs/`
- Brand-specific documentation: `brand/[brand]/docs/`
- Database schemas: `brand/[brand]/supabase/`

## License

MIT
