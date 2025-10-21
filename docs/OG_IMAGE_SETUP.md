# 📸 Настройка Open Graph превью для соцсетей

## Что это?

Open Graph изображение - это превью, которое показывается когда вы делитесь ссылкой на сайт в:
- 📱 Telegram
- 💬 VK
- 👍 Facebook
- 🐦 Twitter
- 💼 LinkedIn
- И других соцсетях

---

## 🎯 Как создать изображение

### Вариант 1: Через HTML-генератор (РЕКОМЕНДУЕТСЯ)

1. Откройте файл `public/og-image-generator.html` в браузере
2. Вы увидите красивое превью размером 1200x630px
3. Нажмите кнопку **"⬇️ Скачать PNG"**
4. Файл скачается как `opengraph-image.png`

### Вариант 2: Скриншот через DevTools

1. Откройте `public/og-image-generator.html` в Chrome/Edge
2. Нажмите **F12** (открыть DevTools)
3. Найдите элемент `<canvas id="og-canvas">`
4. **Правый клик** → **"Capture node screenshot"**
5. Изображение сохранится автоматически

### Вариант 3: Использовать SVG (временно)

Используйте `public/opengraph-image.svg` как временное решение.

---

## 📁 Куда поместить файл

После скачивания PNG:

1. Переименуйте файл в **`opengraph-image.png`** (если ещё не так)
2. Поместите в папку **`public/`**
3. Удалите старый файл `public/opengraph-image.png.txt`

**Структура:**
```
public/
  ├── opengraph-image.png      ✅ (новый файл)
  ├── opengraph-image.svg       ✅ (запасной вариант)
  ├── og-image-generator.html   ✅ (генератор)
  ├── logo.svg
  └── favicon.svg
```

---

## 🚀 Деплой

После добавления изображения:

```bash
npm run build
cd out
git init
git add -A
git commit -m "feat: добавлено OG превью для соцсетей"
git branch -M gh-pages
git remote add origin https://github.com/Avertenandor/arbitragebotsite.git
git push -f origin gh-pages
```

Или используйте скрипт:
```bash
npm run deploy  # если настроен
```

---

## ✅ Проверка работы

### 1. Facebook Debugger
https://developers.facebook.com/tools/debug/

Введите: `https://arbitrage-bot.com`

### 2. Telegram Preview
- Отправьте ссылку `https://arbitrage-bot.com` себе в Сохранённые сообщения
- Должно показаться красивое превью

### 3. VK Debug
https://vk.com/dev/pages.clearCache

Очистите кэш для: `https://arbitrage-bot.com`

### 4. Twitter Card Validator
https://cards-dev.twitter.com/validator

---

## 🎨 Дизайн превью

### Текущие элементы:

1. **Логотип** 🤖 в левом верхнем углу
2. **Название** "ArbitroBot" с градиентом
3. **Подзаголовок** "DEX Арбитражный Робот"
4. **3 статистики:**
   - 📈 30-72% (Доход в день)
   - ⚡ 24/7 (Автоматически)
   - 🔗 BSC (BNB Smart Chain)
5. **URL** внизу: arbitrage-bot.com

### Цвета:
- Фон: Тёмный градиент (#0A0A0F → #13131A → #1C1C24)
- Акценты: #00D9FF (голубой), #00FFA3 (зелёный), #9D4EDD (фиолетовый), #FFB800 (жёлтый)

---

## 🔧 Редактирование дизайна

Если хотите изменить дизайн:

1. Откройте `public/og-image-generator.html`
2. Найдите функцию `drawOGImage()`
3. Измените:
   - Тексты
   - Цвета
   - Позиции элементов
   - Шрифты
4. Обновите страницу в браузере
5. Скачайте новый PNG

---

## 📊 Технические требования

### Размеры для разных платформ:

| Платформа | Оптимальный размер | Минимум |
|-----------|-------------------|---------|
| Facebook  | 1200x630px        | 600x315px |
| Twitter   | 1200x675px        | 600x335px |
| VK        | 1200x630px        | 537x240px |
| Telegram  | 1200x630px        | -         |
| LinkedIn  | 1200x627px        | 1200x627px |

**Наш размер:** 1200x630px - универсальный!

### Формат:
- ✅ PNG (рекомендуется)
- ✅ JPG (альтернатива)
- ⚠️ SVG (не все платформы поддерживают)

### Размер файла:
- Максимум: 8 МБ (Facebook)
- Рекомендуется: < 1 МБ
- Наш файл: ~100-200 КБ ✅

---

## 🐛 Troubleshooting

### Превью не обновляется в соцсетях?

**Причина:** Соцсети кэшируют изображения.

**Решение:**
1. Очистите кэш через debug tools (ссылки выше)
2. Подождите 24 часа
3. Добавьте версию к URL: `/opengraph-image.png?v=2`

### Изображение не загружается?

**Проверьте:**
1. Файл лежит в `public/opengraph-image.png` ✅
2. Размер < 8 МБ ✅
3. Формат PNG/JPG ✅
4. Сайт задеплоен на https://arbitrage-bot.com ✅

### Превью обрезается?

**Причина:** Неправильный размер.

**Решение:** Используйте строго 1200x630px (наш генератор делает правильный размер)

---

## 📝 Checklist

- [ ] Открыл `og-image-generator.html` в браузере
- [ ] Скачал `opengraph-image.png`
- [ ] Поместил файл в `public/`
- [ ] Удалил `opengraph-image.png.txt`
- [ ] Запустил `npm run build`
- [ ] Задеплоил на GitHub Pages
- [ ] Проверил в Facebook Debugger
- [ ] Проверил в Telegram (отправил себе ссылку)
- [ ] Проверил в VK (очистил кэш)

---

## 🎉 Готово!

Теперь при шаринге ссылки `https://arbitrage-bot.com` в любой соцсети будет показываться крутое превью!

**Пример:**
```
[Красивая карточка]
🤖 ArbitroBot - DEX Арбитражный Робот
📈 30-72% в день | ⚡ 24/7 | 🔗 BSC
🚀 arbitrage-bot.com
```

