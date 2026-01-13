// app/api/bot-en/route.js
import { Telegraf, Markup } from 'telegraf';
import {
  words,
  getRandomWord,
  getWordsByCategory,
  getCategories,
  getCategoryName,
  getCategoriesWithNames,
  removeEmojis
} from '../../../lib/words-en.js';
const bot = new Telegraf(process.env.BOT_TOKEN_EN);

// ===  меню ===
const mainMenu = Markup.keyboard([
  ['🔤 Random Word', '📚 Flashcards'],
  ['🎯 Quiz', '🏷️ Categories'],
  ['📊 Statistics', 'ℹ️ Help']
]).resize();

// === Команды ===
bot.start((ctx) => {
  const totalWords = words.length;
  const totalCategories = getCategories().length;
  ctx.replyWithMarkdown(
    `🇬🇧 *Hello!* I'll help you learn English.\n` +
    `🇷🇺 *Привет!* Я помогу тебе выучить английский.\n\n` +
    `📊 *Statistics:*\n` +
    `• Words: *${totalWords}*\n` +
    `• Categories: *${totalCategories}*\n\n` +
    `👇 Choose an action:`,
    mainMenu
  );
});

bot.command('help', (ctx) => ctx.replyWithMarkdown(
  `*📖 Help & Commands:*\n\n` +
  `🔤 *Random Word* — learn new words with emojis for associations\n` +
  `📚 *Flashcards* — two learning modes (with/without emojis)\n` +
  `🎯 *Quiz* — test your knowledge without emojis\n` +
  `🏷️ *Categories* — learn words by topics\n` +
  `📊 *Statistics* — general information\n\n` +
  `_Emojis help memorize, but quiz tests real knowledge!_`
));

bot.hears('ℹ️ Help', (ctx) => ctx.replyWithMarkdown(
  `*📖 Помощь:*\n\n` +
  `• *Random Word* — показывает слова С эмодзи для запоминания\n` +
  `• *Flashcards* — в режиме обучения показывают эмодзи\n` +
  `• *Quiz* — показывает слова БЕЗ эмодзи (тест на знание)\n` +
  `• *Categories* — на русском с количеством слов\n\n` +
  `_Эмодзи — для запоминания, чистые слова — для проверки знаний!_`
));

// === Случайное слово (С ЭМОДЗИ для запоминания) ===
bot.hears('🔤 Random Word', async (ctx) => {
  const word = getRandomWord();
  const cleanEnglish = removeEmojis(word.english);
  
  await ctx.replyWithMarkdown(
    `*🔤 New Word:*\n\n` +
    `${word.english}\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `📝 *Example:* ${word.example || '—'}\n` +
    `🏷️ *Category:* ${getCategoryName(word.category)}\n\n` +
    `_💡 Emojis help remember the meaning_`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ I know', `know_${cleanEnglish}`),
        Markup.button.callback('📝 Learn', `learn_${cleanEnglish}`)
      ],
      [
        Markup.button.callback('🎯 Test knowledge', 'start_quiz'),
        Markup.button.callback('🔁 Reverse card', 'reverse_card_from_random')
      ],
      [
        Markup.button.callback('🔤 Another word', 'another_word'),
        Markup.button.callback('🏠 Menu', 'back_menu')
      ]
    ])
  );
});

// Обработка кнопок "Знаю" и "Учу"
bot.action(/know_(.+)/, async (ctx) => {
  const english = ctx.match[1];
  await ctx.answerCbQuery(`✅ Great! Word "${english}" added to known`);
});

bot.action(/learn_(.+)/, async (ctx) => {
  const english = ctx.match[1];
  await ctx.answerCbQuery(`📝 Word "${english}" added for repetition`);
});

// === МЕНЮ КАРТОЧЕК ===
bot.hears('📚 Flashcards', async (ctx) => {
  await ctx.reply(
    '📚 *Choose flashcard mode:*\n\n' +
    '_💡 Learning mode shows emojis for memorization_\n' +
    '_🎯 Test mode — words without emojis_',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('🇬🇧 → 🇷🇺 Learn (with emojis)', 'cards_learn_normal'),
          Markup.button.callback('🇷🇺 → 🇬🇧 Learn (with emojis)', 'cards_learn_reverse')
        ],
        [
          Markup.button.callback('🇬🇧 → 🇷🇺 Test (no emojis)', 'cards_test_normal'),
          Markup.button.callback('🇷🇺 → 🇬🇧 Test (no emojis)', 'cards_test_reverse')
        ],
        [
          Markup.button.callback('🎲 Random mode', 'cards_random'),
          Markup.button.callback('🏠 Menu', 'back_menu')
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
  const cleanEnglish = removeEmojis(word.english);
  
  await ctx.replyWithMarkdown(
    `*📚 Flashcard (learning):*\n` +
    `🇬🇧 → 🇷🇺 *with emojis*\n\n` +
    `${word.english}\n` +
    `_Click to see translation_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Show translation', `reveal_learn_normal_${cleanEnglish}`)],
      [
        Markup.button.callback('⏭️ Next', 'next_learn_normal_card'),
        Markup.button.callback('🎯 Test (no emojis)', 'cards_test_normal')
      ],
      [Markup.button.callback('🏠 Menu', 'back_menu')]
    ])
  );
});

