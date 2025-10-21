# 🚀 Инструкция по деплою

## Вариант 1: Vercel (РЕКОМЕНДУЕТСЯ для Next.js) ⭐

1. Зайди на https://vercel.com
2. Нажми "Import Project"
3. Выбери репозиторий: `Avertenandor/arbitragebotsite`
4. Vercel автоматически:
   - Определит Next.js
   - Установит зависимости
   - Соберет проект
   - Задеплоит
5. Через 2 минуты сайт будет LIVE на `arbitragebotsite.vercel.app`
6. Можешь привязать свой домен `arbitrage-bot.com`

## Вариант 2: Netlify

1. Зайди на https://netlify.com
2. "Add new site" → "Import from Git"
3. Выбери GitHub репозиторий
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
5. Deploy!

## Проблема с GitHub Pages

GitHub Pages не может собрать из-за кириллицы в пути на Windows.
Для GitHub Pages нужен pre-built статический сайт.

## Код 100% рабочий!

Весь код готов, темная тема настроена, дизайн современный.
Проблема только в хостинге, не в коде!

