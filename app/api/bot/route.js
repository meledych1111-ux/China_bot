// app/api/bot/route.js
import { Telegraf, Markup } from 'telegraf';
import { Redis } from '@upstash/redis';
import { RedisSession } from 'telegraf-session-redis';

import {
  words,
  getRandomWord,
  getWordsByCategory,
  getCategories
} from '../../../lib/words.js';

// === Инициализация ===
const bot = new Telegraf(process.env.BOT_TOKEN);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

// Подключаем Redis-сессии
bot.use(new RedisSession({ redis }));

// === Эмодзи для категорий (чисто для отображения) ===
const CATEGORY_EMOJIS = {
  greetings: '🗣️',
  food: '🍜',
  people: '👥',
  family: '👨‍👩‍👧‍👦',
  home: '🏠',
  city: '🏙️',
  transport: '🚇',
  shopping: '🛒',
  work: '💼',
  numbers: '🔢',
  time: '⏰',
  hobbies: '🎨',
  weather: '🌤️',
  emotions: '💖',
  emergency: '🚨',
  tech: '📱',
  verbs: '🎯'
};

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
    `🇨🇳 *Привет, ${ctx.from.first_name || 'друг'}!*\n\n` +
    `Я помогу тебе выучить китайский язык.\n\n` +
    `📊 *Статистика:*\n` +
    `• Слов в базе: *${totalWords}*\n` +
    `• Категорий: *${totalCategories}*\n\n` +
    `👇 Выбери действие:`,
    mainMenu
  );
});

bot.help((ctx) => {
  ctx.replyWithMarkdown(
    '*📖 Команды бота:*\n\n' +
    '🔤 *Случайное слово* — новое слово\n' +
    '📚 *Карточки* — учить по одной\n' +
    '🎯 *Викторина* — проверить знания\n' +
    '🏷️ *Категории* — слова по темам\n' +
    'ℹ️ *Помощь* — эта справка'
  );
});

// === Текстовые команды ===
bot.hears('🔤 Случайное слово', sendRandomWord);
bot.hears('📚 Карточки', startCards);
bot.hears('🎯 Викторина', startQuiz);
bot.hears('🏷️ Категории', showCategories);
bot.hears('ℹ️ Помощь', (ctx) => ctx.replyWithMarkdown('*ℹ️ Помощь...*')); // упрощено

