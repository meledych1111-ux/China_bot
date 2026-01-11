// app/api/bot/route.js
import { Telegraf, Markup } from 'telegraf';
import { words, getRandomWord, getWordsByCategory, getCategories } from '../../../lib/words.js';

// Убираем предупреждения
if (process.env.NODE_ENV === 'production') {
  const originalEmit = process.emit;
  process.emit = function (event, warning) {
    if (event === 'warning' && warning.name === 'DeprecationWarning') {
      return false;
    }
    return originalEmit.apply(process, arguments);
  };
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Хранилище сессий (временное, для Vercel лучше использовать Redis)
const sessions = new Map();

// Главное меню
const mainMenu = Markup.keyboard([
  ['🔤 Случайное слово', '📚 Карточки'],
  ['🎯 Викторина', '🏷️ Категории'],
  ['📊 Статистика', 'ℹ️ Помощь']
]).resize();

// ===== КОМАНДЫ =====

bot.start(async (ctx) => {
  const categories = getCategories();
  const totalWords = words.length;
  
  await ctx.replyWithMarkdown(
    `🇨🇳 *Привет, ${ctx.from.first_name || 'друг'}!*\n\n` +
    `Я помогу тебе выучить китайский язык.\n\n` +
    `📊 *Статистика:*\n` +
    `• Слов в базе: *${totalWords}*\n` +
    `• Категорий: *${categories.length}*\n\n` +
    `👇 Выбери действие в меню ниже:`,
    mainMenu
  );
});

bot.help((ctx) => {
  ctx.replyWithMarkdown(
    '*📖 Команды бота:*\n\n' +
    '🔤 *Случайное слово* — изучай новое слово\n' +
    '📚 *Карточки* — режим заучивания\n' +
    '🎯 *Викторина* — тест на знание слов\n' +
    '🏷️ *Категории* — слова по темам\n' +
    '📊 *Статистика* — твоя статистика\n\n' +
    '*💡 Быстрые команды:*\n' +
    '/start — Главное меню\n' +
    '/word — Случайное слово\n' +
    '/quiz — Начать викторину\n' +
    '/cards — Режим карточек\n' +
    '/stats — Статистика\n' +
    '/categories — Все категории'
  );
});

// ===== ТЕКСТОВЫЕ КОМАНДЫ =====

bot.hears('🔤 Случайное слово', sendRandomWord);
bot.hears('📚 Карточки', startCards);
bot.hears('🎯 Викторина', startQuiz);
bot.hears('🏷️ Категории', showCategories);
bot.hears('📊 Статистика', showStats);
bot.hears('ℹ️ Помощь', (ctx) => bot.help(ctx));

// ===== СЛЭШ-КОМАНДЫ =====

bot.command('word', sendRandomWord);
bot.command('cards', startCards);
bot.command('quiz', startQuiz);
bot.command('stats', showStats);
bot.command('categories', showCategories);

// ===== ОСНОВНЫЕ ФУНКЦИИ =====

// Случайное слово
async function sendRandomWord(ctx) {
  const word = getRandomWord();
  const categories = getCategories();
  const categoryInfo = categories.find(c => c.clean === word.category) || { clean: word.category, emoji: '' };
  
  await ctx.replyWithMarkdown(
    `*🔤 Новое слово для изучения:*\n\n` +
    `${word.hanzi}\n` +
    `🗣️ *${word.pinyin}*\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `📝 *Пример:* ${word.example || '—'}\n` +
    `🏷️ *Категория:* ${categoryInfo.clean} ${categoryInfo.emoji}\n` +
    `⭐ *Сложность:* ${'★'.repeat(word.difficulty || 1)}${'☆'.repeat(3 - (word.difficulty || 1))}\n\n` +
    `_Выбери действие:_`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Знаю', `know_${word.hanzi.replace(/\s/g, '_')}`),
        Markup.button.callback('❌ Учить', `learn_${word.hanzi.replace(/\s/g, '_')}`)
      ],
      [
        Markup.button.callback('🎯 Викторина', 'start_quiz'),
        Markup.button.callback('🔤 Ещё слово', 'another_word')
      ],
      [
        Markup.button.callback(`🏷️ ${categoryInfo.clean}`, `cat_${encodeURIComponent(categoryInfo.clean)}`)
      ]
    ])
  );
}

// Показать категории
async function showCategories(ctx) {
  const categories = getCategories();
  
  // Группируем категории по 2 в ряд
  const buttons = [];
  for (let i = 0; i < categories.length; i += 2) {
    const row = [];
    if (categories[i]) {
      row.push(Markup.button.callback(
        `${categories[i].clean} ${categories[i].emoji}`.trim(),
        `cat_${encodeURIComponent(categories[i].clean)}`
      ));
    }
    if (categories[i + 1]) {
      row.push(Markup.button.callback(
        `${categories[i + 1].clean} ${categories[i + 1].emoji}`.trim(),
        `cat_${encodeURIComponent(categories[i + 1].clean)}`
      ));
    }
    if (row.length > 0) {
      buttons.push(row);
    }
  }
  
  buttons.push([Markup.button.callback('🏠 Главное меню', 'main_menu')]);
  
  await ctx.replyWithMarkdown(
    `*🏷️ Выбери категорию:*\n\n` +
    `📊 Всего категорий: *${categories.length}*\n\n` +
    `👇 Нажми на кнопку с нужной темой:`,
    Markup.inlineKeyboard(buttons)
  );
}

// Карточки
async function startCards(ctx) {
  const sessionId = ctx.from.id;
  const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
  
  sessions.set(sessionId, {
    mode: 'cards',
    index: 0,
    correct: 0,
    total: 0,
    words: shuffledWords,
    startTime: Date.now()
  });
  
  await sendNextCard(ctx);
}

// Викторина
async function startQuiz(ctx) {
  const sessionId = ctx.from.id;
  const quizWords = [...words].sort(() => Math.random() - 0.5).slice(0, 5);
  
  sessions.set(sessionId, {
    mode: 'quiz',
    score: 0,
    current: 0,
    words: quizWords,
    startTime: Date.now()
  });
  
  await sendQuizQuestion(ctx);
}

// Статистика
async function showStats(ctx) {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  const categories = getCategories();
  
  let statsText = `*📊 Статистика бота:*\n\n`;
  
  if (session) {
    if (session.mode === 'cards') {
      const accuracy = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;
      statsText += `📚 *Карточки:*\n`;
      statsText += `• Правильных: ${session.correct}/${session.total}\n`;
      statsText += `• Точность: ${accuracy}%\n`;
      statsText += `• Осталось: ${session.words.length - session.index}\n\n`;
    }
    if (session.mode === 'quiz') {
      const accuracy = session.current > 0 ? Math.round((session.score / session.current) * 100) : 0;
      statsText += `🎯 *Викторина:*\n`;
      statsText += `• Счёт: ${session.score}/${session.current}\n`;
      statsText += `• Точность: ${accuracy}%\n`;
      statsText += `• Осталось: ${session.words.length - session.current}\n\n`;
    }
  }
  
  statsText += `*📈 Общая статистика:*\n`;
  statsText += `• Всего слов: ${words.length}\n`;
  statsText += `• Категорий: ${categories.length}\n\n`;
  
  statsText += `*🏆 Топ категорий:*\n`;
  const categoryCounts = categories.map(cat => {
    const count = getWordsByCategory(cat.clean).length;
    return { name: cat.clean, count, emoji: cat.emoji };
  }).sort((a, b) => b.count - a.count).slice(0, 5);
  
  categoryCounts.forEach((cat, i) => {
    statsText += `${i + 1}. ${cat.name} ${cat.emoji}: ${cat.count} слов\n`;
  });
  
  await ctx.replyWithMarkdown(statsText, mainMenu);
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

async function sendNextCard(ctx) {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  if (!session || session.index >= session.words.length) {
    await endCardSession(ctx);
    return;
  }
  
  const word = session.words[session.index];
  const categories = getCategories();
  const categoryInfo = categories.find(c => c.clean === word.category) || { clean: word.category, emoji: '' };
  
  await ctx.replyWithMarkdown(
    `*📚 Карточка ${session.index + 1}/${session.words.length}*\n\n` +
    `🔤 *${word.hanzi}*\n` +
    `🗣️ ${word.pinyin}\n\n` +
    `🏷️ ${categoryInfo.clean} ${categoryInfo.emoji}\n\n` +
    `_Нажми кнопку, чтобы увидеть перевод_`,
    Markup.inlineKeyboard([
      [Markup.button.callback('👁️ Показать перевод', `reveal_${session.index}`)],
      [Markup.button.callback('🏁 Завершить', 'end_cards')]
    ])
  );
}

async function sendQuizQuestion(ctx) {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  if (!session || session.current >= session.words.length) {
    await endQuizSession(ctx);
    return;
  }
  
  const word = session.words[session.current];
  const options = [word.translation];
  
  // Добавляем 3 неправильных варианта
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
    [Markup.button.callback(option, `answer_${option.replace(/\s/g, '_')}`)]
  );
  
  await ctx.replyWithMarkdown(
    `*🎯 Вопрос ${session.current + 1}/${session.words.length}*\n\n` +
    `Что означает слово:\n\n` +
    `🔤 *${word.hanzi}*\n` +
    `🗣️ ${word.pinyin}`,
    Markup.inlineKeyboard(buttons)
  );
}

// ===== ОБРАБОТЧИКИ INLINE-КНОПОК =====

// Главное меню
bot.action('main_menu', async (ctx) => {
  await ctx.editMessageText('Выбери действие:', mainMenu);
});

// Ещё слово
bot.action('another_word', sendRandomWord);

// Начать викторину
bot.action('start_quiz', startQuiz);

// Назад к категориям
bot.action('back_to_categories', showCategories);

// Обработка категорий
bot.action(/cat_(.+)/, async (ctx) => {
  try {
    const category = decodeURIComponent(ctx.match[1]);
    const categoryWords = getWordsByCategory(category);
    
    if (categoryWords.length === 0) {
      return ctx.answerCbQuery(`В категории "${category}" нет слов`, { show_alert: true });
    }
    
    const categories = getCategories();
    const categoryInfo = categories.find(c => c.clean === category) || { clean: category, emoji: '' };
    
    // Получаем случайное слово из категории
    const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    
    await ctx.editMessageText(
      `*🏷️ Категория: ${categoryInfo.clean} ${categoryInfo.emoji}*\n\n` +
      `📊 Слов в категории: *${categoryWords.length}*\n\n` +
      `🔤 *Пример слова:*\n` +
      `${randomWord.hanzi}\n` +
      `🗣️ ${randomWord.pinyin}\n` +
      `🇷🇺 ${randomWord.translation}\n\n` +
      `👇 Выбери режим изучения:`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('🎯 Викторина по теме', `catquiz_${encodeURIComponent(category)}`),
            Markup.button.callback('📚 Все слова', `catlist_${encodeURIComponent(category)}`)
          ],
          [
            Markup.button.callback('🔤 Случайное слово', `catword_${encodeURIComponent(category)}`),
            Markup.button.callback('📖 Карточки', `catlearn_${encodeURIComponent(category)}`)
          ],
          [Markup.button.callback('🔙 Назад к категориям', 'back_to_categories')]
        ])
      }
    );
  } catch (error) {
    console.error('Error in category handler:', error);
    await ctx.answerCbQuery('Произошла ошибка', { show_alert: true });
  }
});

// Викторина по категории
bot.action(/catquiz_(.+)/, async (ctx) => {
  try {
    const category = decodeURIComponent(ctx.match[1]);
    const categoryWords = getWordsByCategory(category);
    
    if (categoryWords.length < 3) {
      return ctx.answerCbQuery(
        `Для викторины нужно минимум 3 слова. В категории "${category}" только ${categoryWords.length} слов`,
        { show_alert: true }
      );
    }
    
    // Берем 5 случайных слов из категории
    const quizWords = [...categoryWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(5, categoryWords.length));
    
    // Сохраняем сессию
    const sessionId = ctx.from.id;
    sessions.set(sessionId, {
      mode: 'category_quiz',
      category: category,
      score: 0,
      current: 0,
      words: quizWords,
      startTime: Date.now()
    });
    
    await sendCategoryQuizQuestion(ctx);
  } catch (error) {
    console.error('Error in category quiz:', error);
    await ctx.answerCbQuery('Произошла ошибка', { show_alert: true });
  }
});

// Показать все слова категории
bot.action(/catlist_(.+)/, async (ctx) => {
  try {
    const category = decodeURIComponent(ctx.match[1]);
    const categoryWords = getWordsByCategory(category);
    
    if (categoryWords.length === 0) {
      return ctx.answerCbQuery(`В категории "${category}" нет слов`, { show_alert: true });
    }
    
    let wordsText = `*📚 Все слова категории "${category}":*\n\n`;
    
    categoryWords.forEach((word, index) => {
      wordsText += `*${index + 1}. ${word.hanzi}*\n`;
      wordsText += `🗣️ ${word.pinyin}\n`;
      wordsText += `🇷🇺 ${word.translation}\n`;
      if (word.example) {
        wordsText += `📝 ${word.example}\n`;
      }
      wordsText += `\n`;
    });
    
    // Разбиваем на части если слишком длинное сообщение
    if (wordsText.length > 4000) {
      wordsText = wordsText.substring(0, 4000) + '\n\n... (и ещё слова)';
    }
    
    await ctx.editMessageText(
      wordsText,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🎯 Викторина по теме', `catquiz_${encodeURIComponent(category)}`)],
          [Markup.button.callback('🔙 Назад', `cat_${encodeURIComponent(category)}`)]
        ])
      }
    );
  } catch (error) {
    console.error('Error in category list:', error);
    await ctx.answerCbQuery('Произошла ошибка', { show_alert: true });
  }
});

// Случайное слово из категории
bot.action(/catword_(.+)/, async (ctx) => {
  try {
    const category = decodeURIComponent(ctx.match[1]);
    const categoryWords = getWordsByCategory(category);
    
    if (categoryWords.length === 0) {
      return ctx.answerCbQuery(`В категории "${category}" нет слов`, { show_alert: true });
    }
    
    const word = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    const categories = getCategories();
    const categoryInfo = categories.find(c => c.clean === category) || { clean: category, emoji: '' };
    
    await ctx.editMessageText(
      `*🔤 Случайное слово из категории ${categoryInfo.clean} ${categoryInfo.emoji}:*\n\n` +
      `${word.hanzi}\n` +
      `🗣️ *${word.pinyin}*\n` +
      `🇷🇺 *${word.translation}*\n\n` +
      `📝 *Пример:* ${word.example || '—'}\n` +
      `⭐ *Сложность:* ${'★'.repeat(word.difficulty || 1)}${'☆'.repeat(3 - (word.difficulty || 1))}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('🔤 Ещё слово', `catword_${encodeURIComponent(category)}`),
            Markup.button.callback('🎯 Викторина', `catquiz_${encodeURIComponent(category)}`)
          ],
          [Markup.button.callback('🔙 Назад', `cat_${encodeURIComponent(category)}`)]
        ])
      }
    );
  } catch (error) {
    console.error('Error in category word:', error);
    await ctx.answerCbQuery('Произошла ошибка', { show_alert: true });
  }
});

