## Tech Stack
Vite, TypeScript, Vitest 4.0, Playwright + MCP + Agents, Vercel, Supabase + CLI, Github + CLI, TailwindCSS, ShadCN + MCP, ESLint, Pino, RBAC, Zod Schema, claude.md

## Core Principles
Organised by Feature in /src, DRY Principles, TDD, Optimistic UI, Fail Gracefully

Use ShadCN components as much as possible

Never reinvent the wheel - if Supabase offers Auth use it, if ShadCN has a dashboard template, auth template, landing page template or the components to build them use them

Don't use a boilerplate from github like vite-react-ts-shadcn-ui - create this part fresh

## Features
Landing Page, Auth, Collapsible Sidebar, Header, Footer, Dashboard, Account Page, Settings

## Documentation Strategy
Document all of this in /docs docs/specs docs/tasks etc and have clean documentation, never docs in root unless absolutely required

Documentation as Code, Progressive Disclosure, Living Documentation

Setup CI/CD with github actions

/tasks/ active complete template draft

## Testing Notes
Playwright operates in list mode and headless mode when a visible browser isn't required, and runs in the Playwright browser when head mode is used, allowing visual automation without taking full control of the screen

Claude can access Console logs, Testing Library