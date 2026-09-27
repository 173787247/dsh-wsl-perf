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

## License

MIT
