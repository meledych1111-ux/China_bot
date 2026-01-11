// app/api/bot/route.js
import { Telegraf, Markup } from 'telegraf';
import { words, getRandomWord, getWordsByCategory, getCategories } from '../../../lib/words.js';

// Убираем предупреждения в production
if (process.env.NODE_ENV === 'production') {
  process.removeAllListeners('warning');
}

// Инициализируем бота с опциями для Vercel
const bot = new Telegraf(process.env.BOT_TOKEN, {
  telegram: {
    apiRoot: 'https://api.telegram.org',
    webhookReply: true
  }
});

// Временное хранилище сессий (в production лучше использовать Redis)
const sessions = new Map();

// Меню
const mainMenu = Markup.keyboard([
  ['🔤 Случайное слово', '📚 Карточки'],
  ['🎯 Викторина', '📊 Прогресс'],
  ['🏷️ Категории', 'ℹ️ Помощь']
]).resize().oneTime();

// Команда /start
bot.start((ctx) => {
  ctx.replyWithMarkdown(
    `🇨🇳 *Добро пожаловать, ${ctx.from.first_name || 'друг'}!*\n\n` +
    `Я помогу тебе выучить китайский язык.\n\n` +
    `*📊 Статистика:*\n` +
    `• Слов в базе: *${words.length}*\n` +
    `• Категорий: *${getCategories().length}*\n\n` +
    `👇 Выбери действие в меню ниже:`,
    mainMenu
  );
});

// Команда /help
bot.help((ctx) => {
  ctx.replyWithMarkdown(
    '*📖 Команды бота:*\n\n' +
    '🔤 *Случайное слово* — изучай новое слово\n' +
    '📚 *Карточки* — режим заучивания\n' +
    '🎯 *Викторина* — тест на знание слов\n' +
    '🏷️ *Категории* — слова по темам\n' +
    '📊 *Прогресс* — твоя статистика\n\n' +
    '*💡 Быстрые команды:*\n' +
    '/start — Главное меню\n' +
    '/word — Случайное слово\n' +
    '/quiz — Начать викторину\n' +
    '/cards — Режим карточек\n' +
    '/stats — Статистика'
  );
});

// Текстовые команды
bot.hears('🔤 Случайное слово', sendRandomWord);
bot.hears('📚 Карточки', startCards);
bot.hears('🎯 Викторина', startQuiz);
bot.hears('🏷️ Категории', showCategories);
bot.hears('📊 Прогресс', showStats);
bot.hears('ℹ️ Помощь', (ctx) => ctx.reply('Используй меню или команды 👆'));

// Команды через слэш
bot.command('word', sendRandomWord);
bot.command('cards', startCards);
bot.command('quiz', startQuiz);
bot.command('stats', showStats);

// Функция отправки случайного слова
async function sendRandomWord(ctx) {
  const word = getRandomWord();
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Знаю', `know_${word.hanzi}`),
      Markup.button.callback('❌ Учить', `learn_${word.hanzi}`)
    ],
    [
      Markup.button.callback('🎯 Викторина', `quiz_from_${word.hanzi}`),
      Markup.button.callback('🔤 Ещё слово', 'another_word')
    ]
  ]);
  
  await ctx.replyWithMarkdown(
    `*🔤 Новое слово для изучения:*\n\n` +
    `${word.emoji || '📝'} *${word.hanzi}*\n` +
    `🗣️ *${word.pinyin}*\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `📝 *Пример:* ${word.example || '—'}\n` +
    `🏷️ *Категория:* ${word.category}\n` +
    `⭐ *Сложность:* ${'★'.repeat(word.difficulty || 1)}${'☆'.repeat(3 - (word.difficulty || 1))}`,
    keyboard
  );
}

// Функция карточек
async function startCards(ctx) {
  const sessionId = ctx.from.id;
  sessions.set(sessionId, {
    mode: 'cards',
    index: 0,
    correct: 0,
    total: 0,
    words: [...words].sort(() => Math.random() - 0.5)
  });
  
  await sendNextCard(ctx);
}

async function sendNextCard(ctx) {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  if (!session || session.words.length === 0) {
    return ctx.reply('📚 Все карточки пройдены!');
  }
  
  const word = session.words[session.index];
  
  await ctx.replyWithMarkdown(
    `*📚 Карточка ${session.index + 1}/${session.words.length}*\n\n` +
    `🔤 *${word.hanzi}*\n` +
    `🗣️ ${word.pinyin}\n\n` +
    `_Нажми кнопку, чтобы увидеть перевод_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Показать перевод', `reveal_${session.index}`)],
      [Markup.button.callback('🏁 Завершить', 'end_cards')]
    ])
  );
}

