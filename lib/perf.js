// Pure side of dsh-wsl-perf: normalisation and formatting, testable without Windows.
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

export function normalize(raw) {
  return ((raw) => ({
      cpuPercent: num(raw.cpuPercent),
      memTotalMB: num(raw.memTotalMB), memFreeMB: num(raw.memFreeMB),
      disks: (raw.disks || []).map((d) => ({ drive: String(d.drive ?? ""), freeGB: num(d.freeGB), totalGB: num(d.totalGB) })),
      processes: (raw.processes || []).map((p) => ({ name: String(p.name ?? ""), pid: num(p.pid), memMB: num(p.memMB) })),
    }))(raw ?? {});
}

export function format(v) {
  return ((v) => {
      const used = v.memTotalMB - v.memFreeMB;
      const l = [`win_perf ok=${v.ok} cpu=${v.cpuPercent}% mem=${used}/${v.memTotalMB}MB`];
      for (const d of v.disks || []) l.push(`  ${d.drive} ${d.freeGB}GB free of ${d.totalGB}GB`);
      for (const p of v.processes || []) l.push(`  ${p.name} (pid ${p.pid}) ${p.memMB}MB`);
      if (v.error) l.push(`error: ${v.error}`);
      return l.join("\n");
    })({ ok: true, ...v });
}

export function parameters() {
  return {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "top": {
      "type": "number",
      "description": "How many processes to list (default 8, max 40)."
    }
  }
};
}

export function outputSchema() {
  return { type: "object", additionalProperties: true };
}
