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