// Карточки по категории
bot.action(/catlearn_(.+)/, async (ctx) => {
  try {
    const category = decodeURIComponent(ctx.match[1]);
    const categoryWords = getWordsByCategory(category);
    
    if (categoryWords.length === 0) {
      return ctx.answerCbQuery(`В категории "${category}" нет слов`, { show_alert: true });
    }
    
    const sessionId = ctx.from.id;
    const shuffledWords = [...categoryWords].sort(() => Math.random() - 0.5).slice(0, 10);
    
    sessions.set(sessionId, {
      mode: 'category_cards',
      category: category,
      index: 0,
      correct: 0,
      total: 0,
      words: shuffledWords,
      startTime: Date.now()
    });
    
    await sendNextCategoryCard(ctx);
  } catch (error) {
    console.error('Error in category cards:', error);
    await ctx.answerCbQuery('Произошла ошибка', { show_alert: true });
  }
});

// ===== ФУНКЦИИ ВИКТОРИНЫ ПО КАТЕГОРИИ =====

async function sendCategoryQuizQuestion(ctx) {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  if (!session || session.current >= session.words.length) {
    await endCategoryQuizSession(ctx);
    return;
  }
  
  const word = session.words[session.current];
  const options = [word.translation];
  
  // Добавляем неправильные варианты из ТОЙ ЖЕ категории
  const categoryWords = getWordsByCategory(session.category);
  while (options.length < 4) {
    const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    if (!options.includes(randomWord.translation) && randomWord.translation !== word.translation) {
      options.push(randomWord.translation);
    }
  }
  
  // Перемешиваем
  const shuffled = options.sort(() => Math.random() - 0.5);
  session.currentQuestion = word.translation;
  
  const buttons = shuffled.map(option => 
    [Markup.button.callback(option, `cat_answer_${option.replace(/\s/g, '_')}`)]
  );
  
  const categories = getCategories();
  const categoryInfo = categories.find(c => c.clean === session.category) || { clean: session.category, emoji: '' };
  
  await ctx.editMessageText(
    `*🎯 Викторина: ${categoryInfo.clean} ${categoryInfo.emoji}*\n` +
    `Вопрос ${session.current + 1}/${session.words.length}\n\n` +
    `Что означает слово:\n\n` +
    `🔤 *${word.hanzi}*\n` +
    `🗣️ ${word.pinyin}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    }
  );
}

// Обработчик ответа в викторине по категории
bot.action(/cat_answer_(.+)/, async (ctx) => {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  const answer = ctx.match[1].replace(/_/g, ' ');
  
  if (session && session.currentQuestion) {
    const isCorrect = answer === session.currentQuestion;
    const word = session.words[session.current];
    
    if (isCorrect) {
      session.score++;
      await ctx.answerCbQuery('✅ Верно!');
    } else {
      await ctx.answerCbQuery(`❌ Правильно: ${session.currentQuestion}`);
    }
    
    const categories = getCategories();
    const categoryInfo = categories.find(c => c.clean === session.category) || { clean: session.category, emoji: '' };
    
    await ctx.editMessageText(
      `*${isCorrect ? '✅ Правильно!' : '❌ Неверно'}*\n\n` +
      `🔤 ${word.hanzi}\n` +
      `🗣️ ${word.pinyin}\n` +
      `🇷🇺 *${word.translation}*\n\n` +
      `📝 ${word.example || ''}\n\n` +
      `📊 Счёт: ${session.score}/${session.current + 1}\n` +
      `🏷️ Категория: ${categoryInfo.clean} ${categoryInfo.emoji}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('➡️ Следующий вопрос', 'cat_next_question')],
          [Markup.button.callback('🏁 Завершить', 'cat_end_quiz')]
        ])
      }
    );
    
    session.current++;
  }
});