// Функция викторины
async function startQuiz(ctx) {
  const sessionId = ctx.from.id;
  const quizWords = [...words].sort(() => Math.random() - 0.5).slice(0, 5);
  
  sessions.set(sessionId, {
    mode: 'quiz',
    score: 0,
    current: 0,
    words: quizWords
  });
  
  await sendQuizQuestion(ctx);
}

async function sendQuizQuestion(ctx) {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  if (!session || session.current >= session.words.length) {
    return showQuizResults(ctx);
  }
  
  const word = session.words[session.current];
  const options = [word.translation];
  
  // Добавляем неверные варианты
  while (options.length < 4) {
    const randomWord = getRandomWord();
    if (!options.includes(randomWord.translation)) {
      options.push(randomWord.translation);
    }
  }
  
  // Перемешиваем
  const shuffled = options.sort(() => Math.random() - 0.5);
  session.currentQuestion = word.translation;
  
  const buttons = shuffled.map(option => 
    [Markup.button.callback(option, `answer_${option}`)]
  );
  
  await ctx.replyWithMarkdown(
    `*🎯 Вопрос ${session.current + 1}/${session.words.length}*\n\n` +
    `Что означает слово:\n\n` +
    `🔤 *${word.hanzi}*\n` +
    `🗣️ ${word.pinyin}`,
    Markup.inlineKeyboard(buttons)
  );
}

// Функция категорий
async function showCategories(ctx) {
  const categories = getCategories();
  const buttons = [];
  
  for (let i = 0; i < categories.length; i += 2) {
    const row = [];
    if (categories[i]) row.push(Markup.button.callback(categories[i], `cat_${categories[i]}`));
    if (categories[i + 1]) row.push(Markup.button.callback(categories[i + 1], `cat_${categories[i + 1]}`));
    buttons.push(row);
  }
  
  buttons.push([Markup.button.callback('🏠 Главное меню', 'main_menu')]);
  
  await ctx.replyWithMarkdown(
    '*🏷️ Выбери категорию:*\n\n' +
    '👇 Нажми на кнопку с нужной темой:',
    Markup.inlineKeyboard(buttons)
  );
}

// Функция статистики
async function showStats(ctx) {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  let stats = '*📊 Твоя статистика:*\n\n';
  
  if (session) {
    if (session.mode === 'cards') {
      stats += `📚 *Карточки:* ${session.correct}/${session.total} правильных\n`;
    }
    if (session.mode === 'quiz') {
      stats += `🎯 *Викторина:* ${session.score}/${session.current} правильных\n`;
    }
  }
  
  stats += `\n📖 *Всего слов в базе:* ${words.length}\n`;
  stats += `🏷️ *Категорий:* ${getCategories().length}\n\n`;
  stats += `💪 Продолжай учиться!`;
  
  await ctx.replyWithMarkdown(stats);
}

// Обработчики inline-кнопок
bot.action('another_word', sendRandomWord);
bot.action('main_menu', (ctx) => ctx.reply('Главное меню:', mainMenu));

bot.action(/reveal_(\d+)/, async (ctx) => {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  const index = parseInt(ctx.match[1]);
  
  if (session && session.words[index]) {
    const word = session.words[index];
    await ctx.editMessageText(
      `*📚 Карточка ${index + 1}/${session.words.length}*\n\n` +
      `🔤 *${word.hanzi}*\n` +
      `🗣️ ${word.pinyin}\n` +
      `🇷🇺 *${word.translation}*\n\n` +
      `📝 ${word.example || ''}\n\n` +
      `_Это слово было сложным?_`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('✅ Легко', `easy_${index}`),
            Markup.button.callback('😐 Нормально', `medium_${index}`),
            Markup.button.callback('❌ Сложно', `hard_${index}`)
          ],
          [Markup.button.callback('➡️ Далее', 'next_card')]
        ])
      }
    );
  }
});

bot.action('next_card', async (ctx) => {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  if (session) {
    session.index++;
    if (session.index >= session.words.length) {
      await ctx.editMessageText(
        `🎉 *Все карточки пройдены!*\n\n` +
        `📊 Результат: ${session.correct}/${session.total}\n\n` +
        `Хочешь повторить?`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Ещё раз', 'start_cards')],
            [Markup.button.callback('🏠 В меню', 'main_menu')]
          ])
        }
      );
      sessions.delete(sessionId);
    } else {
      await sendNextCard(ctx);
    }
  }
});

