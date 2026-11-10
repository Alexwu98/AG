/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // 让构建在同一进程内运行，避免在沙箱/CI 环境下派生子进程失败（EPERM）
    webpackBuildWorker: false,
    // 类型检查用进程内 worker 线程，而不是 fork 子进程
    workerThreads: true,
  },
};

export default nextConfig;
