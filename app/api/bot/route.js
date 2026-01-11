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
  `🔤 *Случайное слово* — изучайте новые слова с эмодзи для ассоциаций\n` +
  `📚 *Карточки* — два режима заучивания (с эмодзи при обучении)\n` +
  `🎯 *Викторина* — тестируйте знание иероглифов БЕЗ эмодзи\n` +
  `🏷️ *Категории* — учите слова по темам\n` +
  `📊 *Статистика* — общая информация\n\n` +
  `_Эмодзи помогают запоминать, но викторина проверяет знание чистых иероглифов!_`
));

bot.hears('ℹ️ Помощь', (ctx) => ctx.replyWithMarkdown(
  `*📖 Помощь:*\n\n` +
  `• *Случайное слово* — показывает слова С эмодзи для запоминания\n` +
  `• *Карточки* — в режиме обучения показывают эмодзи\n` +
  `• *Викторина* — показывает иероглифы БЕЗ эмодзи (тест на знание)\n` +
  `• *Категории* — на русском с количеством слов\n\n` +
  `_Эмодзи — для запоминания, чистые иероглифы — для проверки знаний!_`
));

// === Случайное слово (С ЭМОДЗИ для запоминания) ===
bot.hears('🔤 Случайное слово', async (ctx) => {
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi); // Для callback
  
  await ctx.replyWithMarkdown(
    `*🔤 Новое слово:*\n\n` +
    `${word.hanzi}\n` +  // С ЭМОДЗИ для запоминания!
    `🗣️ *${word.pinyin}*\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `📝 *Пример:* ${word.example || '—'}\n` +
    `🏷️ *Категория:* ${getCategoryName(word.category)}\n\n` +
    `_💡 Эмодзи помогают запомнить значение слова_`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Знаю', `know_${cleanHanzi}`),
        Markup.button.callback('📝 Учить', `learn_${cleanHanzi}`)
      ],
      [
        Markup.button.callback('🎯 Проверить знание', 'start_quiz'),
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
    '📚 *Выберите режим карточек:*\n\n' +
    '_💡 В режиме обучения показываются эмодзи для запоминания_\n' +
    '_🎯 В режиме тестирования — только чистые иероглифы_',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('🇨🇳 → 🇷🇺 Учить (с эмодзи)', 'cards_learn_normal'),
          Markup.button.callback('🇷🇺 → 🇨🇳 Учить (с эмодзи)', 'cards_learn_reverse')
        ],
        [
          Markup.button.callback('🇨🇳 → 🇷🇺 Тест (без эмодзи)', 'cards_test_normal'),
          Markup.button.callback('🇷🇺 → 🇨🇳 Тест (без эмодзи)', 'cards_test_reverse')
        ],
        [
          Markup.button.callback('🎲 Случайный режим', 'cards_random'),
          Markup.button.callback('🏠 Меню', 'back_menu')
        ]
      ])
    }
  );
});

// === КАРТОЧКИ: РЕЖИМ ОБУЧЕНИЯ (С ЭМОДЗИ) ===

// Обычные карточки - обучение (с эмодзи)
bot.action('cards_learn_normal', async (ctx) => {
  await ctx.deleteMessage();
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi);
  
  await ctx.replyWithMarkdown(
    `*📚 Карточка (обучение):*\n` +
    `🇨🇳 → 🇷🇺 *с эмодзи*\n\n` +
    `${word.hanzi}\n` +  // С ЭМОДЗИ для запоминания!
    `🗣️ ${word.pinyin}\n\n` +
    `_Нажми, чтобы увидеть перевод_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Показать перевод', `reveal_learn_normal_${cleanHanzi}_${word.translation}_${word.pinyin}`)],
      [
        Markup.button.callback('⏭️ Следующая', 'next_learn_normal_card'),
        Markup.button.callback('🎯 Тест (без эмодзи)', 'cards_test_normal')
      ],
      [Markup.button.callback('🏠 Меню', 'back_menu')]
    ])
  );
});

// Обратные карточки - обучение (с эмодзи в ответе)
bot.action('cards_learn_reverse', async (ctx) => {
  await ctx.deleteMessage();
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi);
  
  await ctx.replyWithMarkdown(
    `*🔁 Карточка (обучение):*\n` +
    `🇷🇺 → 🇨🇳 *с эмодзи*\n\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `_Нажми, чтобы увидеть китайский иероглиф с эмодзи_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Показать иероглиф', `reveal_learn_reverse_${cleanHanzi}_${word.pinyin}_${word.translation}_${word.hanzi}`)],
      [
        Markup.button.callback('⏭️ Следующая', 'next_learn_reverse_card'),
        Markup.button.callback('🎯 Тест (без эмодзи)', 'cards_test_reverse')
      ],
      [Markup.button.callback('🏠 Меню', 'back_menu')]
    ])
  );
});

// === КАРТОЧКИ: РЕЖИМ ТЕСТИРОВАНИЯ (БЕЗ ЭМОДЗИ) ===

