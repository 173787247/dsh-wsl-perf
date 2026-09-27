# dsh-wsl-perf

> 从 WSL 读取 Windows 宿主性能计数器：CPU、内存、磁盘与占用最高的进程。

DeepSeek Harness 插件：Windows host performance counters from WSL: CPU, memory, disk and top processes.

属于 **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)** 的一部分。

[English → README.md](./README.md)

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-perf
```

## 用法

```
win_perf              # cpu, memory, disks, top processes
win_perf top=20       # more processes
```

## 说明

Counters come from `Get-CimInstance Win32_Processor` and `Win32_OperatingSystem`.
Memory figures are the host's, not the WSL VM's.

## 依赖

- Windows + WSL，DeepSeek Harness 跑在 WSL 里。

## 测试

```sh
npm test
```

单元测试在任何平台都能跑；实时测试在 WSL 之外自动跳过。

## 许可

MIT
