---
description: Parallel external research, ingestion, and compilation for this wiki hub
argument-hint: "[--wiki <topic>] [--deep] [--report-only] <question or subject>"
---

Run the following request as a wiki Research operation:

$@

## Scope and ownership

Use `~/wiki/` as the hub for this invocation. Read its `AGENTS.md` and apply its Research protocol and the relevant Ingest, Compile, and Structural Guardian rules. If available, load the wiki-manager skill for the operation. Keep all wiki writes inside the selected topic under this hub.

The parent session owns decomposition, subagent launches, credibility review, ingestion, and compilation. Launch `researcher` agents directly from the parent; children investigate their assigned question and return evidence. This invocation explicitly authorizes parallel research subagents.

Interpret `--wiki <topic>`, `--deep`, and `--report-only` as instructions in this request. `--deep` selects the protocol's deep research mode. `--report-only` returns the synthesis in chat without writing wiki content, indexes, logs, or session files. By default, complete search, ingest, and compile. Honor other requested Research modifiers through the hub protocol.

## Execution

1. **Establish the target.** Read the hub registry and index. Use the explicitly named topic, or the active topic when it clearly fits the request; otherwise compare topic scopes and select the unique matching active topic. If several topics fit or none fits, ask one short question before dispatch or writes. Require explicit instructions to create a topic or include an archived topic. Read the selected topic's config, indexes, topic guide, and relevant articles. Check recovery state when the protocol requires it. Existing sources provide context and help deduplicate discoveries.

2. **Decompose and launch.** Classify the request as a question, subject exploration, or thesis. For questions, assign 3–5 distinct answer-bearing subquestions. For subject exploration and deep or thesis modes, use the agent counts and evidence angles in the hub protocol. Enable pi-subagents if needed, read its delegation guidance, and launch all independent `researcher` tasks in one asynchronous workflow with fresh context and the selected topic as their working directory. Keep shared wiki files under one parent writer. Give each child the objective, bounded wiki context, scope, exclusions, source-quality criteria, and return format. Require external discovery with Donsetch search and fetch tools; use Context7 first for library/API documentation when available. Each child must inspect primary sources, seek contrary evidence, and return findings, exact source URLs, supporting passages, dates/versions, confidence, and gaps. Assign code inspection only when the request names a relevant repository. Require children to return evidence without editing wiki files or launching further agents.

3. **Review the evidence.** Wait for the launched workflow's completion through native async notification. Deduplicate discoveries against each other and existing raw sources. Apply the hub protocol's credibility review before ingestion. Verify important claims against fetched source text, distinguish first-party descriptions from independent validation, and resolve contradictions where evidence allows. Research requires actual external searches and source inspection; a local-only review does not satisfy it. If a child fails, stop and report the failure, preserving recovery state; do not silently retry, switch models, or substitute local analysis. Report missing tools or inaccessible evidence as gaps.

4. **Compile the result.** In default mode, ingest useful new evidence as immutable raw sources with provenance, then compile all sources ingested by this run sequentially. Apply the topic guide, synthesize into coherent articles, and preserve exact source paths, confidence, dual-links, and bidirectional references. Generate the question-mode playbook or thesis deliverable when required by the protocol. Update affected indexes, logs, and session provenance, and run structural checks appropriate to the writes. In report-only mode, synthesize directly from reviewed evidence without wiki writes.

5. **Deliver and verify.** Answer the original request with citations, separating prior wiki knowledge from new evidence where that distinction matters. State conclusions, disagreements, limitations, and remaining gaps. Report actual researcher completion counts, reviewed sources, and any created or updated article/output paths. Claim completion only after the dispatched research has returned and required ingestion, compilation, and structural checks have finished. Keep the final response concise and give one concrete follow-up when a gap remains.
