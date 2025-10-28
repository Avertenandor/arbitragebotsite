import Script from 'next/script';
import './mindmap.css';

export const metadata = {
  title: 'Интерактивная карта | ArbitroBot',
  description: 'Визуализация всех возможностей и функций платформы для работы с арбитражным ботом',
};

export default function MindMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* Mind Map Scripts */}
      <Script src="/mindmap-core.js" strategy="beforeInteractive" />
      <Script src="/mindmap-render.js" strategy="beforeInteractive" />
      <Script src="/mindmap.js" strategy="beforeInteractive" />
    </>
  );
}