// Обычные карточки - тест (без эмодзи)
bot.action('cards_test_normal', async (ctx) => {
  await ctx.deleteMessage();
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi);
  
  await ctx.replyWithMarkdown(
    `*🎯 Карточка (тест):*\n` +
    `🇨🇳 → 🇷🇺 *без эмодзи*\n\n` +
    `🇨🇳 *${cleanHanzi}*\n` +  // БЕЗ ЭМОДЗИ для тестирования!
    `🗣️ ${word.pinyin}\n\n` +
    `_Нажми, чтобы проверить перевод_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Проверить перевод', `reveal_test_normal_${cleanHanzi}_${word.translation}_${word.pinyin}`)],
      [
        Markup.button.callback('⏭️ Следующая', 'next_test_normal_card'),
        Markup.button.callback('📚 Учить (с эмодзи)', 'cards_learn_normal')
      ],
      [Markup.button.callback('🏠 Меню', 'back_menu')]
    ])
  );
});

// Обратные карточки - тест (без эмодзи)
bot.action('cards_test_reverse', async (ctx) => {
  await ctx.deleteMessage();
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi);
  
  await ctx.replyWithMarkdown(
    `*🎯 Карточка (тест):*\n` +
    `🇷🇺 → 🇨🇳 *без эмодзи*\n\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `_Нажми, чтобы проверить знание иероглифа_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Проверить иероглиф', `reveal_test_reverse_${cleanHanzi}_${word.pinyin}_${word.translation}`)],
      [
        Markup.button.callback('⏭️ Следующая', 'next_test_reverse_card'),
        Markup.button.callback('📚 Учить (с эмодзи)', 'cards_learn_reverse')
      ],
      [Markup.button.callback('🏠 Меню', 'back_menu')]
    ])
  );
});

// === ОБРАБОТЧИКИ ПОКАЗА ДЛЯ РЕЖИМА ОБУЧЕНИЯ (с эмодзи) ===
bot.action(/reveal_learn_normal_(.+)_(.+)_(.+)/, (ctx) => {
  const hanzi = ctx.match[1];
  const translation = ctx.match[2];
  const pinyin = ctx.match[3];
  ctx.answerCbQuery(
    `✅ *Правильный ответ:*\n` +
    `🇷🇺 ${translation}\n` +
    `🗣️ ${pinyin}\n` +
    `🏷️ Режим: Обучение (с эмодзи)`,
    { show_alert: true }
  );
});

bot.action(/reveal_learn_reverse_(.+)_(.+)_(.+)_(.+)/, (ctx) => {
  const cleanHanzi = ctx.match[1];
  const pinyin = ctx.match[2];
  const translation = ctx.match[3];
  const hanziWithEmojis = ctx.match[4];
  
  ctx.answerCbQuery(
    `✅ *Правильный ответ:*\n` +
    `🇨🇳 ${hanziWithEmojis}\n` +  // С ЭМОДЗИ в обучении!
    `🗣️ ${pinyin}\n` +
    `🇷🇺 ${translation}\n` +
    `🏷️ Режим: Обучение (с эмодзи)`,
    { show_alert: true }
  );
});

// === ОБРАБОТЧИКИ ПОКАЗА ДЛЯ РЕЖИМА ТЕСТИРОВАНИЯ (без эмодзи) ===
bot.action(/reveal_test_normal_(.+)_(.+)_(.+)/, (ctx) => {
  const hanzi = ctx.match[1];
  const translation = ctx.match[2];
  const pinyin = ctx.match[3];
  ctx.answerCbQuery(
    `✅ *Правильный ответ:*\n` +
    `🇷🇺 ${translation}\n` +
    `🗣️ ${pinyin}\n` +
    `🏷️ Режим: Тест (без эмодзи)`,
    { show_alert: true }
  );
});

bot.action(/reveal_test_reverse_(.+)_(.+)_(.+)/, (ctx) => {
  const hanzi = ctx.match[1];
  const pinyin = ctx.match[2];
  const translation = ctx.match[3];
  ctx.answerCbQuery(
    `✅ *Правильный ответ:*\n` +
    `🇨🇳 ${hanzi}\n` +  // БЕЗ ЭМОДЗИ в тесте!
    `🗣️ ${pinyin}\n` +
    `🇷🇺 ${translation}\n` +
    `🏷️ Режим: Тест (без эмодзи)`,
    { show_alert: true }
  );
});

// === ОБРАБОТЧИКИ СЛЕДУЮЩИХ КАРТОЧЕК ===
const cardHandlers = {
  'next_learn_normal_card': 'cards_learn_normal',
  'next_learn_reverse_card': 'cards_learn_reverse',
  'next_test_normal_card': 'cards_test_normal',
  'next_test_reverse_card': 'cards_test_reverse'
};

for (const [action, handler] of Object.entries(cardHandlers)) {
  bot.action(action, async (ctx) => {
    await ctx.deleteMessage();
    bot.action(handler, ctx);
  });
}

// Случайный режим карточек
bot.action('cards_random', async (ctx) => {
  await ctx.deleteMessage();
  const modes = ['cards_learn_normal', 'cards_learn_reverse', 'cards_test_normal', 'cards_test_reverse'];
  const randomMode = modes[Math.floor(Math.random() * modes.length)];
  bot.action(randomMode, ctx);
});

// Переключение между режимами
const switchHandlers = {
  'cards_learn_normal': 'cards_test_normal',
  'cards_learn_reverse': 'cards_test_reverse',
  'cards_test_normal': 'cards_learn_normal',
  'cards_test_reverse': 'cards_learn_reverse'
};

// === ВИКТОРИНА (ВСЕГДА БЕЗ ЭМОДЗИ для проверки знаний) ===
bot.hears('🎯 Викторина', async (ctx) => {
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi); // БЕЗ эмодзи!
  
  let options = [word.translation];
  while (options.length < 4) {
    const w = getRandomWord();
    if (!options.includes(w.translation)) options.push(w.translation);
  }
  const shuffled = options.sort(() => Math.random() - 0.5);

  await ctx.replyWithMarkdown(
    `*🎯 Викторина (тест на знание иероглифов):*\n\n` +
    `Что означает:\n\n` +
    `🇨🇳 *${cleanHanzi}* ?\n` +  // БЕЗ ЭМОДЗИ!
    `_💡 Эмодзи не показываются, чтобы проверить реальное знание_`,
    Markup.inlineKeyboard(
      shuffled.map(opt => [Markup.button.callback(opt, `ans_${opt}_${word.translation}_${cleanHanzi}`)])
    )
  );
});

// Обработка ответов в викторине
bot.action(/ans_(.+)_(.+)_(.+)/, async (ctx) => {
  const userAnswer = ctx.match[1];
  const correct = ctx.match[2];
  const hanzi = ctx.match[3];
  const isCorrect = userAnswer === correct;
  
  // Получаем слово чтобы показать его с эмодзи в ответе
  const wordObj = words.find(w => removeEmojis(w.hanzi) === hanzi) || getRandomWord();
  
  if (isCorrect) {
    await ctx.answerCbQuery('✅ Верно!');
    await ctx.replyWithMarkdown(
      `✅ *Отлично!* Ты правильно перевёл:\n\n` +
      `${wordObj.hanzi}\n` +  // С ЭМОДЗИ в правильном ответе
      `🗣️ *${wordObj.pinyin}*\n` +
      `🇷🇺 *${wordObj.translation}*`,
      Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Ещё вопрос', 'more_quiz')],
        [Markup.button.callback('📚 Учить это слово (с эмодзи)', `learn_${hanzi}`)],
        [Markup.button.callback('🏠 Меню', 'back_menu')]
      ])
    );
  } else {
    await ctx.answerCbQuery(`❌ Правильно: ${correct}`);
    await ctx.replyWithMarkdown(
      `❌ *Правильный ответ:*\n\n` +
      `${wordObj.hanzi}\n` +  // С ЭМОДЗИ в правильном ответе
      `🗣️ *${wordObj.pinyin}*\n` +
      `🇷🇺 *${wordObj.translation}*\n\n` +
      `_Твой ответ: ${userAnswer}_`,
      Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Ещё вопрос', 'more_quiz')],
        [Markup.button.callback('📚 Учить это слово (с эмодзи)', `learn_${hanzi}`)],
        [Markup.button.callback('🏠 Меню', 'back_menu')]
      ])
    );
  }
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

// === КАТЕГОРИИ НА РУССКОМ (с показом слова С ЭМОДЗИ) ===
bot.hears('🏷️ Категории', async (ctx) => {
  const categories = getCategoriesWithNames();
  
  // Группируем кнопки по 2 в ряд
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
  
  buttons.push([Markup.button.callback('🎲 Случайное слово', 'cat_random')]);
  buttons.push([Markup.button.callback('🏠 Главное меню', 'back_menu')]);
  
  await ctx.reply(
    '📂 *Выберите категорию:*\n_Нажмите на категорию, чтобы увидеть пример слова с эмодзи_',
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
      `${word.hanzi}\n` +  // С ЭМОДЗИ
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
  
  await ctx.answerCbQuery(
    `📂 *${categoryName}*\n` +
    `📚 Слов в категории: ${list.length}\n\n` +
    `${word.hanzi}\n` +  // С ЭМОДЗИ
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
    `_💡 Используйте эмодзи для запоминания, а викторину — для проверки знаний!_`
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

bot.action('reverse_card_from_random', async (ctx) => {
  await ctx.deleteMessage();
  // Случайно выбираем режим обучения или теста для обратных карточек
  const randomMode = Math.random() > 0.5 ? 'cards_learn_reverse' : 'cards_test_reverse';
  bot.action(randomMode, ctx);
});

bot.action('back_menu', async (ctx) => {
  try {
    await ctx.editMessageText('Главное меню:', {
      ...mainMenu,
      parse_mode: 'Markdown'
    });
  } catch (e) {
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
      features: [
        '🔤 Случайные слова с эмодзи для запоминания',
        '📚 Два режима карточек: обучение (с эмодзи) и тест (без эмодзи)',
        '🎯 Викторина для проверки знаний без эмодзи',
        '🏷️ Категории на русском с примерами слов',
        '📊 Статистика по словам и категориям'
      ]
    }), 
    {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    }
  );
}
