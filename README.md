# dsh-wsl-perf

DeepSeek Harness plugin: Windows host performance counters from WSL: CPU, memory, disk and top processes.

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 → README.zh.md](./README.zh.md)

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-perf
```

## Usage

```
win_perf              # cpu, memory, disks, top processes
win_perf top=20       # more processes
```

## Notes

Counters come from `Get-CimInstance Win32_Processor` and `Win32_OperatingSystem`.
Memory figures are the host's, not the WSL VM's.

## Requirements

- Windows with WSL, and DeepSeek Harness running inside it.

## Tests

```sh
npm test
```

The unit tests run anywhere. The live tests are skipped outside WSL.

## Compatibility

| Field | Value |
|-------|-------|
| **Plugin** | `dsh-wsl-perf` **0.1.0** |
| **Minimum dsh** | ≥ **0.1.2** (web UI one-shot `?token=` on Windows relay `:3081`) |
| **Latest verified** | See [dsh-wsl-kit Compatibility](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) (currently **`0.2.0-rc.2`**) — single source of truth for the suite |
| **Kit set** | `full` or install alone |

## License

MIT
