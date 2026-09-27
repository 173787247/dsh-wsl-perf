import { detectWsl } from "./lib/wsl-host.js";
import * as core from "./lib/perf.js";
import { execute } from "./lib/perf-exec.js";

export const name = "dsh-wsl-perf";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  const wsl = detectWsl();

  ctx.systemPrompt.section({
    name: "tool:win_perf",
    order: 214,
    text: "Use win_perf for WSL/Windows interop: Windows host performance counters from WSL: CPU, memory, disk and top processes.",
  });

  ctx.tools.register({
    name: "win_perf",
    description: "Windows host performance counters from WSL: CPU, memory, disk and top processes.",
    parameters: core.parameters(),
    output: {
      schema: core.outputSchema(),
      render: (_args, value) => [{ type: "text", text: core.format(value) }],
    },
    timeoutMs: Number(config.timeoutMs) > 0 ? Number(config.timeoutMs) : 30_000,
    isConcurrencySafe: () => true,
    async execute(args) {
      if (!wsl) return { ok: false, error: "not running in WSL" };
      try {
        return await execute(args, config);
      } catch (error) {
        return { ok: false, error: String(error?.message ?? error) };
      }
    },
    presentCall: () => ({ card: "generic", title: "win_perf" }),
    presentResult: (_args, result) => ({ card: "generic", title: "win_perf", content: result?.content }),
  });
}