bot.action(/answer_(.+)/, async (ctx) => {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  const answer = ctx.match[1];
  
  if (session && session.currentQuestion) {
    const isCorrect = answer === session.currentQuestion;
    const word = session.words[session.current];
    
    if (isCorrect) {
      session.score++;
      await ctx.answerCbQuery('✅ Верно!');
    } else {
      await ctx.answerCbQuery(`❌ Правильно: ${session.currentQuestion}`);
    }
    
    await ctx.editMessageText(
      `*${isCorrect ? '✅ Правильно!' : '❌ Неверно'}*\n\n` +
      `🔤 ${word.hanzi}\n` +
      `🗣️ ${word.pinyin}\n` +
      `🇷🇺 *${word.translation}*\n\n` +
      `📝 ${word.example || ''}\n\n` +
      `📊 Счёт: ${session.score}/${session.current + 1}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('➡️ Следующий вопрос', 'next_question')]
        ])
      }
    );
    
    session.current++;
  }
});

bot.action('next_question', async (ctx) => {
  await sendQuizQuestion(ctx);
});

bot.action(/cat_(.+)/, async (ctx) => {
  const category = ctx.match[1];
  const categoryWords = getWordsByCategory(category);
  
  if (categoryWords.length === 0) {
    return ctx.answerCbQuery('В этой категории пока нет слов', { show_alert: true });
  }
  
  const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
  
  await ctx.editMessageText(
    `*🏷️ Категория: ${category}*\n\n` +
    `📊 Слов в категории: ${categoryWords.length}\n\n` +
    `🔤 *Пример слова:*\n\n` +
    `${randomWord.emoji || '📝'} *${randomWord.hanzi}*\n` +
    `🗣️ ${randomWord.pinyin}\n` +
    `🇷🇺 ${randomWord.translation}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('🎯 Викторина по теме', `cat_quiz_${category}`),
          Markup.button.callback('📚 Все слова', `cat_all_${category}`)
        ],
        [Markup.button.callback('🔙 Назад', 'back_cats')]
      ])
    }
  );
});

bot.action('back_cats', showCategories);
bot.action('start_cards', startCards);
bot.action('end_cards', async (ctx) => {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  if (session) {
    await ctx.editMessageText(
      `📚 *Сессия завершена*\n\n` +
      `✅ Правильных ответов: ${session.correct}\n` +
      `📊 Всего карточек: ${session.index}\n\n` +
      `🏁 Возвращайся к учёбе!`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🏠 В меню', 'main_menu')]
        ])
      }
    );
    sessions.delete(sessionId);
  }
});

async function showQuizResults(ctx) {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  if (session) {
    const percentage = Math.round((session.score / session.words.length) * 100);
    let emoji = '😊';
    if (percentage >= 80) emoji = '🎉';
    if (percentage >= 60) emoji = '👍';
    if (percentage < 40) emoji = '😔';
    
    await ctx.replyWithMarkdown(
      `*🎯 Викторина завершена!* ${emoji}\n\n` +
      `📊 *Результат:* ${session.score}/${session.words.length}\n` +
      `✅ *Процент правильных:* ${percentage}%\n\n` +
      `💪 ${
        percentage >= 80 ? 'Отлично! Ты молодец!' :
        percentage >= 60 ? 'Хороший результат!' :
        percentage >= 40 ? 'Нормально, продолжай учиться!' :
        'Повтори слова и попробуй ещё раз!'
      }`,
      Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Новая викторина', 'start_quiz')],
        [Markup.button.callback('🏠 В меню', 'main_menu')]
      ])
    );
    
    sessions.delete(sessionId);
  }
}

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error(`Ошибка для ${ctx.updateType}:`, err);
  if (ctx.chat) {
    ctx.reply('❌ Произошла ошибка. Попробуй ещё раз.');
  }
});

// Vercel handler
export async function POST(request) {
  try {
    // Подавляем предупреждения для production
    if (process.env.VERCEL_ENV === 'production') {
      const originalEmit = process.emit;
      process.emit = function (event, ...args) {
        if (event === 'warning') {
          return false; // Игнорируем предупреждения
        }
        return originalEmit.apply(process, [event, ...args]);
      };
    }
    
    const body = await request.json();
    await bot.handleUpdate(body);
    
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Bot error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'Bot is running on Vercel',
      timestamp: new Date().toISOString(),
      endpoints: {
        POST: '/api/bot - Telegram webhook'
      },
      info: {
        total_words: words.length,
        categories: getCategories().length
      }
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
