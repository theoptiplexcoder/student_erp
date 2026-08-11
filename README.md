# Student ERP

Enterprise Resource Planning System for Educational Institutions

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** NestJS, Prisma ORM
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Monorepo:** Nx, pnpm workspaces
- **Tooling:** ESLint, Prettier, Husky, Commitlint, lint-staged
- **CI/CD:** GitHub Actions, Docker

## Repository Structure

```
student-erp/
├── apps/                    # Applications
│   ├── web-admin/          # Admin dashboard (Next.js)
│   ├── web-student/        # Student portal (Next.js)
│   ├── web-faculty/        # Faculty portal (Next.js)
│   ├── web-guardian/        # Guardian portal (Next.js)
│   ├── api/                 # Backend API (NestJS)
│   └── mobile/              # Mobile app (placeholder)
├── packages/                # Shared packages
│   ├── ui/                  # Shared UI components
│   ├── config/              # Shared configuration
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── hooks/               # React hooks
│   ├── constants/           # Constants and enums
│   ├── schemas/             # Validation schemas
│   └── sdk/                 # API SDK
├── docs/                    # Documentation
├── docker/                  # Docker configuration
├── scripts/                 # Build and setup scripts
├── tooling/                 # Custom generators and templates
├── .github/                 # GitHub Actions workflows
└── .vscode/                 # VS Code settings
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (optional, for containers)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/student-erp.git
cd student-erp

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Start development
pnpm dev
```

### Development Commands

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps and packages
pnpm lint         # Lint all packages
pnpm format       # Format code with Prettier
pnpm test         # Run all tests
pnpm clean        # Clean build artifacts
```

## Development Guidelines

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

### Code Standards

- TypeScript strict mode
- ESLint for linting
- Prettier for formatting
- Husky pre-commit hooks
- lint-staged for incremental linting

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `release/*` - Release branches

## License

MIT
