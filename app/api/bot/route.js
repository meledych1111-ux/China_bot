// app/api/bot/route.js
import { Telegraf, Markup } from 'telegraf';
import {
  words,
  getRandomWord,
  getWordsByCategory,
  getCategories,
  getCategoryName,
  getCategoriesWithNames,
  removeEmojis
} from '../../../lib/words.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

// === Главное меню ===
const mainMenu = Markup.keyboard([
  ['🔤 Случайное слово', '📚 Карточки'],
  ['🎯 Викторина', '🏷️ Категории'],
  ['📊 Статистика', 'ℹ️ Помощь']
]).resize();

// === Команды ===
bot.start((ctx) => {
  const totalWords = words.length;
  const totalCategories = getCategories().length;
  ctx.replyWithMarkdown(
    `🇨🇳 *Привет!* Я помогу тебе выучить китайский.\n\n` +
    `📊 *Статистика:*\n` +
    `• Слов: *${totalWords}*\n` +
    `• Категорий: *${totalCategories}*\n\n` +
    `👇 Выбери действие:`,
    mainMenu
  );
});

bot.command('help', (ctx) => ctx.replyWithMarkdown(
  `*📖 Помощь и команды:*\n\n` +
  `🔤 *Случайное слово* — изучайте новые слова\n` +
  `📚 *Карточки* — два режима заучивания\n` +
  `🎯 *Викторина* — тестируйте свои знания\n` +
  `🏷️ *Категории* — учите слова по темам\n` +
  `📊 *Статистика* — общая информация\n\n` +
  `_Используйте кнопки меню для навигации_`
));

bot.hears('ℹ️ Помощь', (ctx) => ctx.replyWithMarkdown(
  `*📖 Помощь:*\n\n` +
  `• Нажимай кнопки меню для навигации\n` +
  `• В *викторине* — выбирай правильный перевод\n` +
  `• В *карточках* — нажимай "Показать перевод" или "Показать иероглиф"\n` +
  `• В *категориях* — нажми на категорию чтобы увидеть пример слова\n\n` +
  `_Для начала просто нажми любую кнопку меню!_`
));

// === Случайное слово с кнопками ===
bot.hears('🔤 Случайное слово', async (ctx) => {
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi);
  
  await ctx.replyWithMarkdown(
    `*🔤 Новое слово:*\n\n` +
    `${cleanHanzi}\n` +  // Без эмодзи
    `🗣️ *${word.pinyin}*\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `📝 *Пример:* ${word.example || '—'}\n` +
    `🏷️ *Категория:* ${getCategoryName(word.category)}`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Знаю', `know_${cleanHanzi}`),
        Markup.button.callback('📝 Учить', `learn_${cleanHanzi}`)
      ],
      [
        Markup.button.callback('🎯 Викторина', 'start_quiz'),
        Markup.button.callback('🔁 Обратная карточка', 'reverse_card_from_random')
      ],
      [
        Markup.button.callback('🔤 Ещё слово', 'another_word'),
        Markup.button.callback('🏠 Меню', 'back_menu')
      ]
    ])
  );
});

// Обработка кнопок "Знаю" и "Учу"
bot.action(/know_(.+)/, async (ctx) => {
  const hanzi = ctx.match[1];
  await ctx.answerCbQuery(`✅ Отлично! Слово "${hanzi}" добавлено в изученные`);
});

bot.action(/learn_(.+)/, async (ctx) => {
  const hanzi = ctx.match[1];
  await ctx.answerCbQuery(`📝 Слово "${hanzi}" добавлено для повторения`);
});

// === МЕНЮ КАРТОЧЕК ===
bot.hears('📚 Карточки', async (ctx) => {
  await ctx.reply(
    '📚 *Выберите режим карточек:*',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('🇨🇳 → 🇷🇺 Китайский → Русский', 'cards_normal'),
          Markup.button.callback('🇷🇺 → 🇨🇳 Русский → Китайский', 'cards_reverse')
        ],
        [
          Markup.button.callback('🎲 Случайный режим', 'cards_random'),
          Markup.button.callback('🏠 Меню', 'back_menu')
        ]
      ])
    }
  );
});

// === ОБЫЧНЫЕ КАРТОЧКИ (китайский → русский) ===
bot.action('cards_normal', async (ctx) => {
  await ctx.deleteMessage();
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi);
  
  await ctx.replyWithMarkdown(
    `*📚 Карточка (китайский → русский):*\n\n` +
    `🇨🇳 *${cleanHanzi}*\n` +
    `🗣️ ${word.pinyin}\n\n` +
    `_Нажми, чтобы увидеть перевод_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Показать перевод', `reveal_normal_${cleanHanzi}_${word.translation}_${word.pinyin}`)],
      [
        Markup.button.callback('⏭️ Следующая', 'next_normal_card'),
        Markup.button.callback('🔄 Сменить режим', 'switch_card_mode')
      ],
      [Markup.button.callback('🏠 Меню', 'back_menu')]
    ])
  );
});

