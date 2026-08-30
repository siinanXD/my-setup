# AI Factory Plan

Inventory of reusable infrastructure already built. This file plans extraction. It does not create repositories or implement code.

Inspected locally: `document-intelligence-mvp`, `ai-engineer-control-center`, `-sinan-ai-os`, `flowmind`, `agent-eval-harness`.

Not present locally: `Booking-email-check`, `maintenance-ai-assistant`. They are named only as future references, not as extracted evidence.

Rules from `docs/ENGINEERING.md` and `docs/AI_ENGINEERING_WORKFLOW.md` apply: smallest first version, PostgreSQL + pgvector when RAG is needed, no default Redis / workers / LangGraph / Qdrant / Chroma / extra providers.

## Classification

| Pattern | Class | Decision |
| --- | --- | --- |
| LLM/provider abstraction | **A** | One OpenAI adapter + small protocol. Multi-provider routers stay out of MVP. |
| Structured outputs | **A** | Parse + validate into Pydantic. |
| Retries and timeouts | **A** | Bounded LLM-call retry/timeout only. Job-queue retries are not default. |
| Tool contracts | **D** | Agent template later. No generic tool runtime in MVP. |
| Permissions | **B / D** | Auth **outside** the LLM in starter (simple). RBAC / tenant matrices stay product-specific or agent-template. |
| Approval gates | **D** | Proven in control-center and `-sinan-ai-os`. Not default. |
| Idempotency | **E / D** | Domain-specific today (uploads, job claim, approval claim). Do not invent a generic idempotency framework. |
| Workers and queues | **D** | Postgres `SKIP LOCKED` and Redis queues both exist. Default path has neither. |
| Provider routing | **E / D** | Keep out of default. `-sinan-ai-os` `model_router` is optional later. |
| Cost tracking | **A** | Estimate from token usage on the OpenAI call. No budget circuit breaker in MVP. |
| Safe logging / redaction | **A** | Redact secrets; never log prompts or customer content by default. |
| Prompt-injection boundaries | **A** | Wrap untrusted text as data. Not a full security product. |
| Langfuse tracing | **A** | Fail-open client + generation/span helper. |
| Latency tracking | **A** | Record on the LLM (and later retrieval) span. |
| Retrieval / hybrid / rerank | **D** | RAG template. Do not put RAG in `ai-core`. |
| pgvector | **B** (optional) | Default vector path **when** a project needs RAG. Not required for the first starter slice. |
| Qdrant | **D / E** | Used in `document-intelligence-mvp`. Optional later, not default. |
| Chroma | **E** | Not a default. Prototype-only if ever. |
| FastAPI + Pydantic + settings | **B** | Starter foundation. |
| PostgreSQL + SQLAlchemy + Alembic | **B** | Starter foundation. Prefer this over raw `schema.sql` or Mongo. |
| Redis | **D** | Used in control-center and FlowMind. Not default. |
| Docker + health/ready | **B** | Starter foundation. |
| GitHub Actions | **B** | Lint/test + one `agent-eval-harness` step. |
| Railway | **B** | Config only. No autonomous deploy. |
| Next.js | **B** | One functional page. No extra UI kit. |
| Test strategy | **B** | pytest for API; no paid model calls in default CI. |
| Eval integration | **C + B** | Harness owns runner/scorers/gate. Starter only adds suite + target + CI line. |

**A** = `ai-core` · **B** = `ai-starter` · **C** = `agent-eval-harness` · **D** = specialized template later · **E** = project-specific, do not extract.

## What already exists (sources of truth)

Reuse these, do not redesign:

