import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';
import './globals.css';

const serif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif-zen',
  display: 'swap',
});

const sans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans-zen',
  display: 'swap',
});

export const metadata = {
  title: '禅意积功德',
  description: '电子木鱼与钟，记录每一份善念与安定。',
};

/**
 * 根布局：注入字体 CSS 变量、全屏底色由子页面覆盖
 * @param {{ children: React.ReactNode }} props
 */
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-zen-paper font-sans text-zen-ink">{children}</body>
    </html>
  );
}
