// Pure side of perf: normalisation and formatting, testable without Windows.
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

export function normalize(raw) {
  return ((raw) => ({
      cpuPercent: num(raw.cpuPercent),
      memTotalMB: num(raw.memTotalMB), memFreeMB: num(raw.memFreeMB),
      uptimeSec: num(raw.uptimeSec), bootTime: String(raw.bootTime ?? ""),
      logicalProcessors: num(raw.logicalProcessors),
      disks: (raw.disks || []).map((d) => ({ drive: String(d.drive ?? ""), freeGB: num(d.freeGB), totalGB: num(d.totalGB) })),
      processes: (raw.processes || []).map((p) => ({ name: String(p.name ?? ""), pid: num(p.pid), memMB: num(p.memMB), cpuSec: num(p.cpuSec) })),
    }))(raw ?? {});
}

// Dispatch on the shape of the result rather than making the caller say which
// formatter to use: a result carries either `detail`, or `subkeys`, or neither.
export function format(v) {
  const withOk = { ok: true, ...v };
  if (withOk.detail && typeof formatDetail === "function") return formatDetail(withOk);
  if (withOk.subkeys && typeof formatKeys === "function") return formatKeys(withOk);
  return ((v) => {
      const used = v.memTotalMB - v.memFreeMB;
      const days = Math.floor(v.uptimeSec / 86400), hours = Math.floor((v.uptimeSec % 86400) / 3600);
      const l = [`win_perf ok=${v.ok} cpu=${v.cpuPercent}% (${v.logicalProcessors} cores)`];
      l.push(`  memory: ${used}/${v.memTotalMB}MB`);
      l.push(`  uptime: ${days}d ${hours}h`);
      for (const d of v.disks || []) l.push(`  ${d.drive} ${d.freeGB}GB free of ${d.totalGB}GB`);
      for (const p of v.processes || []) l.push(`  ${p.name} (pid ${p.pid}) ${p.memMB}MB  cpu ${p.cpuSec}s`);
      if (v.error) l.push(`error: ${v.error}`);
      return l.join("\n");
    })(withOk);
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