// Показать перевод в обычной карточке
bot.action(/reveal_normal_(.+)_(.+)_(.+)/, (ctx) => {
  const hanzi = ctx.match[1];
  const translation = ctx.match[2];
  const pinyin = ctx.match[3];
  ctx.answerCbQuery(
    `🇷🇺 *Перевод:* ${translation}\n` +
    `🗣️ *Пиньинь:* ${pinyin}\n` +
    `🏷️ *Режим:* 🇨🇳 → 🇷🇺`,
    { show_alert: true }
  );
});

// Следующая обычная карточка
bot.action('next_normal_card', async (ctx) => {
  await ctx.deleteMessage();
  bot.action('cards_normal', ctx);
});

// === ОБРАТНЫЕ КАРТОЧКИ (русский → китайский) ===
bot.action('cards_reverse', async (ctx) => {
  await ctx.deleteMessage();
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi);
  
  await ctx.replyWithMarkdown(
    `*🔁 Карточка (русский → китайский):*\n\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `_Нажми, чтобы увидеть китайский иероглиф_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Показать иероглиф', `reveal_reverse_${cleanHanzi}_${word.pinyin}_${word.translation}`)],
      [
        Markup.button.callback('⏭️ Следующая', 'next_reverse_card'),
        Markup.button.callback('🔄 Сменить режим', 'switch_card_mode')
      ],
      [Markup.button.callback('🏠 Меню', 'back_menu')]
    ])
  );
});

// Показать иероглиф в обратной карточке
bot.action(/reveal_reverse_(.+)_(.+)_(.+)/, (ctx) => {
  const hanzi = ctx.match[1];
  const pinyin = ctx.match[2];
  const translation = ctx.match[3];
  ctx.answerCbQuery(
    `🇨🇳 *Иероглиф:* ${hanzi}\n` +
    `🗣️ *Пиньинь:* ${pinyin}\n` +
    `🇷🇺 *Перевод:* ${translation}\n` +
    `🏷️ *Режим:* 🇷🇺 → 🇨🇳`,
    { show_alert: true }
  );
});

// Следующая обратная карточка
bot.action('next_reverse_card', async (ctx) => {
  await ctx.deleteMessage();
  bot.action('cards_reverse', ctx);
});

// Случайный режим карточек
bot.action('cards_random', async (ctx) => {
  await ctx.deleteMessage();
  const randomMode = Math.random() > 0.5 ? 'cards_normal' : 'cards_reverse';
  bot.action(randomMode, ctx);
});

// Переключение режима карточек
bot.action('switch_card_mode', async (ctx) => {
  await ctx.deleteMessage();
  bot.handleUpdate({
    update_id: Date.now(),
    message: { 
      text: '📚 Карточки', 
      from: ctx.from, 
      chat: ctx.chat,
      message_id: Date.now()
    }
  });
});

