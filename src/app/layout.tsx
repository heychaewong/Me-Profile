import type { Metadata, Viewport } from 'next';
import Stage from '@/components/scene/Stage';
import { ThemeToggle, themeInitScript } from '@/components/ui/ThemeToggle';
import { profile } from '@/data/profile';
import './globals.css';

export const metadata: Metadata = {
  title: `${profile.name}의 취향 소개`,
  description: '내 안의 세 자아가 소개하는 나의 취향',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF8F4' },
    { media: '(prefers-color-scheme: dark)', color: '#17151F' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <Stage />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