// === Случайное слово ===
async function sendRandomWord(ctx) {
  const word = getRandomWord();
  const emoji = CATEGORY_EMOJIS[word.category] || '';
  
  await ctx.replyWithMarkdown(
    `*🔤 Новое слово:*\n\n` +
    `${word.hanzi}\n` +
    `🗣️ *${word.pinyin}*\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `📝 ${word.example || '—'}\n` +
    `🏷️ ${word.category} ${emoji}`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Знаю', `know_${word.hanzi}`),
        Markup.button.callback('❌ Учить', `learn_${word.hanzi}`)
      ],
      [Markup.button.callback('🎯 Викторина', 'start_quiz')]
    ])
  );
}

// === Викторина ===
async function startQuiz(ctx) {
  const quizWords = [...words].sort(() => Math.random() - 0.5).slice(0, 5);
  ctx.session = {
    mode: 'quiz',
    score: 0,
    current: 0,
    words: quizWords
  };
  await sendQuizQuestion(ctx);
}

async function sendQuizQuestion(ctx) {
  const session = await ctx.session;
  if (!session || session.current >= session.words.length) {
    return endQuiz(ctx);
  }

  const word = session.words[session.current];
  const options = [word.translation];
  
  // Добавляем 3 неправильных варианта
  while (options.length < 4) {
    const w = getRandomWord();
    if (!options.includes(w.translation)) options.push(w.translation);
  }
  
  const shuffled = options.sort(() => Math.random() - 0.5);
  session.correctAnswer = word.translation;
  session.currentWord = word.hanzi;

  const buttons = shuffled.map(opt => 
    [Markup.button.callback(opt, `quiz_ans_${opt}`)]
  );

  await ctx.replyWithMarkdown(
    `*🎯 Вопрос ${session.current + 1}/5*\n\n` +
    `Что означает:\n\n` +
    `🔤 *${word.hanzi}*`,
    Markup.inlineKeyboard(buttons)
  );
}

bot.action('start_quiz', startQuiz);

bot.action(/quiz_ans_(.+)/, async (ctx) => {
  const session = await ctx.session;
  if (!session || !session.correctAnswer) {
    return ctx.answerCbQuery('Сессия устарела. Начните заново.');
  }

  const userAnswer = ctx.match[1];
  const isCorrect = userAnswer === session.correctAnswer;
  
  if (isCorrect) session.score++;
  session.current++;

  const feedback = isCorrect ? '✅ Верно!' : `❌ Правильно: ${session.correctAnswer}`;
  await ctx.answerCbQuery(feedback);

  if (session.current >= session.words.length) {
    await endQuiz(ctx);
  } else {
    await sendQuizQuestion(ctx);
  }
});

async function endQuiz(ctx) {
  const session = await ctx.session;
  const score = session?.score || 0;
  const total = session?.words?.length || 5;
  const percent = Math.round((score / total) * 100);
  
  let msg = `🎯 *Викторина завершена!*\n\n`;
  msg += `📊 Результат: *${score}/${total}* (${percent}%)\n\n`;
  
  if (percent === 100) msg += '🏆 Идеально! Ты гений!';
  else if (percent >= 80) msg += '🎉 Отлично!';
  else if (percent >= 60) msg += '👍 Хорошо!';
  else msg += '💪 Повтори слова и попробуй снова!';

  await ctx.replyWithMarkdown(msg, mainMenu);
  ctx.session = null; // очищаем
}

// === Карточки ===
async function startCards(ctx) {
  const cards = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
  ctx.session = { mode: 'cards', index: 0, cards };
  await sendCard(ctx);
}

async function sendCard(ctx) {
  const session = await ctx.session;
  if (!session || session.index >= session.cards.length) {
    return endCards(ctx);
  }

  const word = session.cards[session.index];
  const emoji = CATEGORY_EMOJIS[word.category] || '';

  await ctx.replyWithMarkdown(
    `*📚 Карточка ${session.index + 1}/10*\n\n` +
    `${word.hanzi}\n` +
    `🗣️ ${word.pinyin}\n\n` +
    `🏷️ ${word.category} ${emoji}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Показать перевод', `reveal_${session.index}`)],
      [Markup.button.callback('⏭️ Следующая', 'next_card')],
      [Markup.button.callback('⏹️ Завершить', 'end_cards')]
    ])
  );
}

bot.action('next_card', async (ctx) => {
  const session = await ctx.session;
  if (session) session.index++;
  await sendCard(ctx);
});

bot.action('end_cards', (ctx) => endCards(ctx));

bot.action(/reveal_(\d+)/, async (ctx) => {
  const session = await ctx.session;
  const index = parseInt(ctx.match[1]);
  const word = session?.cards?.[index];
  
  if (!word) return ctx.answerCbQuery('Ошибка');
  
  await ctx.answerCbQuery(`🇷🇺 ${word.translation}`, { show_alert: true });
});

async function endCards(ctx) {
  const session = await ctx.session;
  const total = session?.cards?.length || 0;
  await ctx.replyWithMarkdown(
    `📚 *Карточки завершены!*\n\n` +
    `Показано слов: *${total}*\n\n` +
    `Продолжай в том же духе! 💪`,
    mainMenu
  );
  ctx.session = null;
}

// === Категории ===
async function showCategories(ctx) {
  const cats = getCategories();
  const buttons = [];
  for (let i = 0; i < cats.length; i += 2) {
    const row = [];
    if (cats[i]) row.push(Markup.button.callback(`${cats[i].name} ${CATEGORY_EMOJIS[cats[i].name] || ''}`, `cat_${cats[i].name}`));
    if (cats[i + 1]) row.push(Markup.button.callback(`${cats[i + 1].name} ${CATEGORY_EMOJIS[cats[i + 1].name] || ''}`, `cat_${cats[i + 1].name}`));
    if (row.length) buttons.push(row);
  }
  buttons.push([Markup.button.callback('🔙 Назад', 'back_main')]);

  await ctx.replyWithMarkdown(
    `*🏷️ Выбери категорию:*`,
    Markup.inlineKeyboard(buttons)
  );
}

