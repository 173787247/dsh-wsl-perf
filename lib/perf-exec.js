import { runPowerShell } from "./wsl-host.js";
import { normalize } from "./perf.js";

/** The kit's one escaping rule: single-quote the value, doubling any apostrophe. */
function esc(s) {
  return "'" + String(s ?? "").replace(/'/g, "''") + "'";
}

function clamp(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/**
 * The script is built here, at the call site, the way every other plugin in the
 * kit does it: the PowerShell is written inline and the values are escaped as
 * they are interpolated. An earlier version of this file used a @@TOKEN@@
 * substitution table instead, which needed a template literal that ate the
 * backslashes in a regex and quoted every token twice.
 */
export function script(a) {
  return ((a) => `
$cpu = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
$os = Get-CimInstance Win32_OperatingSystem
$cs = Get-CimInstance Win32_ComputerSystem
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | ForEach-Object {
  @{ drive = $_.DeviceID; freeGB = [math]::Round($_.FreeSpace/1GB,1); totalGB = [math]::Round($_.Size/1GB,1) }
}
$procs = Get-Process | Sort-Object -Property WorkingSet64 -Descending | Select-Object -First ${a.top} | ForEach-Object {
  @{ name = $_.ProcessName; pid = $_.Id; memMB = [math]::Round($_.WorkingSet64/1MB,1); cpuSec = [math]::Round($_.CPU,1) }
}
ConvertTo-Json -Compress -Depth 5 @{
  cpuPercent = [math]::Round($cpu,1)
  memTotalMB = [math]::Round($os.TotalVisibleMemorySize/1KB,0)
  memFreeMB  = [math]::Round($os.FreePhysicalMemory/1KB,0)
  uptimeSec  = [int]((Get-Date) - $os.LastBootUpTime).TotalSeconds
  bootTime   = $os.LastBootUpTime.ToString('o')
  logicalProcessors = $cs.NumberOfLogicalProcessors
  disks = @($disk)
  processes = @($procs)
}`)(a);
}

export async function execute(args, config = {}) {
  const a = {
    name: typeof args?.name === "string" ? args.name : "",
    state: typeof args?.state === "string" ? args.state : "",
    log: typeof args?.log === "string" ? args.log : "System",
    path: typeof args?.path === "string" ? args.path : "",
    provider: typeof args?.provider === "string" ? args.provider : "",
    level: clamp(args?.level, 1, 5, 2),
    count: clamp(args?.count, 1, 200, 20),
    limit: clamp(args?.limit, 1, 400, 40),
    top: clamp(args?.top, 1, 40, 8),
    detail: Boolean(args?.detail),
    subkeys: Boolean(args?.subkeys),
    all: Boolean(args?.all),
    full: Boolean(args?.full),
    since: null,
  };



  const timeoutMs = clamp(config.timeoutMs, 1000, 120000, 30000);
  const { stdout } = await runPowerShell(script(a), { timeoutMs });
  const raw = JSON.parse(stdout.trim() || "{}");
  if (raw.error) return { ok: false, error: String(raw.error) };
  return { ok: true, ...normalize(raw) };
}