bot.action('cat_next_question', async (ctx) => {
  await sendCategoryQuizQuestion(ctx);
});

// ===== ФУНКЦИИ КАРТОЧЕК ПО КАТЕГОРИИ =====

async function sendNextCategoryCard(ctx) {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  if (!session || session.index >= session.words.length) {
    await endCategoryCardSession(ctx);
    return;
  }
  
  const word = session.words[session.index];
  const categories = getCategories();
  const categoryInfo = categories.find(c => c.clean === session.category) || { clean: session.category, emoji: '' };
  
  await ctx.editMessageText(
    `*📚 Карточка ${session.index + 1}/${session.words.length}*\n` +
    `🏷️ ${categoryInfo.clean} ${categoryInfo.emoji}\n\n` +
    `🔤 *${word.hanzi}*\n` +
    `🗣️ ${word.pinyin}\n\n` +
    `_Нажми кнопку, чтобы увидеть перевод_`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('👁️ Показать перевод', `cat_reveal_${session.index}`)],
        [Markup.button.callback('🏁 Завершить', 'cat_end_cards')]
      ])
    }
  );
}

// ===== ФУНКЦИИ ЗАВЕРШЕНИЯ СЕССИЙ =====

async function endCardSession(ctx) {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  if (session) {
    const accuracy = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;
    const timeSpent = Math.round((Date.now() - session.startTime) / 1000);
    
    await ctx.replyWithMarkdown(
      `📚 *Сессия карточек завершена!*\n\n` +
      `📊 *Результаты:*\n` +
      `• Правильных: ${session.correct}/${session.total}\n` +
      `• Точность: ${accuracy}%\n` +
      `• Время: ${timeSpent} сек.\n\n` +
      `🎉 *Молодец! Продолжай в том же духе!*`,
      mainMenu
    );
    
    sessions.delete(sessionId);
  }
}

