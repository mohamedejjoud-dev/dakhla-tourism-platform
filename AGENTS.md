# AGENTS.MD — Development Rules & Operating Principles

This document establishes the permanent development principles, quality standards, and operating rules for the **Dakhla Tourism Platform**. All agents and engineers working on this codebase must strictly abide by these rules without exception.

---

## 1. Core Operating Directives

1. **Explicit Approval Before Coding**
   - Never write production code, scaffold projects, install dependencies, or alter database schemas without explicit user approval.
   - All tasks must be scoped and confirmed before execution begins.

2. **One Feature / Scope at a Time**
   - Never implement multiple unrelated features simultaneously.
   - Work iteratively in small, verifiable, modular increments.

3. **Zero Assumption & No Invented Requirements**
   - Never invent requirements, user flows, business logic, or domain rules.
   - When requirements are ambiguous or incomplete, clarify them with the user first.

4. **Modular & Maintainable Architecture**
   - Code must remain strictly decoupled, modular, and self-documenting.
   - Enforce clean separation of concerns: presentation layer, business logic / domain services, data access layer, and external integrations.

5. **Lean Dependencies**
   - Avoid unnecessary third-party packages, bloated UI kits, or redundant libraries.
   - Justify every dependency added; prioritize native platform capabilities and lightweight, battle-tested solutions.

6. **Transparent Technical Decision-Making**
   - Explain important architectural and technical decisions, trade-offs, and alternatives before proposing or applying them.

7. **Verification & Testing Before Progression**
   - Every feature must be thoroughly tested and validated against its acceptance criteria before marking it complete or moving to the next task.
   - Do not claim a feature works without empirical proof (unit tests, integration checks, end-to-end verification, or reproducible runs).

8. **Git Checkpoints & Commit Discipline**
   - Create clean, descriptive Git commits after completing and reviewing each verified milestone.
   - Keep commit history logical, atomic, and revertible.

9. **No Fake or Mock Data to Mask Incomplete Functionality**
   - Never use hardcoded mock responses, stubbed handlers, or fake data to pretend that an integration or feature works.
   - If an endpoint or feature is pending or incomplete, mark it clearly as such and implement the real data pipeline.

10. **Strict Secret Management**
    - Never hardcode API keys, secrets, credentials, or environment-specific tokens in source files or version control.
    - All secrets must be loaded strictly through secure environment variables (`.env` files ignored by Git, with an updated `.env.example`).

11. **Preserve Working Functionality (No Regressions)**
    - Never modify existing working functionality without explaining the necessity and potential impact to the user beforehand.
    - Refactoring must not break existing contracts or features.

12. **Non-Negotiable Quality Standards**
    - **Security:** Sanitize inputs, enforce RBAC, defend against OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, rate-limiting, secure headers).
    - **Performance:** Optimize Core Web Vitals, asset loading, lazy-loading, caching, image compression (modern formats like WebP/AVIF), and database indexes.
    - **Accessibility (a11y):** Build semantic HTML compliant with WCAG 2.1 AA standards.
    - **Responsive Design:** Deliver mobile-first, fluid, and robust layouts tested across mobile, tablet, and desktop viewports.
    - **Aesthetic Excellence:** Adhere to a bespoke, cohesive design system reflecting Dakhla’s unique natural identity (lagoon, ocean, desert sands) without generic or "vibe-coded" AI aesthetics.
