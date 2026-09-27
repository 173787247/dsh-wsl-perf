import { runPowerShell } from "./wsl-host.js";
import { normalize } from "./perf.js";


const PRELUDE = "$ErrorActionPreference = 'Stop'\n# The console codepage mangles non-ASCII output; force UTF-8.\n[Console]::OutputEncoding = [Text.Encoding]::UTF8";

/** Every parameter reaches PowerShell as a single-quoted literal. */
function q(s) {
  return "'" + String(s ?? "").replace(/'/g, "''") + "'";
}

function clamp(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

// Substitution runs on @@TOKEN@@ placeholders rather than bare words: a plain
// replace("NAME", ...) also matches inside LOGNAME, which silently corrupts the
// script. Each token appears at most once.
export function buildScript(a) {
  const values = {
    NAME: q(a.name),
    STATE: q(a.state),
    LIMIT: String(a.limit),
    COUNT: String(a.count),
    LOGNAME: q(a.log),
    LEVEL: String(a.level),
    TOPN: String(a.top),
    REGPATH: q(a.path),
    VALNAME: q(a.name),
  };
  return PRELUDE + "\n" + TEMPLATE.replace(/@@(\w+)@@/g, (_, k) => values[k] ?? "");
}

const TEMPLATE = `

$cpu = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
$os = Get-CimInstance Win32_OperatingSystem
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | ForEach-Object {
  @{ drive = $_.DeviceID; freeGB = [math]::Round($_.FreeSpace/1GB,1); totalGB = [math]::Round($_.Size/1GB,1) }
}
$procs = Get-Process | Sort-Object -Property WorkingSet64 -Descending | Select-Object -First @@TOPN@@ | ForEach-Object {
  @{ name = $_.ProcessName; pid = $_.Id; memMB = [math]::Round($_.WorkingSet64/1MB,1) }
}
ConvertTo-Json -Compress -Depth 5 @{
  cpuPercent = [math]::Round($cpu,1)
  memTotalMB = [math]::Round($os.TotalVisibleMemorySize/1KB,0)
  memFreeMB  = [math]::Round($os.FreePhysicalMemory/1KB,0)
  disks = @($disk)
  processes = @($procs)
}
`;

export async function execute(args, config = {}) {
  const a = {
    name: typeof args?.name === "string" ? args.name : "",
    state: typeof args?.state === "string" ? args.state : "",
    log: typeof args?.log === "string" ? args.log : "System",
    path: typeof args?.path === "string" ? args.path : "",
    level: clamp(args?.level, 1, 5, 2),
    count: clamp(args?.count, 1, 200, 20),
    limit: clamp(args?.limit, 1, 400, 40),
    top: clamp(args?.top, 1, 40, 8),
  };
  
  const timeoutMs = clamp(config.timeoutMs, 1000, 120000, 30000);
  const { stdout } = await runPowerShell(buildScript(a), { timeoutMs });
  const raw = JSON.parse(stdout.trim() || "{}");
  if (raw.error) return { ok: false, error: String(raw.error) };
  return { ok: true, ...normalize(raw) };
}