// Обратная карточка из случайного слова
bot.action('reverse_card_from_random', async (ctx) => {
  await ctx.deleteMessage();
  bot.action('cards_reverse', ctx);
});

// === ВИКТОРИНА ===
bot.hears('🎯 Викторина', async (ctx) => {
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi);
  
  let options = [word.translation];
  while (options.length < 4) {
    const w = getRandomWord();
    if (!options.includes(w.translation)) options.push(w.translation);
  }
  const shuffled = options.sort(() => Math.random() - 0.5);

  await ctx.replyWithMarkdown(
    `*🎯 Вопрос:*\nЧто означает:\n\n` +
    `🇨🇳 *${cleanHanzi}* ?\n` +
    `🗣️ ${word.pinyin}`,
    Markup.inlineKeyboard(
      shuffled.map(opt => [Markup.button.callback(opt, `ans_${opt}_${word.translation}`)])
    )
  );
});

// Обработка ответов в викторине
bot.action(/ans_(.+)_(.+)/, async (ctx) => {
  const userAnswer = ctx.match[1];
  const correct = ctx.match[2];
  const isCorrect = userAnswer === correct;
  
  await ctx.answerCbQuery(isCorrect ? '✅ Верно!' : `❌ Правильно: ${correct}`);
  
  // Предложить продолжить
  await ctx.reply(
    isCorrect ? 
    `✅ *Правильно!*\nХотите продолжить?` : 
    `❌ *Неправильно.*\nПопробуем ещё?`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Ещё вопрос', 'more_quiz')],
        [Markup.button.callback('📚 К карточкам', 'to_cards')],
        [Markup.button.callback('🏠 Меню', 'back_menu')]
      ])
    }
  );
});

// "Ещё вопрос" в викторине
bot.action('more_quiz', async (ctx) => {
  await ctx.deleteMessage();
  bot.handleUpdate({
    update_id: Date.now(),
    message: { 
      text: '🎯 Викторина', 
      from: ctx.from, 
      chat: ctx.chat,
      message_id: Date.now()
    }
  });
});

// Переход к карточкам из викторины
bot.action('to_cards', async (ctx) => {
  await ctx.deleteMessage();
  bot.handleUpdate({
    update_id: Date.now(),
    message: { 
      text: '📚 Карточки', 
      from: ctx.from, 
      chat: ctx.chat,
      message_id: Date.now()
    }
  });
});

// === КАТЕГОРИИ НА РУССКОМ ===
bot.hears('🏷️ Категории', async (ctx) => {
  const categories = getCategoriesWithNames();
  
  // Группируем кнопки по 2 в ряд для лучшего отображения
  const buttons = [];
  for (let i = 0; i < categories.length; i += 2) {
    const row = [];
    if (categories[i]) {
      row.push(
        Markup.button.callback(
          `${categories[i].russian} (${getWordsByCategory(categories[i].english).length})`, 
          `cat_${categories[i].english}`
        )
      );
    }
    if (categories[i + 1]) {
      row.push(
        Markup.button.callback(
          `${categories[i + 1].russian} (${getWordsByCategory(categories[i + 1].english).length})`, 
          `cat_${categories[i + 1].english}`
        )
      );
    }
    if (row.length > 0) {
      buttons.push(row);
    }
  }
  
  buttons.push([Markup.button.callback('🎲 Случайное слово из любой категории', 'cat_random')]);
  buttons.push([Markup.button.callback('🏠 Главное меню', 'back_menu')]);
  
  await ctx.reply(
    '📂 *Выберите категорию:*\n_Нажмите на категорию, чтобы увидеть пример слова_',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    }
  );
});

