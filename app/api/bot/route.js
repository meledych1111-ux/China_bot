// app/api/bot/route.js
import { Telegraf, Markup } from 'telegraf';
import { Redis } from '@upstash/redis';

// Импорт ваших данных
import { words, getRandomWord, getWordsByCategory, getCategories } from '../../../lib/words.js';

// === Инициализация ===
const bot = new Telegraf(process.env.BOT_TOKEN);

// Redis только если вы добавили переменные в Vercel
let redis;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  });
}

// === Вспомогательные функции для сессий (если Redis подключен) ===
async function getSession(userId) {
  if (!redis) return {};
  const data = await redis.get(`session:${userId}`);
  return data || {};
}

async function setSession(userId, data) {
  if (!redis) return;
  await redis.setex(`session:${userId}`, 3600, data); // хранить 1 час
}

// === Главное меню ===
const mainMenu = Markup.keyboard([
  ['🔤 Случайное слово', '🎯 Викторина'],
  ['🏷️ Категории', 'ℹ️ Помощь']
]).resize();

// === Команды ===
bot.start((ctx) => {
  ctx.reply(
    `🇨🇳 Привет! Я помогу тебе учить китайские слова.\n\nВыбери действие:`,
    mainMenu
  );
});

bot.help((ctx) => {
  ctx.reply(
    '🔤 Случайное слово — новое слово\n' +
    '🎯 Викторина — угадай перевод\n' +
    '🏷️ Категории — слова по темам'
  );
});

// === Случайное слово ===
bot.hears('🔤 Случайное слово', async (ctx) => {
  const word = getRandomWord();
  await ctx.replyWithMarkdown(
    `🔤 *${word.hanzi}*\n` +
    `🗣️ ${word.pinyin}\n` +
    `🇷🇺 ${word.translation}\n\n` +
    `📝 ${word.example || '—'}`
  );
});

// === Викторина (работает даже БЕЗ Redis!) ===
bot.hears('🎯 Викторина', async (ctx) => {
  // Генерируем 4 варианта прямо в callback-данных
  const correctWord = getRandomWord();
  let options = [correctWord.translation];
  
  while (options.length < 4) {
    const w = getRandomWord();
    if (!options.includes(w.translation)) options.push(w.translation);
  }
  
  const shuffled = options.sort(() => Math.random() - 0.5);
  
  await ctx.replyWithMarkdown(
    `Что означает слово:\n\n*${correctWord.hanzi}*?`,
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
  
  if (isCorrect) {
    // Можно сохранить прогресс, если есть Redis
    if (redis) {
      const stats = await redis.hgetall(`user:${ctx.from.id}:stats`);
      const correctCount = (parseInt(stats?.correct) || 0) + 1;
      await redis.hset(`user:${ctx.from.id}:stats`, { correct: correctCount.toString() });
    }
  }
  
  // Предложить следующий вопрос
  await ctx.reply('Хочешь ещё вопрос?', 
    Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Ещё', 'more_quiz')],
      [Markup.button.callback('🏠 Меню', 'back_menu')]
    ])
  );
});

bot.action('more_quiz', (ctx) => {
  ctx.deleteMessage().then(() => {
    // Эмулируем нажатие кнопки "Викторина"
    ctx.reply('🎯 Викторина', { reply_markup: { remove_keyboard: true } })
      .then(() => bot.handleUpdate({ message: { text: '🎯 Викторина', from: ctx.from, chat: ctx.chat } }));
  });
});

bot.action('back_menu', (ctx) => {
  ctx.editMessageText('Главное меню:', mainMenu);
});

// === Категории ===
bot.hears('🏷️ Категории', async (ctx) => {
  const categories = getCategories();
  const buttons = categories.map(cat => [
    Markup.button.callback(`${cat.name} (${getWordsByCategory(cat.name).length})`, `cat_${cat.name}`)
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

// === Webhook handlers ===
export const dynamic = 'force-dynamic'; // важно для Vercel!

export async function POST(request) {
  try {
    const body = await request.json();
    await bot.handleUpdate(body);
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Bot error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    ok: true,
    words: words.length,
    categories: getCategories().length,
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