// Обратные карточки - обучение (с эмодзи в ответе)
bot.action('cards_learn_reverse', async (ctx) => {
  await ctx.deleteMessage();
  const word = getRandomWord();
  const cleanEnglish = removeEmojis(word.english);
  
  await ctx.replyWithMarkdown(
    `*🔁 Flashcard (learning):*\n` +
    `🇷🇺 → 🇬🇧 *with emojis*\n\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `_Click to see English word with emojis_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Show English', `reveal_learn_reverse_${cleanEnglish}`)],
      [
        Markup.button.callback('⏭️ Next', 'next_learn_reverse_card'),
        Markup.button.callback('🎯 Test (no emojis)', 'cards_test_reverse')
      ],
      [Markup.button.callback('🏠 Menu', 'back_menu')]
    ])
  );
});

// === КАРТОЧКИ: РЕЖИМ ТЕСТИРОВАНИЯ (БЕЗ ЭМОДЗИ) ===

// Обычные карточки - тест (без эмодзи)
bot.action('cards_test_normal', async (ctx) => {
  await ctx.deleteMessage();
  const word = getRandomWord();
  const cleanEnglish = removeEmojis(word.english);
  
  await ctx.replyWithMarkdown(
    `*🎯 Flashcard (test):*\n` +
    `🇬🇧 → 🇷🇺 *no emojis*\n\n` +
    `🇬🇧 *${cleanEnglish}*\n` +
    `_Click to check translation_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Check translation', `reveal_test_normal_${cleanEnglish}`)],
      [
        Markup.button.callback('⏭️ Next', 'next_test_normal_card'),
        Markup.button.callback('📚 Learn (with emojis)', 'cards_learn_normal')
      ],
      [Markup.button.callback('🏠 Menu', 'back_menu')]
    ])
  );
});

// Обратные карточки - тест (без эмодзи)
bot.action('cards_test_reverse', async (ctx) => {
  await ctx.deleteMessage();
  const word = getRandomWord();
  const cleanEnglish = removeEmojis(word.english);
  
  await ctx.replyWithMarkdown(
    `*🎯 Flashcard (test):*\n` +
    `🇷🇺 → 🇬🇧 *no emojis*\n\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `_Click to check English word_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Check English', `reveal_test_reverse_${cleanEnglish}`)],
      [
        Markup.button.callback('⏭️ Next', 'next_test_reverse_card'),
        Markup.button.callback('📚 Learn (with emojis)', 'cards_learn_reverse')
      ],
      [Markup.button.callback('🏠 Menu', 'back_menu')]
    ])
  );
});

// === ОБРАБОТЧИКИ ПОКАЗА ===
bot.action(/reveal_learn_normal_(.+)/, (ctx) => {
  const english = ctx.match[1];
  const word = words.find(w => removeEmojis(w.english) === english) || getRandomWord();
  ctx.answerCbQuery(
    `✅ *Correct answer:*\n🇷🇺 ${word.translation}\n📝 ${word.example || ''}`,
    { show_alert: true }
  );
});

bot.action(/reveal_learn_reverse_(.+)/, (ctx) => {
  const english = ctx.match[1];
  const word = words.find(w => removeEmojis(w.english) === english) || getRandomWord();
  ctx.answerCbQuery(
    `✅ *Correct answer:*\n${word.english}\n📝 ${word.example || ''}`,
    { show_alert: true }
  );
});

bot.action(/reveal_test_normal_(.+)/, (ctx) => {
  const english = ctx.match[1];
  const word = words.find(w => removeEmojis(w.english) === english) || getRandomWord();
  ctx.answerCbQuery(
    `✅ *Correct answer:*\n🇷🇺 ${word.translation}\n📝 ${word.example || ''}`,
    { show_alert: true }
  );
});

bot.action(/reveal_test_reverse_(.+)/, (ctx) => {
  const english = ctx.match[1];
  const word = words.find(w => removeEmojis(w.english) === english) || getRandomWord();
  ctx.answerCbQuery(
    `✅ *Correct answer:*\n${word.english}\n📝 ${word.example || ''}`,
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

// === ВИКТОРИНА (ИСПРАВЛЕННАЯ - БЕЗ BUTTON_DATA_INVALID) ===
bot.hears('🎯 Quiz', async (ctx) => {
  const word = getRandomWord();
  const cleanEnglish = removeEmojis(word.english);
  
  let options = [word.translation];
  while (options.length < 4) {
    const w = getRandomWord();
    if (!options.includes(w.translation)) options.push(w.translation);
  }
  
  const shuffled = options.sort(() => Math.random() - 0.5);
  const correctIndex = shuffled.indexOf(word.translation);

  // ИСПРАВЛЕНИЕ: используем индексы вместо текста в callback_data
  const buttons = shuffled.map((opt, idx) => [
    Markup.button.callback(opt, `quiz_${idx}_${correctIndex}`)
  ]);

  await ctx.replyWithMarkdown(
    `*🎯 Quiz (test your knowledge):*\n\n` +
    `What is the translation of:\n\n` +
    `🇬🇧 *${cleanEnglish}* ?\n` +
    `_💡 No emojis shown to test real knowledge_`,
    Markup.inlineKeyboard(buttons)
  );
});

// Обработчик ответов в викторине (ИСПРАВЛЕННЫЙ)
bot.action(/quiz_(.+)_(.+)/, async (ctx) => {
  const selectedIdx = parseInt(ctx.match[1]);
  const correctIdx = parseInt(ctx.match[2]);
  const isCorrect = selectedIdx === correctIdx;
  
  await ctx.answerCbQuery(isCorrect ? '✅ Correct!' : '❌ Wrong');
  
  const word = getRandomWord(); // Для демо, можно улучшить логику
  
  await ctx.reply(
    isCorrect ? 
    `✅ *Correct!*\nWant to continue?` : 
    `❌ *Incorrect.*\nLet's try again?`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Another question', 'more_quiz')],
        [Markup.button.callback('🏠 Menu', 'back_menu')]
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
      text: '🎯 Quiz', 
      from: ctx.from, 
      chat: ctx.chat,
      message_id: Date.now()
    }
  });
});

