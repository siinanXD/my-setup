# AI Factory Plan

Inventory of reusable infrastructure already built. This file plans extraction and project direction. It does not implement product code.

Rules from `docs/ENGINEERING.md`, `docs/AI_ENGINEERING_WORKFLOW.md`, and `docs/DEPLOYMENT_AND_SECRETS.md` apply: reuse proven code before inventing new infrastructure, keep the first version small, prefer PostgreSQL as source of truth, and require evidence for AI-derived claims.

## Current status — 2026-09-01

- `ai-core` MVP is complete and merged.
- `ai-starter` base slice is complete. Canonical frozen application baseline remains `7f91e3f394536164ffefcf320b4356ad24092702`; later deployment/secrets documentation was added without changing the baseline decision.
- `ai-starter` is the default base for future customer AI projects.
- `ai-template-rag` is complete and merged. It uses PostgreSQL + pgvector. Retrieval evals and grounding/citations are proven.
- `ai-template-document` is complete and merged. PR #1 added the focused invoice/document extraction vertical slice derived from the frozen starter.
- `document-intelligence-mvp` is the canonical implementation/reference for the deeper document pipeline and the foundation for Machine Intelligence.
- Latest verified `document-intelligence-mvp` state includes merged work through SIN-73 / PR #16: ingestion, Docling parsing/provenance, Qdrant retrieval, lexical search, grounded `/ask`, document profiles/relations, tenant isolation, delete/reindex, retrieval evaluation, generation controls/observability, Cursor Cloud reproducibility, automated Copilot re-review, and streaming upload limits.
- Remaining Document Intelligence MVP focus: SIN-74 quality gates, SIN-77 Next.js decision cockpit, SIN-69 Railway production deployment, then SIN-70 end-to-end acceptance.
- New next product layer: **Machine Intelligence**. It extends `document-intelligence-mvp`; it does not start a parallel platform.

## AI Factory rule

Specialized templates are intentionally small reusable customer-project starting points. Product repositories may be deeper and more complex when the domain requires it.

Do not force `document-intelligence-mvp` or Machine Intelligence back into the smallest template architecture if the already-proven product code solves the requirement correctly.

## Machine Intelligence North Star

Goal:

`machine → documents → assemblies → components → signals → connections → PLC addresses/logic → machine functions/sequences → evidence`

Target inputs include electrical schematics, machine manuals, PLC programs/exports, BOMs, pneumatic/hydraulic plans and datasheets.

Every derived entity, relation and machine-behavior claim must resolve to concrete evidence. Missing information remains unresolved. Conflicts and uncertainty remain visible.

### Build-vs-buy / open-source rule

Before custom parsing or new infrastructure:

1. inspect the existing repositories and extension seams;
2. check established standards and open-source parsers;
3. use Docling for generic document parsing where it fits;
4. prefer deterministic engineering-format parsing over LLM heuristics where possible;
5. implement custom parsing only for a demonstrated gap.

No graph database, agent orchestration layer, additional vector database or new provider is added by default. PostgreSQL remains source of truth; indexes must remain rebuildable.

## Machine Intelligence implementation track

Linear project: `Machine Intelligence`.

Current issue chain:

1. **SIN-88 — Architecture & open-source/parser audit**
   - inspect `document-intelligence-mvp` first;
   - evaluate standards/parsers and Docling fit;
   - choose the first narrow machine-package fixture and supported format subset;
   - document reuse/adapt/custom/defer decisions.
2. **SIN-89 — Canonical machine/evidence model**
   - blocked by SIN-88 and final Document Intelligence acceptance SIN-70;
   - extend the existing PostgreSQL source-of-truth model with machines, assemblies, engineering entities, signals, endpoints, relations and evidence.
3. **SIN-90 — Engineering package classification and assignment**
   - classify files and associate them with machine/assembly using deterministic evidence first.
4. **SIN-91 — Component/signal extraction and cross-document identity resolution**
   - stable canonical engineering entities; ambiguity never silently merged.
5. **SIN-92 — Evidence-backed engineering connectivity graph**
   - store connectivity in PostgreSQL first; every edge resolves to source evidence.
6. **SIN-93 — PLC normalization**
   - integrate the standard/export/parser selected by SIN-88;
   - preserve exact PLC source locations and unsupported constructs.
7. **SIN-94 — PLC ↔ physical mapping**
   - connect symbols/I/O/logic to physical components via identifiers and wiring evidence.
8. **SIN-95 — Machine function and simple sequence reasoning**
   - derive only from persisted grounded relations; LLM explanation is optional presentation, not the source of facts.
9. **SIN-96 — Machine Intelligence evaluation + acceptance**
   - versioned engineering golden dataset, entity/relation/mapping metrics, evidence resolvability, unsupported-claim gate and five-minute end-to-end demo.

Product implementation after SIN-88 remains gated behind SIN-70 so the existing Document Intelligence foundation is accepted before adding the next layer.

## Classification of reusable infrastructure