| Need | Best local source |
| --- | --- |
| Provider protocol + OpenAI structured `parse` | `document-intelligence-mvp` `app/providers/base.py`, `openai_provider.py`, `registry.py` |
| Structured JSON recovery | `-sinan-ai-os` `core/structured.py` |
| Untrusted wrapping | `-sinan-ai-os` `integrations/references/untrusted.py` and control-center `apps/api/app/core/untrusted.py` |
| Redaction | `-sinan-ai-os` `core/redact.py` and control-center `apps/api/app/core/redaction.py` |
| Langfuse observe / generation | `-sinan-ai-os` `integrations/langfuse/client.py`, `core/observe.py`, `core/generation.py` |
| FastAPI + SQLAlchemy + Alembic + health | `document-intelligence-mvp` and control-center API |
| Docker + Railway | control-center (`Dockerfile`s, `railway.json`) |
| Postgres queue (later, not MVP) | `document-intelligence-mvp` `app/services/jobs.py`, `app/worker.py` |
| Hybrid lexical + semantic (later) | `document-intelligence-mvp` `lexical.py`, `retrieval.py` |
| Approvals / actions (later) | `-sinan-ai-os` `core/approval_executor.py`, `core/actions.py`; control-center `approvals.py` |
| Evals | `agent-eval-harness` only |

Do **not** extract: FlowMind Mongo/Celery/LangGraph product engine, control-center Figma/fleet/Pi worker, `-sinan-ai-os` career/LinkedIn/mission domain, Docling relations, Graphiti/FalkorDB.

## `ai-core` MVP

Reusable **library** of AI runtime primitives. No web app, no database, no queue, no RAG.

Scope:

1. OpenAI-only completion + structured completion (Pydantic schema).
2. Timeout and bounded retry on that call.
3. Structured-output parse fallback (fences / balanced JSON) when the SDK parse is not used.
4. Untrusted-content wrapper.
5. Redaction for logs and traces.
6. Langfuse helper: generation span with latency, tokens, estimated cost, model, errors. Fail open. Never send secrets or raw customer content by default.

Out of this MVP: extra providers, routing, embeddings, retrieval, tools, approvals, workers, Redis, LangGraph.

## `ai-starter` MVP

Runnable customer-demo project. Copies foundation; depends on `ai-core` and `agent-eval-harness`.

Stack: Next.js + FastAPI + Pydantic + PostgreSQL + SQLAlchemy + Alembic + OpenAI + Langfuse + Docker + GitHub Actions + Railway-ready config. pgvector is **optional and off** until a project needs RAG.

**Vertical slice (prompting, not RAG):**

user submits short text → FastAPI validates → `ai-core` structured OpenAI call → result stored in Postgres → Langfuse generation trace → Next.js shows result + trace id.

That is enough to demo: request, model, structured output, persistence, observability, eval gate.

## Future templates (do not build)

| Template | Best local reference | Why later |
| --- | --- | --- |
| `ai-template-rag` | `document-intelligence-mvp` (ingest → retrieve → grounded ask → citations). Use `-sinan-ai-os` `memory/retrieval/` for **pgvector**, not Qdrant. | RAG only when prompting is not enough. Hybrid/rerank stay optional. |
| `ai-template-document` | `document-intelligence-mvp` | Parse/normalize/chunk/jobs/tenants are document-product, not core. |
| `ai-template-agent` | `ai-engineer-control-center` (run + approval UI) plus `-sinan-ai-os` approval/action executor | Tools, permissions, approval gates. |
| `ai-template-automation` | `flowmind` (trigger → graph → HITL approve → action). If `Booking-email-check` is cloned later, prefer it for the mail trigger → policy → review → action → audit shape. | LangGraph, workers, and domain triggers are optional. |

## Exact `ai-core` MVP files

```
ai_core/
  __init__.py
  provider.py      # Protocol + OpenAI complete / complete_structured
  retry.py         # timeout + bounded retry
  structured.py    # JSON extract / Pydantic validate
  untrusted.py     # wrap + neutralize untrusted text
  redact.py        # log/trace redaction
  observe.py       # Langfuse generation span + token/cost/latency
  cost.py          # OpenAI token cost estimate
pyproject.toml
tests/             # unit tests with fake OpenAI + fake Langfuse
```

