# 预约表

一个公开可访问的在线预约表：**周一 / 周三 / 周五** 晚上 **19:00–22:30**，每半小时一个时段。任何人都能打开网址预约，只需填写名字/微信名；后台有隐藏入口供管理员查看和取消预约。

## 功能

- **预约页**（所有人可见）：按日期展示周一/周三/周五的 8 个时段（19:00、19:30、20:00、20:30、21:00、21:30、22:00、22:30）
- **每个时段只约 1 组**：预约时填写「一起来的人数（含自己）」，可带 2–3 个朋友一起
- **防重复**：已被约的时段会显示名字并锁住，不能再约
- **自动校验**：只能约周一/周三/周五；过去的时段无法预约
- **后台管理**（隐藏入口）：查看所有预约、一键取消
- **中文界面**，手机（微信内打开）体验友好

## 访问地址（部署后）

| 用途 | 地址 |
|------|------|
| 预约页（发给大家） | `https://你的域名.vercel.app/` |
| 后台管理（仅你自己） | `https://你的域名.vercel.app/admin` |

> 后台没有密码，靠「地址不公开」来保护。请**不要把 `/admin` 这个链接发给别人**。

---

## 一、部署上线（免费，约 10–15 分钟）

整个项目用 **Vercel** 免费托管，用 **Vercel KV** 免费存数据。你需要两个免费账号：GitHub 和 Vercel。

### 第 1 步：注册 GitHub 并创建仓库

1. 打开 <https://github.com> 注册账号（用邮箱即可）
2. 登录后点击右上角 **+** → **New repository**
3. 仓库名随便填（如 `booking`），选 **Public**（或 Private 都行），点 **Create repository**

### 第 2 步：把代码上传到 GitHub

有两种方式，任选其一：

**方式 A（简单，适合不熟悉命令行）：**
1. 进入刚创建的仓库页面，点 **uploading an existing file**（或 **Add file → Upload files**）
2. 把本项目里**除了 `node_modules` 文件夹**之外的所有文件/文件夹拖进去
3. 点 **Commit changes**

**方式 B（用 git 命令行）：**
```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/你的用户名/booking.git
git push -u origin main
```

### 第 3 步：在 Vercel 导入项目

1. 打开 <https://vercel.com>，用 **Continue with GitHub** 登录
2. 点 **Add New → Project**，选择你刚上传的 GitHub 仓库 → **Import**
3. Vercel 会自动识别为 Next.js 项目，直接点 **Deploy**

> ⚠️ 先别急着用，还要配置数据库（下一步），否则预约数据**不会保存**。

### 第 4 步：配置 KV 数据库（重要！）

预约数据需要存到数据库里，否则重启/重新部署后数据会丢失。

1. 在 Vercel 项目页面，点顶部 **Storage** 标签
2. 点 **Create Database**，选择 **KV (Durable Redis)**
3. 起个名字（如 `booking-kv`），选一个离你近的区域，点 **Create**
4. 创建时选择 **Connect** 到你的项目，它会自动把 `KV_REST_API_URL`、`KV_REST_API_TOKEN` 等环境变量注入项目
5. 回到项目 **Deployments** 页，点 **Redeploy**（重新部署一次，让环境变量生效）

> 也可以在项目的 **Settings → Environment Variables** 里手动添加这两个变量：`KV_REST_API_URL` 和 `KV_REST_API_TOKEN`，值从 KV 数据库详情页复制。

### 第 5 步：完成

部署完成后，Vercel 会给你一个网址（形如 `https://booking-xxxx.vercel.app`）：

- 把主地址发给来预约的人
- 你自己用主地址后面加 `/admin` 打开后台

---

## 二、本地运行（可选，仅开发用）

```bash
npm install
npm run dev
```

浏览器打开 <http://localhost:3000>。本地开发不需要配置 KV，会用本地文件暂存数据。

---

## 三、如何修改配置

| 想改什么 | 改哪个文件 |
|----------|-----------|
| 开放时间 / 时段间隔 | `lib/slots.js` 里的 `SLOT_TIMES` |
| 开放星期（周一三五） | `lib/slots.js` 里的 `BOOKABLE_WEEKDAYS` |
| 预约页显示几周 | `app/page.jsx` 里的 `generateDates(4)` |
| 后台地址 | `app/admin` 文件夹名（改文件夹名即改地址） |

---

## 四、安全提醒

- 后台 `/admin` 没有密码，**链接一定不要外传**。如果需要加密码保护，可以告诉我。
- 预约数据保存在 Vercel KV 免费额度内，通常够用；如果人数特别多，可再升级。
