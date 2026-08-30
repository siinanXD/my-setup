# AI Engineering Workflow

This file specializes `docs/ENGINEERING.md` for AI projects. It must not contradict that file.

Use it as a daily reference: repeatable workflow, simple defaults, measurable quality, reusable templates, easy demos. Scale only when evidence requires it.

## Core workflow

Problem → smallest useful solution → baseline → golden dataset / representative cases → simple end-to-end implementation → evaluation → observability → architecture review when needed → code review → containerize → CI → deploy → monitor → improve from evidence.

Do not optimize before a baseline exists.

## Default stack

Defaults, not mandatory dependencies. Drop or replace a piece only with a concrete reason.

| Layer | Default |
| --- | --- |
| Frontend | Next.js — simple and functional. No extra UI kits or complex state libraries unless needed. |
| Backend | Python, FastAPI, Pydantic |
| Database | PostgreSQL |
| Data access | SQLAlchemy + Alembic when an ORM/migrations are needed; plain SQL when simpler |
| Cache / queue / temp state | Redis only with a concrete requirement |
| Containers | Docker |
| CI | GitHub Actions |
| Deploy | Vercel for Next.js frontends; Railway for FastAPI, workers, jobs, and managed PostgreSQL. No Kubernetes or complex cloud by default. |
| Secrets | Infisical for user-managed application secrets; see `docs/DEPLOYMENT_AND_SECRETS.md`. |

## AI baseline

Start with **one** strong hosted model as the reference baseline. **OpenAI** is the default unless the customer requirement says otherwise.

Do not add extra providers at the start “for flexibility.”

Measure: task quality, latency, token usage, cost, failure rate.

## Local models

When the customer needs local inference, data sovereignty, offline operation, lower marginal cost, or customer-controlled infrastructure: benchmark a strong local model **against the hosted baseline**.

Do not assume the local model is good enough. Compare quality, latency, hardware, operational complexity, cost, and privacy. Choose from evidence.

## Evaluation

Meaningful AI behavior requires evals. Reuse `agent-eval-harness`. Do not rebuild evaluation infrastructure.

Start with a small representative golden dataset. Prefer deterministic checks.

Measure what the product needs: correctness, structured-output validity, retrieval relevance, groundedness, citation correctness, tool success, regression rate.

Useful production failures become new regression cases.

## Observability

**Langfuse** is the default tracing layer. Trace important AI steps separately.

Track when applicable: total / model / retrieval / rerank / tool latency, token usage, estimated cost, model/provider, errors, retries, evaluation scores.

Do not log secrets or sensitive customer content by default.

Traces should answer: what happened, why it was slow, why quality dropped, what it cost, which component failed.

## Retrieval / RAG

Do not add RAG if prompting solves the problem.

When RAG is required, use a simple pipeline:

ingest → parse → normalize → chunk → embed → index → retrieve → rerank when justified → generate → validate → citations

Vector strategy (pick one):

1. PostgreSQL + pgvector when it fits
2. Qdrant when a dedicated vector database has a concrete benefit
3. Chroma mainly for small/local prototypes and demos

Do not run pgvector, Qdrant, and Chroma together without a real requirement.

Add lexical or hybrid retrieval when exact identifiers, names, clauses, or keywords matter.

## Reranking

Reranking is a **separate retrieval stage**, not observability.

Add it only when evals show first-stage retrieval returns useful candidates but ordering/relevance is insufficient.

Measure retrieval quality, answer quality, extra latency, extra cost. Trace the step in Langfuse.

Do not add reranking because it is “best practice.”

## Architecture review

Keep the first architecture as small as possible. Ask whether the project can be built with:

Next.js + FastAPI + PostgreSQL + one AI provider.

Add components only when required:

| Need | Then consider |
| --- | --- |
| Background processing | worker |
| Caching / queue coordination | Redis |
| Semantic retrieval | pgvector |
| Specialized vector infra | Qdrant |
| Complex stateful AI workflows | LangGraph |
| Higher throughput | measure the bottleneck first, then scale that part |

Claude Code deep-reviews important architecture, security, scaling, data-model, or infrastructure decisions. Cursor implements. Codex independently reviews the change. Claude is not a gate for tiny changes.

## Security and reliability

Always consider: input validation, structured outputs where appropriate, explicit permissions, authorization **outside** the LLM, bounded retries, timeouts, idempotency for side effects, approval gates for sensitive actions, secret redaction, prompt-injection boundaries for untrusted content, fail-closed behavior for risky operations.

Do not give agents unrestricted shell, filesystem, network, or production access by default.

## Performance and scaling

Scale from measurements, not forecasts.

Observe first: latency, throughput, database load, queue depth, retrieval performance, model latency, error rate, cost per successful task.

Then optimize the actual bottleneck.

Prefer: vertical/simple scaling → caching → worker separation → database/index tuning → targeted service split — before distributed complexity.

## Templates

Do not invent a new stack per customer. Intended repos:

| Repo | Role |
| --- | --- |
| `my-setup` | Engineering workflow and rules |
| `ai-core` | Small reusable AI runtime primitives |
| `agent-eval-harness` | Evals and regression gates |
| `ai-starter` | Standard simple production AI project |

Specialized templates only when proven useful: `ai-template-rag`, `ai-template-document`, `ai-template-agent`, `ai-template-automation`.

Templates are **runnable demos**, not empty skeletons. Each shows one small complete vertical slice for a customer demo.

Examples:

- RAG: upload/query → retrieval → rerank if enabled → answer → citation → Langfuse trace
- Agent: request → model → approved tool → permission check → result → trace
- Automation: trigger → AI decision → policy → optional approval → action → audit

A customer project should reuse this infrastructure. Spend time on customer data, business logic, integrations, prompts, tools, eval dataset, and customer-specific UI — not on rebuilding FastAPI setup, Docker, health checks, logging, AI tracing, CI, provider wrappers, eval wiring, or common security boundaries.

This file does not create those repositories.

## Order of preference

simple → measurable → reliable → secure → observable → scalable

Every extra component needs a reason.
