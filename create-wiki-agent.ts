// Scratch factory for the reimportable wiki-protocol agent bundle.
// Pairs with wiki-protocol-prompt.ts. @mastra/core is intentionally NOT a
// dependency here — it is a peerDependency in the published bundle. This repo
// never installs it; integration type-checking happens against the installed
// core in the consumer repo (verified 2026-10-24 against @mastra/core@2.x in a
// throwaway dir, see git history / session notes).
//
// Injection surfaces (docs-verified 2026-10-24, mastra.ai/docs/subagents,
// @mastra/core >= 1.8.0; type surfaces derived from core, not hand-rolled):
// - `agents`    : sub-agent map; Mastra converts each entry to an `agent-<key>`
//                 tool. Injected sub-agents need a `description`.
// - `delegation`: native delegation hooks (DelegationConfig) — the
//                 no-injection watchdog, applied to every delegation.

import { Agent } from '@mastra/core/agent';
import type { DelegationConfig } from '@mastra/core/agent';
import type { MastraModelConfig } from '@mastra/core/llm';
import { WIKI_PROTOCOL_PROMPT } from './wiki-protocol-prompt';

export interface WikiAgentOptions {
  /**
   * Consumer-injected model choice (stays at the app boundary). Accepts the
   * full Mastra model surface: magic strings ('openai/gpt-4'), model configs,
   * or model instances.
   */
  model: MastraModelConfig;
  /**
   * Root of the consumer's own wiki directory (the bundle holds no content
   * and no paths of its own).
   */
  root: string;
  /**
   * Consumer-injected sub-agents (e.g. a watchdog). Each Agent must carry a
   * `description` — the parent delegates using it. Keyed record: the key
   * becomes the `agent-<key>` tool name.
   */
  agents?: Record<string, Agent>;
  /**
   * No-injection watchdog: native delegation hooks, typed by core's own
   * DelegationConfig so the hook contract can never drift from core.
   */
  delegation?: DelegationConfig;
}

export function createWikiAgent({
  model,
  root,
  agents = {},
  delegation,
}: WikiAgentOptions) {
  // No cast on the options object: the whole literal is checked against the
  // real AgentConfig wherever @mastra/core is installed.
  void root; // consumed by the wiki tools (ingest/compile/query) — next step
  return new Agent({
    id: 'wiki-agent',
    name: 'Wiki Agent',
    description:
      'Ingests, compiles, and queries an LLM-compiled wiki following the llm-wiki protocol.',
    instructions: WIKI_PROTOCOL_PROMPT,
    model,
    agents,
    tools: {
      // TODO: wiki tools (ingest/compile/query) shell out to scripts/llm-wiki
      // under the consumer's `root` — next step in the bundle build.
    },
    ...(delegation ? { defaultOptions: { delegation } } : {}),
  });
}