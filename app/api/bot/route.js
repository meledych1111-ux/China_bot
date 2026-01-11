// app/api/bot/route.js
import { Telegraf, Markup } from 'telegraf';
import {
  words,
  getRandomWord,
  getWordsByCategory,
  getCategories
} from '../../../lib/words.js';

// Утилита: убрать эмодзи (определяем локально, чтобы избежать ошибок импорта)
function removeEmojis(str) {
  return str.replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
}

const bot = new Telegraf(process.env.BOT_TOKEN);

const mainMenu = Markup.keyboard([
  ['🔤 Случайное слово', '🎯 Викторина'],
  ['🏷️ Категории']
]).resize();

// === Случайное слово (с эмодзи) ===
bot.hears('🔤 Случайное слово', async (ctx) => {
  const word = getRandomWord();
  await ctx.replyWithMarkdown(
    `🔤 *${word.hanzi}*\n` +
    `🗣️ ${word.pinyin}\n` +
    `🇷🇺 ${word.translation}\n\n` +
    `📝 ${word.example || '—'}`
  );
});

// === Викторина (эмодзи убраны из вопроса!) ===
bot.hears('🎯 Викторина', async (ctx) => {
  const correctWord = getRandomWord();
  const cleanHanzi = removeEmojis(correctWord.hanzi); // ← Только чистый ханьцзы

  let options = [correctWord.translation];
  while (options.length < 4) {
    const w = getRandomWord();
    if (!options.includes(w.translation)) options.push(w.translation);
  }
  const shuffled = options.sort(() => Math.random() - 0.5);

  await ctx.replyWithMarkdown(
    `Что означает слово:\n\n*${cleanHanzi}*?`,
    Markup.inlineKeyboard(
      shuffled.map(opt => [
        Markup.button.callback(opt, `quiz_${opt}_${correctWord.translation}`)
      ])
    )
  );
});

// Обработка ответа
bot.action(/quiz_(.+)_(.+)/, async (ctx) => {
  const userAnswer = ctx.match[1];
  const correct = ctx.match[2];
  const isCorrect = userAnswer === correct;
  await ctx.answerCbQuery(isCorrect ? '✅ Верно!' : `❌ Правильно: ${correct}`);
});

// === Категории ===
bot.hears('🏷️ Категории', async (ctx) => {
  const categories = getCategories();
  const buttons = categories.map(cat => [
    Markup.button.callback(`${cat} (${getWordsByCategory(cat).length})`, `cat_${cat}`)
  ]);
  await ctx.reply('Выберите категорию:', Markup.inlineKeyboard(buttons));
});

bot.action(/cat_(.+)/, async (ctx) => {
  const catName = ctx.match[1];
  const wordsInCat = getWordsByCategory(catName);
  if (wordsInCat.length === 0) return ctx.answerCbQuery('Нет слов');
  const word = wordsInCat[Math.floor(Math.random() * wordsInCat.length)];
  await ctx.answerCbQuery(`${word.hanzi} — ${word.translation}`);
});

// === Start ===
bot.start((ctx) => {
  ctx.reply('🇨🇳 Привет! Учись китайским словам.', mainMenu);
});

// === Webhook handlers ===
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    await bot.handleUpdate(body);
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Bot error:', error);
    return new Response(null, { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    ok: true,
    words: words.length,
    categories: getCategories().length
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
