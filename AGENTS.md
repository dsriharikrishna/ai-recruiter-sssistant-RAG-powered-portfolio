PROJECT: Multi-tenant portfolio builder. A user uploads a resume (mandatory) and
an optional portfolio link. We extract structured data, the user reviews and
approves it, then we generate a template-based portfolio site with a RAG
recruiter chatbot that answers ONLY from that user's approved data.

STACK: Next.js (App Router, TypeScript strict, Tailwind, shadcn/ui, TanStack
Query) in apps/web. FastAPI (Python 3.12, Pydantic v2, SQLAlchemy 2.0 async,
Alembic, pgvector) in apps/api. PostgreSQL + pgvector, Redis, Docker Compose.
uv for Python, pnpm for web. OpenAI SDK behind an internal interface. No
LangChain, no microservices, no AWS.

HARD RULES:
1. TENANT ISOLATION: every repository method takes owner_id as a required
   argument and filters by it. No query touches user data without owner_id.
   Never trust an owner_id from the client; derive it from the verified token
   or the site slug on the server.
2. The approved profile JSON (Pydantic models in
   apps/api/app/schemas/profile.py) is the single source of truth for the site
   and the chatbot. Never change that schema without flagging it clearly in
   your summary.
3. Never invent facts about a user. Every extracted fact carries a type and
   an evidence quote from the source text.
4. Do not commit secrets. Only .env.example with placeholders.
5. Do not claim tests or commands succeeded unless you ran them. Show the
   actual output, including failures.
6. Use current stable versions and check official docs rather than memory.
7. Do not add dependencies without listing them and the reason.
8. Python: full type hints, ruff, mypy. TypeScript: strict mode.
9. Work in small steps. After each task, stop and summarize: what changed,
   what you ran, what failed, what is next. Do not start the next task.
10. Ask before running destructive commands or installing global tools.



# Website & UI/UX Design System Rules

For every website, web application, component, and user experience built in this project:

1. **UI/UX Pro Max Reference Integration**:
   - Reference and follow the design guidelines, style catalogs, color systems, and font pairings in [.agents/skills/ui-ux-pro-max/SKILL.md](file:///.agents/skills/ui-ux-pro-max/SKILL.md).
   - Leverage the companion skills installed in `.agents/skills/`:
     - `ui-ux-pro-max` (comprehensive UI intelligence, 79 UI styles, 192 palettes, 74 font pairings, 119 UX guidelines)
     - `design-system` (tokens, component systems, atomic consistency)
     - `ui-styling` (CSS architecture, modern animation, responsive layout)
     - `brand` (identity, tone, and brand cohesion)
     - `banner-design` (hero sections, banners, visual graphics)

2. **Design Intelligence Query Workflow**:
   - When initiating a new website page or theme, run the UI/UX Pro Max query script to fetch tailored recommendations:
     `python .agents/skills/ui-ux-pro-max/scripts/search.py "<product-type-or-topic>"`
   - Use the returned primary/secondary styles, color palettes, and UX patterns to construct design tokens and interface structures.

3. **Visual Quality Standards**:
   - Deliver production-grade visual polish with intentional contrast, clean typography scales, and fluid responsive interactions.
