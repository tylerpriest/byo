# BYO (Build Your Own) - Project Requirements (Reorganised v0)

**Original Prompt Date:** 2025-11-02
**Reorganised:** 2025-11-13

---

## 1. Tech Stack

### Core Framework & Build
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React** - UI library

### Testing
- **Vitest 4.0** - Unit testing
- **Playwright** - E2E testing
- **Testing Library** - Component testing

### Backend & Database
- **Supabase** - Backend as a Service
- **Supabase CLI** - Local development and migrations

### Styling & UI
- **TailwindCSS** - Utility-first CSS
- **ShadCN** - Component library
- **ShadCN MCP** - Model Context Protocol integration

### Code Quality & Logging
- **ESLint** - Linting
- **Pino** - Logging
- **Zod Schema** - Validation

### Security & Authorization
- **RBAC** - Role-Based Access Control

### Deployment & Version Control
- **Vercel** - Hosting
- **GitHub** - Version control
- **GitHub CLI** - Command-line interface

### AI Integration
- **MCP (Model Context Protocol)** - AI agent integration
- **Agents** - AI-powered automation
- **claude.md** - Project context for Claude
- Claude can access Console logs and Testing Library

---

## 2. Architecture & Development Principles

### Code Organization
- **Feature-based structure** in `/src`
- Organize by feature, not by file type
- Keep related code together

### Development Philosophy
- **DRY Principles** - Don't Repeat Yourself
  - Share components as much as possible
  - Never reinvent the wheel
  - If Supabase offers Auth, use it
  - If ShadCN has templates (dashboard, auth, landing), use them
  - Leverage existing solutions and components

- **TDD** - Test-Driven Development
  - Write tests first
  - Ensure code quality
  - Enable refactoring with confidence

### Project Creation
- **Create from scratch** - Don't use existing boilerplates from GitHub (e.g., vite-react-ts-shadcn-ui)
- Build fresh to understand every piece
- Maintain full control and customization

---

## 3. Features & Pages

### Core Pages
- **Landing Page** - Marketing/public homepage
- **Auth** - Authentication system (login, signup, reset password)
- **Dashboard** - Main user dashboard
- **Account Page** - User account management
- **Settings** - User settings and preferences

### Layout Components
- **Collapsible Sidebar** - Navigation sidebar
- **Header** - Top navigation bar
- **Footer** - Page footer

### Open Questions
> **What will be on the customer/member dashboard?**
> - This needs to be defined based on the specific SaaS use case

---

## 4. UI/UX Principles

### User Experience
- **Optimistic UI** - Update UI immediately, sync in background
- **Fail Gracefully** - Handle errors without breaking the experience
- Show loading states
- Provide meaningful error messages

### Component Strategy
- **Use ShadCN components as much as possible**
- Leverage pre-built, accessible components
- Customize when necessary
- Maintain consistent design language

---

## 5. Documentation Strategy

### Documentation Philosophy
- **Documentation as Code** - Version controlled, lives with code
- **Progressive Disclosure** - Start simple, add detail as needed
- **Living Documentation** - Update as code changes

### Documentation Structure
```
/docs/           # Main documentation directory
  /specs/        # Technical specifications
  /tasks/        # Task management
    active/      # Currently in progress
    complete/    # Finished tasks
    template/    # Task templates
    draft/       # Planned tasks
```

### Documentation Rules
- **Keep docs in `/docs`** - Never in root unless absolutely required
- Clean, organized documentation
- Easy to navigate and maintain
- AI-friendly format (markdown)

---

## 6. Testing & CI/CD

### Testing Strategy
- **Unit Tests** - Vitest 4.0
- **E2E Tests** - Playwright
- **Component Tests** - Testing Library

### Playwright Configuration
- Operates in **list mode** and **headless mode** when a visible browser isn't required
- Runs in the **Playwright browser** when head mode is used
- Allows visual automation without taking full control of the screen

### CI/CD
- **Setup CI/CD with GitHub Actions**
- Automated testing on pull requests
- Automated deployment to Vercel
- Type checking and linting in pipeline

### Integration with Claude
- Claude can access Console logs
- Claude can access Testing Library
- Enables AI-assisted debugging and testing

---

## 7. Philosophy & Constraints

### Never Reinvent the Wheel
Follow the ethos of DRY Principles:
- If **Supabase offers Auth**, use it
- If **ShadCN has a dashboard template**, use it
- If **ShadCN has an auth template**, use it
- If **ShadCN has a landing page template or components**, use them
- Share components as much as possible
- Leverage battle-tested solutions

### Build Fresh
- **Don't use a boilerplate from GitHub** (like vite-react-ts-shadcn-ui)
- Create this part fresh
- Understand every piece of the architecture
- Maintain full control

### Maintain Quality
- Write clean, maintainable code
- Follow TypeScript best practices
- Use proper error handling
- Implement proper logging
- Ensure accessibility
- Test thoroughly

---

## 8. Summary

This project is a modern SaaS boilerplate built with **best practices**, **DRY principles**, and **TDD**. It leverages existing solutions (Supabase, ShadCN) while being built fresh from scratch. The focus is on:

- **Developer Experience** - Great tooling, clear structure
- **Code Quality** - TypeScript, testing, linting
- **User Experience** - Optimistic UI, graceful failures
- **Documentation** - Living docs alongside code
- **Flexibility** - Feature-based, easy to extend
- **AI-Friendly** - MCP integration, accessible to Claude

This boilerplate provides a **production-ready foundation** for building SaaS applications quickly while maintaining high quality standards.