bot.action(/cat_(.+)/, async (ctx) => {
  const catName = ctx.match[1];
  const catWords = getWordsByCategory(catName);
  if (catWords.length === 0) {
    return ctx.answerCbQuery('Нет слов в этой категории');
  }

  const word = catWords[Math.floor(Math.random() * catWords.length)];
  const emoji = CATEGORY_EMOJIS[catName] || '';

  await ctx.replyWithMarkdown(
    `*🏷️ Категория: ${catName} ${emoji}*\n\n` +
    `${word.hanzi}\n` +
    `🗣️ ${word.pinyin}\n` +
    `🇷🇺 ${word.translation}\n\n` +
    `Всего слов: ${catWords.length}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🎯 Викторина по теме', `cat_quiz_${catName}`)],
      [Markup.button.callback('🔤 Ещё слово', `cat_word_${catName}`)],
      [Markup.button.callback('🔙 Назад', 'back_categories')]
    ])
  );
});

bot.action(/cat_quiz_(.+)/, async (ctx) => {
  const catName = ctx.match[1];
  const catWords = getWordsByCategory(catName);
  if (catWords.length < 4) {
    return ctx.answerCbQuery('Нужно минимум 4 слова для викторины');
  }

  const quizWords = [...catWords].sort(() => Math.random() - 0.5).slice(0, 5);
  ctx.session = {
    mode: 'cat_quiz',
    category: catName,
    score: 0,
    current: 0,
    words: quizWords
  };
  await sendCatQuizQuestion(ctx);
});

async function sendCatQuizQuestion(ctx) {
  const session = await ctx.session;
  if (!session || session.current >= session.words.length) {
    return endCatQuiz(ctx);
  }

  const word = session.words[session.current];
  const catWords = getWordsByCategory(session.category);
  const options = [word.translation];

  while (options.length < 4 && options.length < catWords.length) {
    const w = catWords[Math.floor(Math.random() * catWords.length)];
    if (!options.includes(w.translation)) options.push(w.translation);
  }

  const shuffled = options.sort(() => Math.random() - 0.5);
  session.correctAnswer = word.translation;
  session.currentWord = word.hanzi;

  const buttons = shuffled.map(opt => 
    [Markup.button.callback(opt, `catq_ans_${opt}`)]
  );

  const emoji = CATEGORY_EMOJIS[session.category] || '';
  await ctx.replyWithMarkdown(
    `*🎯 Викторина: ${session.category} ${emoji}*\n` +
    `Вопрос ${session.current + 1}/5\n\n` +
    `Что означает:\n\n` +
    `🔤 *${word.hanzi}*`,
    Markup.inlineKeyboard(buttons)
  );
}

bot.action(/catq_ans_(.+)/, async (ctx) => {
  const session = await ctx.session;
  if (!session || !session.correctAnswer) {
    return ctx.answerCbQuery('Сессия устарела');
  }

  const userAnswer = ctx.match[1];
  const isCorrect = userAnswer === session.correctAnswer;
  
  if (isCorrect) session.score++;
  session.current++;

  await ctx.answerCbQuery(isCorrect ? '✅ Верно!' : `❌ Правильно: ${session.correctAnswer}`);

  if (session.current >= session.words.length) {
    await endCatQuiz(ctx);
  } else {
    await sendCatQuizQuestion(ctx);
  }
});

async function endCatQuiz(ctx) {
  const session = await ctx.session;
  const score = session?.score || 0;
  const total = session?.words?.length || 5;
  const cat = session?.category || 'тема';
  const emoji = CATEGORY_EMOJIS[cat] || '';

  await ctx.replyWithMarkdown(
    `🎯 *Викторина "${cat}" завершена!* ${emoji}\n\n` +
    `Результат: *${score}/${total}*`,
    mainMenu
  );
  ctx.session = null;
}

bot.action(/cat_word_(.+)/, async (ctx) => {
  const catName = ctx.match[1];
  const catWords = getWordsByCategory(catName);
  const word = catWords[Math.floor(Math.random() * catWords.length)];
  const emoji = CATEGORY_EMOJIS[catName] || '';

  await ctx.replyWithMarkdown(
    `*🔤 Слово из "${catName}" ${emoji}:*\n\n` +
    `${word.hanzi}\n` +
    `🗣️ ${word.pinyin}\n` +
    `🇷🇺 ${word.translation}\n\n` +
    `📝 ${word.example || '—'}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Ещё', `cat_word_${catName}`)],
      [Markup.button.callback('🔙 Назад', `cat_${catName}`)]
    ])
  );
});

// === Навигация ===
bot.action('back_main', (ctx) => ctx.editMessageText('Главное меню:', mainMenu));
bot.action('back_categories', showCategories);

// === Webhook ===
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    await bot.handleUpdate(body);
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error('Bot error:', e);
    return new Response(null, { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    status: 'OK',
    words: words.length,
    categories: getCategories().length
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
