// app/api/bot/route.js
import { Telegraf, Markup } from 'telegraf';
import {
  words,
  getRandomWord,
  getWordsByCategory,
  getCategories
} from '../../../lib/words.js';

function removeEmojis(str) {
  return str.replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// === Главное меню (полное!) ===
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
  '*📖 Команды:*\n' +
  '🔤 — новое слово\n' +
  '📚 — режим заучивания\n' +
  '🎯 — тест на знание\n' +
  '🏷️ — слова по темам'
));

bot.hears('ℹ️ Помощь', (ctx) => ctx.replyWithMarkdown(
  '*📖 Помощь:*\n' +
  'Нажимай кнопки меню!\n' +
  'В викторине — выбирай правильный перевод.\n' +
  'В карточках — нажимай "Показать перевод".'
));

// === Случайное слово с кнопками ===
bot.hears('🔤 Случайное слово', async (ctx) => {
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi);
  
  await ctx.replyWithMarkdown(
    `*🔤 Новое слово:*\n\n` +
    `${word.hanzi}\n` +
    `🗣️ *${word.pinyin}*\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `📝 ${word.example || '—'}`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Знаю', `know_${cleanHanzi}`),
        Markup.button.callback('❌ Учить', `learn_${cleanHanzi}`)
      ],
      [
        Markup.button.callback('🎯 Викторина', 'start_quiz'),
        Markup.button.callback('🔤 Ещё', 'another_word')
      ]
    ])
  );
});

// Обработка кнопок
bot.action('another_word', (ctx) => ctx.scene.enter('random_word'));
bot.action('start_quiz', (ctx) => ctx.scene.enter('quiz'));

// === Одновопросная викторина (без сессии) ===
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
    `*🎯 Вопрос:*\nЧто означает:\n\n*${cleanHanzi}*?`,
    Markup.inlineKeyboard(
      shuffled.map(opt => [Markup.button.callback(opt, `ans_${opt}_${word.translation}`)])
    )
  );
});

bot.action(/ans_(.+)_(.+)/, async (ctx) => {
  const userAnswer = ctx.match[1];
  const correct = ctx.match[2];
  const isCorrect = userAnswer === correct;
  await ctx.answerCbQuery(isCorrect ? '✅ Верно!' : `❌ Правильно: ${correct}`);
  
  // Предложить продолжить
  await ctx.reply('Продолжить?', 
    Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Ещё вопрос', 'more_quiz')],
      [Markup.button.callback('🏠 Меню', 'back_menu')]
    ])
  );
});

bot.action('more_quiz', (ctx) => {
  ctx.deleteMessage().then(() => {
    ctx.reply('🎯 Викторина', { reply_markup: { remove_keyboard: true } })
      .then(() => {
        // Эмуляция нажатия кнопки
        bot.handleUpdate({ message: { text: '🎯 Викторина', from: ctx.from, chat: ctx.chat } });
      });
  });
});

bot.action('back_menu', (ctx) => {
  ctx.editMessageText('Главное меню:', mainMenu);
});

// === Карточки (одна карточка за раз) ===
bot.hears('📚 Карточки', async (ctx) => {
  const word = getRandomWord();
  const cleanHanzi = removeEmojis(word.hanzi);
  
  await ctx.replyWithMarkdown(
    `*📚 Карточка:*\n\n` +
    `${word.hanzi}\n` +
    `🗣️ ${word.pinyin}\n\n` +
    `_Нажми, чтобы увидеть перевод_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Показать', `reveal_${cleanHanzi}_${word.translation}`)],
      [Markup.button.callback('⏭️ Следующая', 'next_card')],
      [Markup.button.callback('🏠 Меню', 'back_menu')]
    ])
  );
});

bot.action(/reveal_(.+)_(.+)/, (ctx) => {
  const translation = ctx.match[2];
  ctx.answerCbQuery(`🇷🇺 ${translation}`, { show_alert: true });
});

bot.action('next_card', (ctx) => {
  ctx.deleteMessage().then(() => {
    bot.handleUpdate({ message: { text: '📚 Карточки', from: ctx.from, chat: ctx.chat } });
  });
});

// === Категории (как раньше) ===
bot.hears('🏷️ Категории', async (ctx) => {
  const cats = getCategories();
  const buttons = cats.map(cat => [
    Markup.button.callback(`${cat} (${getWordsByCategory(cat).length})`, `cat_${cat}`)
  ]);
  await ctx.reply('Выберите категорию:', Markup.inlineKeyboard(buttons));
});

bot.action(/cat_(.+)/, async (ctx) => {
  const cat = ctx.match[1];
  const list = getWordsByCategory(cat);
  if (list.length === 0) return ctx.answerCbQuery('Пусто');
  const word = list[Math.floor(Math.random() * list.length)];
  await ctx.answerCbQuery(`${word.hanzi} — ${word.translation}`);
});

// === Статистика (общая, без персональных данных) ===
bot.hears('📊 Статистика', (ctx) => {
  const total = words.length;
  const cats = getCategories().length;
  ctx.replyWithMarkdown(
    `*📊 Статистика бота:*\n\n` +
    `• Всего слов: *${total}*\n` +
    `• Категорий: *${cats}*`
  );
});

// === Webhook ===
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    await bot.handleUpdate(body);
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error('Error:', e);
    return new Response(null, { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