// Обработчик для категорий
bot.action(/cat_(.+)/, async (ctx) => {
  const cat = ctx.match[1];
  
  if (cat === 'random') {
    const word = getRandomWord();
    const cleanHanzi = removeEmojis(word.hanzi);
    await ctx.answerCbQuery(
      `🎲 *Случайное слово:*\n\n` +
      `🇨🇳 ${cleanHanzi}\n` +
      `🗣️ ${word.pinyin}\n` +
      `🇷🇺 ${word.translation}\n` +
      `🏷️ ${getCategoryName(word.category)}`,
      { show_alert: true }
    );
    return;
  }
  
  const list = getWordsByCategory(cat);
  const categoryName = getCategoryName(cat);
  
  if (list.length === 0) {
    return ctx.answerCbQuery('В этой категории пока нет слов');
  }
  
  const word = list[Math.floor(Math.random() * list.length)];
  const cleanHanzi = removeEmojis(word.hanzi);
  
  await ctx.answerCbQuery(
    `📂 *${categoryName}*\n` +
    `📚 Слов в категории: ${list.length}\n\n` +
    `🇨🇳 ${cleanHanzi}\n` +
    `🗣️ ${word.pinyin}\n` +
    `🇷🇺 ${word.translation}\n\n` +
    `📝 ${word.example || ''}`,
    { show_alert: true }
  );
});

// === СТАТИСТИКА ===
bot.hears('📊 Статистика', (ctx) => {
  const total = words.length;
  const cats = getCategories().length;
  
  // Подсчитываем слова по категориям
  const categoryStats = getCategoriesWithNames()
    .map(cat => {
      const count = getWordsByCategory(cat.english).length;
      return `• ${cat.russian}: ${count} слов`;
    })
    .join('\n');
  
  ctx.replyWithMarkdown(
    `*📊 Статистика бота:*\n\n` +
    `📚 *Всего слов:* ${total}\n` +
    `🏷️ *Категорий:* ${cats}\n\n` +
    `*По категориям:*\n${categoryStats}\n\n` +
    `_Продолжайте учиться! 📖_`
  );
});

// === ОБЩИЕ ОБРАБОТЧИКИ ===
bot.action('another_word', async (ctx) => {
  await ctx.deleteMessage();
  bot.handleUpdate({
    update_id: Date.now(),
    message: { 
      text: '🔤 Случайное слово', 
      from: ctx.from, 
      chat: ctx.chat,
      message_id: Date.now()
    }
  });
});

bot.action('start_quiz', async (ctx) => {
  await ctx.deleteMessage();
  bot.handleUpdate({
    update_id: Date.now(),
    message: { 
      text: '🎯 Викторина', 
      from: ctx.from, 
      chat: ctx.chat,
      message_id: Date.now()
    }
  });
});

bot.action('back_menu', async (ctx) => {
  try {
    // Пытаемся отредактировать сообщение
    await ctx.editMessageText('Главное меню:', {
      ...mainMenu,
      parse_mode: 'Markdown'
    });
  } catch (e) {
    // Если не удалось отредактировать (например, старое сообщение), отправляем новое
    await ctx.reply('Главное меню:', mainMenu);
  }
});

// === ОБРАБОТКА ОШИБОК ===
bot.catch((err, ctx) => {
  console.error(`Ошибка в обновлении ${ctx.updateType}:`, err);
  try {
    ctx.reply('⚠️ Произошла ошибка. Пожалуйста, попробуйте снова или вернитесь в меню /start');
  } catch (e) {
    console.error('Не удалось отправить сообщение об ошибке:', e);
  }
});

// === WEBHOOK ОБРАБОТЧИК ===
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    await bot.handleUpdate(body);
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error('Error in webhook:', e);
    return new Response(null, { status: 500 });
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ 
      ok: true, 
      message: 'Chinese Learning Bot is running',
      stats: {
        totalWords: words.length,
        categories: getCategories().length,
        endpoints: ['POST /api/bot - Telegram webhook handler']
      }
    }), 
    {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    }
  );
}