async function endQuizSession(ctx) {
  const sessionId = ctx.from.id;
  const session = sessions.get(sessionId);
  
  if (session) {
    const accuracy = session.current > 0 ? Math.round((session.score / session.current) * 100) : 0;
    const timeSpent = Math.round((Date.now() - session.startTime) / 1000);
    
    let emoji = '😊';
    if (accuracy >= 80) emoji = '🎉';
    else if (accuracy >= 60) emoji = '👍';
    else if (accuracy < 40) emoji = '😔';
    
    await ctx.replyWithMarkdown(
      `🎯 *Викторина завершена!* ${emoji}\n\n` +
      `📊 *Результаты:*\n` +
      `• Счёт: ${session.score}/${session.current}\n` +
      `• Точность: ${accuracy}%\n` +
      `• Время: ${timeSpent} сек.\n\n` +
      `${accuracy >= 80 ? 'Отлично! Ты молодец!' : 
        accuracy >= 60 ? 'Хороший результат!' : 
        accuracy >= 40 ? 'Нормально, продолжай учиться!' : 
        'Повтори слова и попробуй ещё раз!'}`,
      mainMenu
    );
    
    sessions.delete(sessionId);
  }
}

// ===== ОБРАБОТЧИКИ WEBHOOK =====

export async function POST(request) {
  try {
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
  const categories = getCategories();
  const totalWords = words.length;
  
  return new Response(
    JSON.stringify({
      status: 'Bot is running on Vercel',
      timestamp: new Date().toISOString(),
      statistics: {
        total_words: totalWords,
        total_categories: categories.length,
        categories: categories.map(cat => ({
          name: cat.clean,
          emoji: cat.emoji,
          word_count: getWordsByCategory(cat.clean).length
        }))
      }
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
