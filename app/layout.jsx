import './globals.css';

export const metadata = {
  title: '预约表',
  description: '周一/周三/周五 晚 19:00 - 22:30 预约',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