| Pattern | Class | Decision |
| --- | --- | --- |
| LLM/provider abstraction | **A** | Reuse `ai-core` / proven provider patterns. |
| Structured outputs | **A** | Parse + validate with typed schemas. |
| Retries and timeouts | **A** | Bounded calls only; do not stack SDK/application retries. |
| Safe logging / redaction | **A** | Never log customer content/prompts by default. |
| Langfuse tracing | **A** | Fail-open, content-off by default. |
| FastAPI + settings | **B** | Starter/product foundation. |
| PostgreSQL + SQLAlchemy + Alembic | **B** | Source of truth; extend rather than replace. |
| Next.js | **B** | Thin UI over backend state/decisions. |
| Evaluation harness | **C + B** | Reuse deterministic eval patterns; no second generic runner. |
| pgvector RAG | **D** | `ai-template-rag` reusable path. |
| Document extraction | **D** | `ai-template-document` reusable focused path. |
| Docling pipeline | **E** | Product-specific proven implementation in `document-intelligence-mvp`. |
| Qdrant | **E** | Existing product index; keep rebuildable, not source of truth. |
| Postgres worker | **E** | Existing product ingestion mechanism; reuse. |
| Engineering connectivity / PLC / machine model | **E** | Machine Intelligence domain layer; extend the product, not generic `ai-core`. |
| Graph database | **Deferred** | Only if measured PostgreSQL traversal/storage becomes insufficient. |
| LangGraph / agent orchestration | **Deferred** | No current Machine Intelligence requirement. |

**A** = `ai-core` · **B** = `ai-starter` · **C** = `agent-eval-harness` · **D** = specialized reusable template · **E** = product/domain-specific, reuse in-place.

## Sources of truth to reuse

| Need | Best current source |
| --- | --- |
| Generic OpenAI runtime, redaction, observability | `ai-core` |
| Customer app foundation | `ai-starter` |
| Grounded pgvector RAG template | `ai-template-rag` |
| Focused structured document extraction | `ai-template-document` |
| Multi-format ingestion + Docling + provenance | `document-intelligence-mvp` |
| Semantic + lexical retrieval and grounded citations | `document-intelligence-mvp` |
| Document profiling/relations and evidence-bearing decisions | `document-intelligence-mvp` |
| Tenant isolation, delete/reindex, privacy | `document-intelligence-mvp` |
| Retrieval/generation evaluation patterns | `document-intelligence-mvp` + `agent-eval-harness` |
| PR review/fix/re-review workflow | `my-setup` engineering docs |

## Template status

### `ai-core`
Status: complete and merged.

Reusable AI runtime primitives only. No web app, database, queue, RAG or Machine Intelligence domain logic.

### `ai-starter`
Status: base MVP complete; canonical baseline frozen at `7f91e3f394536164ffefcf320b4356ad24092702`.

Default customer-demo application foundation: Next.js + FastAPI + PostgreSQL + `ai-core` + eval gate + deployment conventions.

### `ai-template-rag`
Status: complete and merged.

Derived from frozen `ai-starter`. PostgreSQL + pgvector, grounded retrieval/answers/citations, deterministic evals. Qdrant is not required for this reusable template.

### `ai-template-document`
Status: complete and merged.

Derived from frozen `ai-starter`. Focused document extraction slice: upload/paste → validate → extract → structured grounded fields → review flag → metadata persistence → Next.js result. It remains deliberately smaller than `document-intelligence-mvp`.

### Future generic templates

| Template | Best reference | Scope |
| --- | --- | --- |
| `ai-template-agent` | `ai-engineer-control-center` + approval/action patterns | Tools, permissions, approvals; only when needed. |
| `ai-template-automation` | `flowmind` plus proven trigger/action patterns | Triggers, workflows, HITL; not default. |

Machine Intelligence is **not** a generic template at this stage. It is a domain product layer built on `document-intelligence-mvp` until stable reusable patterns emerge.

## Dependency direction

```text
my-setup                  engineering/factory rules
   │
   ├── agent-eval-harness
   ├── ai-core
   │      │
   │      ▼
   └── ai-starter ──► specialized templates ──► customer projects

product track:
ai-starter patterns + existing product code
               │
               ▼
document-intelligence-mvp
               │
               ▼
Machine Intelligence domain layer
```

Rules:

- `ai-core` must not import application/domain frameworks.
- Templates must not duplicate generic runtime infrastructure.
- Machine Intelligence must extend current product models/services where possible, not fork a second backend.
- Every derived machine fact must carry evidence/provenance.

## Implementation order

1. `ai-core` — **Done**.
2. `agent-eval-harness` reuse — **Done**.
3. `ai-starter` base — **Done**, canonical baseline frozen at `7f91e3f394536164ffefcf320b4356ad24092702`.
4. `ai-template-rag` — **Done and merged**.
5. `ai-template-document` — **Done and merged**.
6. Finish Document Intelligence M6: **SIN-74 + SIN-77 + SIN-69 → SIN-70**.
7. In parallel only: Machine Intelligence **SIN-88 architecture/open-source audit**.
8. After SIN-70: **SIN-89 → SIN-90 → SIN-91 → SIN-92 → SIN-93 → SIN-94 → SIN-95 → SIN-96**.
9. Extract additional generic templates only after a repeated real pattern exists.

## Must not do by default

- rebuild Machine Intelligence in a new repository without a concrete repository-boundary reason;
- add a graph database just because the domain is a graph;
- add LangGraph/agents for deterministic parsing/traversal;
- add multiple AI providers before a concrete need;
- store derived facts without source evidence;
- use LLM guesses to bridge missing engineering links;
- create a second generic evaluation runner;
- replace existing Docling/Qdrant/Postgres paths without measured benefit.
