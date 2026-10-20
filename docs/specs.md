# Spec Proposal: Research Artifact Routing and Evidence Independence

Status: **Proposed** — not implemented. This document records the design
decision and plan produced by a multi-agent review (wiki, researcher, scout,
oracle passes) on 2026-10-20. Nothing in this spec has been applied to the
protocol files or to any wiki instance.

## Problem

Research-run artifacts and wiki-derived summaries have been landing in
`raw/` as if they were evidence. Verified instances in the live hub
(`~/wiki`):

- 73 researcher-lane digest notes in `topics/stacks/raw/notes/` with
  `source:` labels such as `"session researcher lane R1, run 975d8d38"`.
- 16 research files in `topics/inferences/raw/articles/` (contradicting
  that topic's own `config.md`, which reserves `raw/articles/` for public
  model info).
- Derivative wiki-query snapshots ingested as raw notes and then compiled
  into wiki articles that cite those notes in `sources:` — e.g.
  `topics/stacks/raw/notes/2026-10-16-mastra-user-project-scoping-wiki-query.md`
  (a snapshot listing 11 wiki paths as its evidence) cited by
  `wiki/concepts/mastra-user-project-scoping.md`.

Root cause is a protocol gap, verified across the skill references: the
generic ingest flow maps any supplied material to `raw/`, no rule states
where research synthesis belongs, no field or lint check distinguishes
workflow-generated synthesis from external evidence, and the confidence
rubric (`compilation.md` — "multiple sources with credibility score 4+
agree") would count a round-tripped artifact as a second agreeing source.
The defect is misplaced derivative material and obscured evidence lineage;
literal circularity and actual confidence inflation were observed as
risks, not proven in every case.

The user decision this spec encodes: **research reports and wiki-response
summaries must never be ingested into `raw/` as evidence.**

## Decision (Model B)

Research lives in the wiki as synthesis: durable findings are compiled into
`wiki/` articles; the report itself is preserved under `output/` with full
`sources:`. Supporting external evidence is ingested into `raw/`. The wiki
maintainer agent owns routing, ingestion, integration, citation repair, and
filing; the user never needs to name filesystem directories.

Rationale:

- Karpathy's original pattern routes "good answers" back into the wiki
  layer as new pages, not into raw sources ("Raw sources — your curated
  collection of source documents... your source of truth").
- The repo's own research pipeline already behaves this way (ingest
  selected external sources into `raw/`, compile into `wiki/`, playbook to
  `output/`, theses to `wiki/theses/`).
- External precedent converges (Graphiti/Zep: episodes are the ground
  truth stream, every derived fact traces back; W3C PROV-O: derived
  artifacts record dependencies, they are not re-sourced; Zettelkasten:
  literature notes stay separate from durable notes; Letta: curated
  knowledge split from historical record).

Rejected alternative (Model A — research never lives in the wiki, only
sources are ingested): workable, and it would not by itself stagnate the
wiki since external sources can still be compiled. Rejected because it
adds an unnecessary storage boundary (separate RAG with no shared
provenance chain) and discards the pattern's compounding principle for
this user's stated needs.

Scope of the rule: **this workflow's own research reports and wiki-derived
summaries stay out of `raw/`.** Published peer-reviewed reviews and
meta-analyses remain legitimate raw sources; the confidence rubric already
recognizes them.

## Change 1: Destination-routing rule for ordinary language

"Save this research," "ingest this research," and "turn this answer into a
concept" trigger classification **before any write**:

| Submitted material | Default handling |
|---|---|
| Existing wiki answer worth retaining | Integrate into an existing article or create a justified concept/topic article; reuse the answer's underlying raw evidence. A wiki answer may be captured into the wiki — it is routed to its proper location per this table (article update, concept/topic article, or `output/`); it is never captured into `raw/` |
| Research report | Preserve the report in `output/` when the report itself is wanted; integrate durable findings into `wiki/` articles citing real raw sources |
| Supporting external sources | Reuse matching existing raw captures or ingest the missing sources into `raw/` |
| Unverified inference | Preserve as a labeled hypothesis/analysis; never upgrade to an established factual claim |

Rules: no automatic double-write (output artifact plus new concept) for
every answer — an existing-article update may suffice. Ambiguous requests
default to asking one clarifying question rather than guessing `raw/`.
"Never self-capture into `raw/`" means exactly that: the prohibition is on
the `raw/` destination, not on preserving the answer at all — preservation
is expected and routed by the table above.

Protocol files: canonical rules in `claude-plugin/skills/wiki-manager/references/ingestion.md`
and `references/compilation.md`; routing contract in root `AGENTS.md`
(Ingest section), `claude-plugin/skills/wiki-manager/SKILL.md`, and
`claude-plugin/commands/wiki.md`.

## Change 2: One acceptance procedure for wiki-created and external research

- **Wiki-agent-created knowledge (B-i):** retain the cited raw evidence,
  evaluate the proposed synthesis, update or create the appropriate
  article. A wiki answer is never captured into `raw/` as its own source.
- **External research (B-ii):** receive the report plus its citation
  manifest; separate prior wiki context from fresh evidence and new
  interpretation; preserve the report under `output/` when wanted;
  integrate findings into `wiki/`.
- **Source-materialization requirement (both paths):** an ingested
  research must have its own sources referenced. Every cited source that
  does not already exist in `raw/` is ingested into `raw/` (or reused
  where a matching capture exists). A research whose load-bearing findings
  cite sources absent from `raw/` is not marked integrated: missing
  captures are fetched and ingested, or — when genuinely uningestible
  (paywalled, offline, non-public) — recorded explicitly as unresolved
  external references with the finding's confidence reduced accordingly.
  Integration never proceeds on an invisible evidence chain.
- **Both paths:** repeated summaries of the same evidence do not increase
  corroboration and must not raise confidence. A bibliography is not proof
  that a cited source supports a finding — acceptance inspects the
  relevant evidence. Unique observations or experiments inside a report
  are preserved as separate evidence records, distinct from the report's
  interpretation. Research that used an earlier revision of a wiki article
  must record that revision; it must not be represented as using current
  contents.

Protocol files: `claude-plugin/commands/research.md`,
`references/research-infrastructure.md`, `commands/output.md`.

## Change 3: MCP submission envelope (proposal)

MCP-exposed research submission uses a structured envelope, not an
automatic raw-ingest endpoint for reports:

```json
{
  "target_wiki": "stacks",
  "intent": "preserve_and_integrate",
  "artifact": {
    "kind": "research_report",
    "title": "...",
    "content": "..."
  },
  "wiki_inputs": [
    {"path": "wiki/concepts/example.md", "revision_or_hash": "..."}
  ],
  "external_sources": [
    {"id": "s1", "url": "...", "retrieved_at": "...", "capture_ref": "..."}
  ],
  "findings": [
    {"text": "...", "evidence": ["s1"], "status": "supported"}
  ]
}
```

Semantics:

- `intent` values: `preserve_and_integrate` (default), `preserve_only`
  (report to `output/`, no compilation), `sources_only` (ingest evidence,
  discard report).
- Unknown revisions or missing captures must be represented honestly.
  They never block saving a report, but they constrain what the maintainer
  can verify and compile; affected findings carry reduced confidence.
- The wiki maintainer is the single writer. It returns actual
  destinations, reused/ingested source mappings, per-finding disposition,
  and unresolved claims.

## Change 4: Lint detection (no semantic auto-repair)

Current lint (`scripts/llm-wiki:1440` check_source_provenance and the
C4/C18 families) validates mechanical placement and source resolution; it
cannot detect workflow-generated synthesis in `raw/`, and this spec does
not promise that it ever will semantically.

- Add a review finding to
  `claude-plugin/skills/wiki-manager/references/linting.md` for suspected
  workflow-generated synthesis in `raw/` (e.g. raw notes whose `source:`
  is a session/researcher/wiki-query label and whose body cites wiki
  paths as its evidence).
- Do **not** flag every `source: session` label — legitimate feedback and
  observation notes use it.
- Never auto-move such files; surface with a suggested migration command.
  Content migration stays human-gated.
- Extend `references/audit.md` to grade derivative evidence and
  unsupported citations (`weak-evidence` / `provenance-gap` states already
  exist; add the derivative dimension).
- If deterministic CLI detection is later implemented, the rule lands in
  `scripts/llm-wiki` plus all synced copies, with test fixtures under
  `tests/fixtures/`.

## Change 5: Migration for existing misplaced research records

Human-gated, dry-run-first, per the repo's migration principles. Steps:

1. Build a candidate list and dependency map (raw research notes, the
   compiled articles citing them, the evidence each note points at).
2. For each confirmed misplaced report:
   - preserve the report in `output/` with its historical provenance;
   - resolve its cited evidence to existing raw captures, or obtain the
     missing captures;
   - repair dependent articles' `sources:` to cite the real evidence;
   - review affected claims;
   - remove the raw copy only as part of the explicitly authorized
     migration, preserving recovery history.
3. Do **not** keep these reports in `raw/` with a marker; do not
   auto-retract otherwise valid conclusions; moving files without
   evidence repair is insufficient.

## Rollout and sync

All protocol changes go into canonical `claude-plugin/` sources first, then
are propagated with `scripts/sync-codex-plugin.sh` and
`scripts/sync-opencode-plugin.sh` (three copies in lockstep), following the
dev contract in `CLAUDE.md`. Lint-rule schema changes must update
`references/linting.md` in the same change per that file's own instruction.

## Testing and acceptance

- Protocol-level: fixtures for each routing table row (wiki answer,
  research report, external sources, unverified inference); evaluation
  cases for behavioral routing since it is agent-executed, not
  deterministic.
- Lint: fixture wikis containing (a) a session-labeled observation note
  (must NOT be flagged), (b) a wiki-query snapshot raw note cited by an
  article (MUST be flagged as review finding), (c) a researcher digest
  raw note (flagged).
- Migration: dry-run output on a copy of the stacks topic showing the
  candidate list; verify no raw removal occurs without `--apply`; verify
  citation repair resolves under the Source Reference Resolution protocol.
- Routing behavior: a request to ingest a research report produces
  `raw/` writes for its missing cited sources while the report body lands
  in `output/` or `wiki/`, never in `raw/`; the same request for a wiki
  answer produces no raw capture of the answer.
- Acceptance: after rollout, asking "ingest this research" never stores
  the research report itself (or a wiki answer) under `raw/` — but it
  must produce `raw/` writes for the research's cited sources that are
  missing from the wiki; asking "make this a concept" produces a wiki
  article citing real raw sources; a preserved research references every
  cited source, with missing sources ingested into `raw/` or explicitly
  recorded as unresolved; an MCP submission round-trips the envelope and
  returns destinations plus unresolved claims.

## Assumptions and open items

- Model-tier contribution to the original incident is unproven; the
  procedure gap is treated as the sole actionable cause.
- The `mastra-user-project-scoping` chain is treated as misplaced
  derivative material; whether it caused literal confidence inflation was
  not established (article confidence is currently `medium`).
- A raw-layer `derived_from` field is deliberately **not** introduced:
  routing these artifacts out of `raw/` removes the need. Dependency
  metadata lives on the retained `output/` artifact (`sources:` plus
  recorded wiki-input revisions).
- The MCP envelope is a proposal; no MCP endpoint exists yet.
- Cleanup scope of the live wiki (which of the ~89 identified research
  notes are confirmed misplaced vs. legitimate distillations of freshly
  fetched external material) remains to be produced as the Change-5
  candidate list.

## Provenance

Produced 2026-10-20 from: Karpathy's LLM Wiki gist (primary source, read
verbatim); repo protocol files (`claude-plugin/skills/wiki-manager/references/`,
`claude-plugin/commands/`); live wiki inspection (`~/wiki/topics/{stacks,deployment,inferences}`);
external precedent (Graphiti/Zep, W3C PROV-O, Andy Matuschak/Zettelkasten,
Letta); oracle review pass.