// === КАТЕГОРИИ НА РУССКОМ ===
bot.hears('🏷️ Categories', async (ctx) => {
  const categories = getCategoriesWithNames();
  
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
  
  buttons.push([Markup.button.callback('🎲 Random word', 'cat_random')]);
  buttons.push([Markup.button.callback('🏠 Menu', 'back_menu')]);
  
  await ctx.reply(
    '📂 *Choose a category:*\n_Click on category to see example word with emojis_',
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
    await ctx.answerCbQuery(
      `🎲 *Random word:*\n\n` +
      `${word.english}\n` +
      `🇷🇺 ${word.translation}\n` +
      `🏷️ ${getCategoryName(word.category)}`,
      { show_alert: true }
    );
    return;
  }
  
  const list = getWordsByCategory(cat);
  const categoryName = getCategoryName(cat);
  
  if (list.length === 0) {
    return ctx.answerCbQuery('No words in this category yet');
  }
  
  const word = list[Math.floor(Math.random() * list.length)];
  
  await ctx.answerCbQuery(
    `📂 *${categoryName}*\n` +
    `📚 Words in category: ${list.length}\n\n` +
    `${word.english}\n` +
    `🇷🇺 ${word.translation}\n\n` +
    `📝 ${word.example || ''}`,
    { show_alert: true }
  );
});

// === СТАТИСТИКА ===
bot.hears('📊 Statistics', (ctx) => {
  const total = words.length;
  const cats = getCategories().length;
  
  const categoryStats = getCategoriesWithNames()
    .map(cat => {
      const count = getWordsByCategory(cat.english).length;
      return `• ${cat.russian}: ${count} words`;
    })
    .join('\n');
  
  ctx.replyWithMarkdown(
    `*📊 Bot statistics:*\n\n` +
    `📚 *Total words:* ${total}\n` +
    `🏷️ *Categories:* ${cats}\n\n` +
    `*By categories:*\n${categoryStats}\n\n` +
    `_💡 Use emojis for memorization, quiz for testing knowledge!_`
  );
});

// === ОБЩИЕ ОБРАБОТЧИКИ ===
bot.action('another_word', async (ctx) => {
  await ctx.deleteMessage();
  bot.handleUpdate({
    update_id: Date.now(),
    message: { 
      text: '🔤 Random Word', 
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
      text: '🎯 Quiz', 
      from: ctx.from, 
      chat: ctx.chat,
      message_id: Date.now()
    }
  });
});

bot.action('reverse_card_from_random', async (ctx) => {
  await ctx.deleteMessage();
  const randomMode = Math.random() > 0.5 ? 'cards_learn_reverse' : 'cards_test_reverse';
  bot.action(randomMode, ctx);
});

bot.action('back_menu', async (ctx) => {
  try {
    await ctx.editMessageText('Main menu:', {
      ...mainMenu,
      parse_mode: 'Markdown'
    });
  } catch (e) {
    await ctx.reply('Main menu:', mainMenu);
  }
});

// === ОБРАБОТКА ОШИБОК ===
bot.catch((err, ctx) => {
  console.error(`Error in update ${ctx.updateType}:`, err);
  try {
    ctx.reply('⚠️ An error occurred. Please try again or return to menu /start');
  } catch (e) {
    console.error('Failed to send error message:', e);
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
      message: 'English Learning Bot is running',
      features: [
        '🔤 Random words with emojis for memorization',
        '📚 Two flashcard modes: learning (with emojis) and test (no emojis)',
        '🎯 Quiz to test knowledge without emojis',
        '🏷️ Categories in Russian with word examples',
        '📊 Statistics on words and categories'
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
