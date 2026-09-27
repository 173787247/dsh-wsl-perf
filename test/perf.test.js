import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalize, format, parameters } from "../lib/perf.js";

describe("perf", () => {
  it("coerces counters and defaults missing ones to zero", () => {
    const v = normalize({ cpuPercent: "12.5", memTotalMB: 32768, memFreeMB: null });
    assert.equal(v.cpuPercent, 12.5);
    assert.equal(v.memTotalMB, 32768);
    assert.equal(v.memFreeMB, 0);
  });
  it("defaults absent collections to empty arrays", () => {
    const v = normalize({});
    assert.deepEqual(v.disks, []);
    assert.deepEqual(v.processes, []);
  });
  it("reports memory as used over total", () => {
    const out = format(normalize({ cpuPercent: 5, memTotalMB: 1000, memFreeMB: 250 }));
    assert.match(out, /cpu=5%/);
    assert.match(out, /mem=750\/1000MB/);
  });
  it("declares top as a bounded parameter", () => {
    assert.equal(parameters().properties.top.type, "number");
    assert.equal(parameters().additionalProperties, false);
  });
});

// ── uptime and per-process cpu, added after the first release ───────────────
describe("the richer counters", () => {
  it("passes uptime and core count through", () => {
    const v = normalize({ uptimeSec: 90061, logicalProcessors: 32 });
    assert.equal(v.uptimeSec, 90061);
    assert.equal(v.logicalProcessors, 32);
  });
  it("renders uptime as days and hours", () => {
    const out = format(normalize({ uptimeSec: 90061 }));
    assert.ok(out.includes("uptime: 1d 1h"), out);
  });
  it("reports per-process cpu seconds", () => {
    const out = format(normalize({ processes: [{ name: "x", pid: 1, memMB: 2, cpuSec: 12.5 }] }));
    assert.ok(out.includes("cpu 12.5s"), out);
  });
});