## Exact `ai-starter` MVP files

```
backend/
  app/main.py
  app/core/settings.py
  app/core/db.py
  app/models.py              # one small result table
  app/api/health.py          # /health, /ready (DB)
  app/api/analyze.py         # the vertical slice
  migrations/                # Alembic baseline
  evals/suites/analyze.json  # golden structured-output cases
  evals/target.py            # thin harness target
  Dockerfile
  pyproject.toml
frontend/
  app/page.tsx               # one form + result
  app/healthz/route.ts
  Dockerfile
docker-compose.yml           # Postgres only
.github/workflows/ci.yml     # backend tests + harness gate + frontend build
railway.toml                 # or equivalent Railway config
.env.example
README.md
```

No Redis, no worker process, no vector service, no second provider.

## Must not include yet

- Anthropic / Gemini / Vertex / LiteLLM / multi-provider fallback
- `model_router`, budget circuit breaker
- Redis, Celery, RQ, generic workers
- LangGraph
- Qdrant, Chroma, dual vector stores
- pgvector enabled by default
- Tool registry, MCP, shell/filesystem/network agents
- Approval executor
- Tenant/RBAC product models
- MongoDB, Graphiti, FalkorDB
- A second eval runner
- Kubernetes

## Dependency direction

```
my-setup                 docs only (this plan + engineering rules)
       │
       ▼
agent-eval-harness       standalone; depends on nothing AI-runtime
       ▲
       │  (suites + target only)
ai-core  ─────────────►  ai-starter  ─────────────►  customer projects
 (no FastAPI/DB)          (app template)              (also may import ai-core)
```

- `ai-core` must not import FastAPI, SQLAlchemy, Next.js, or the harness.
- `agent-eval-harness` must not import `ai-core`.
- Templates later depend on `ai-core` + copy `ai-starter`; they do not fork a new runtime.

## Implementation order

1. Create `ai-core` from the listed primitives (copy/adapt, do not invent).
2. Keep using `agent-eval-harness` as-is.
3. Create `ai-starter` with the one analyze slice, Docker, health, CI, Railway config.
4. Stop. Prove the demo and the eval gate.
5. Only then consider `ai-template-rag` (pgvector), then document / agent / automation.

## Provenance

| Extracted into MVP | Came from |
| --- | --- |
| Provider protocol + OpenAI structured parse | `document-intelligence-mvp` `app/providers/` |
| Structured JSON recovery | `-sinan-ai-os` `core/structured.py` (FlowMind `backend/utils/llm_json.py` is a weaker duplicate) |
| Untrusted wrapping | `-sinan-ai-os` `integrations/references/untrusted.py`; control-center `apps/api/app/core/untrusted.py` |
| Redaction | `-sinan-ai-os` `core/redact.py`; control-center `apps/api/app/core/redaction.py` |
| Langfuse client + spans | `-sinan-ai-os` `integrations/langfuse/`, `core/observe.py`, `core/generation.py`; FlowMind `backend/observability/langfuse_client.py` |
| Token/cost on a generation | `-sinan-ai-os` `agents/llm.py` / `core/generation.py`; control-center `providers/base.py` `estimate_cost` |
| FastAPI / settings / health | `document-intelligence-mvp` `app/main.py`, `app/api/health.py`; control-center `/health` + `/ready` |
| SQLAlchemy + Alembic + Postgres | `document-intelligence-mvp`; control-center `apps/api` |
| Docker + GitHub Actions + Railway | control-center |
| Next.js app shell + healthz | control-center `apps/web` (layout only, not product pages) |
| Eval suite / runner / gate | `agent-eval-harness` — wire only |

Patterns **seen but deferred** (not MVP): control-center Redis queue + run approvals; `document-intelligence-mvp` Postgres worker + Qdrant + lexical search; `-sinan-ai-os` model router + pgvector memory + approval executor; FlowMind LangGraph + Celery + HITL.
