// app/api/bot/route.js
import { Telegraf, Markup } from 'telegraf';
import { words, getRandomWord, getWordsByCategory, getCategories } from '../../../lib/words.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Хранилище состояния пользователей (в реальном проекте используйте базу данных)
const userStates = new Map();

// Главное меню
const mainMenu = Markup.keyboard([
  ['🎲 Случайное слово', '🎯 Викторина'],
  ['📚 Карточки', '📊 Статистика'],
  ['🗂️ По категориям', '🎮 Игра "Угадай слово"']
]).resize();

// Меню категорий
function getCategoriesMenu() {
  const categories = getCategories();
  const buttons = [];
  
  // Создаем кнопки по 2 в ряд
  for (let i = 0; i < categories.length; i += 2) {
    const row = [];
    if (categories[i]) row.push({ text: categories[i], callback_data: `cat_${categories[i]}` });
    if (categories[i + 1]) row.push({ text: categories[i + 1], callback_data: `cat_${categories[i + 1]}` });
    buttons.push(row);
  }
  
  buttons.push([{ text: '🏠 Главное меню', callback_data: 'main_menu' }]);
  
  return Markup.inlineKeyboard(buttons);
}

// Команда /start
bot.start((ctx) => {
  ctx.reply(
    '🇨🇳 *Добро пожаловать в бота для изучения китайского!*\n\n' +
    '📚 Я помогу тебе:\n' +
    '• Учить новые слова с карточками\n' +
    '• Проверять знания в викторинах\n' +
    '• Тренироваться по категориям\n' +
    '• Отслеживать прогресс\n\n' +
    '👇 Выбери действие в меню ниже:',
    { parse_mode: 'Markdown', ...mainMenu }
  );
});

// Команда /help
bot.help((ctx) => {
  ctx.reply(
    '*📖 Доступные команды:*\n\n' +
    '🎲 *Случайное слово* — изучай новое слово каждый день\n' +
    '🎯 *Викторина* — проверь свои знания в тесте\n' +
    '📚 *Карточки* — режим изучения по карточкам\n' +
    '🗂️ *По категориям* — учи слова по темам\n' +
    '🎮 *Игра "Угадай слово"* — увлекательная игра на запоминание\n' +
    '📊 *Статистика* — твой прогресс изучения\n\n' +
    '💡 *Совет:* Начни с карточек, а потом проверь себя в викторине!',
    { parse_mode: 'Markdown', ...mainMenu }
  );
});

// Обработчик текстовых сообщений (кнопки меню)
bot.hears('🎲 Случайное слово', async (ctx) => {
  const word = getRandomWord();
  await sendWordCard(ctx, word);
});

bot.hears('🎯 Викторина', (ctx) => startQuiz(ctx));
bot.hears('📚 Карточки', (ctx) => startFlashcards(ctx));
bot.hears('🗂️ По категориям', (ctx) => showCategories(ctx));
bot.hears('🎮 Игра "Угадай слово"', (ctx) => startWordGame(ctx));
bot.hears('📊 Статистика', (ctx) => showStats(ctx));
bot.hears('🏠 Главное меню', (ctx) => ctx.reply('Выбери действие:', mainMenu));

// Функция для показа категорий
async function showCategories(ctx) {
  ctx.reply(
    '*🗂️ Выбери категорию для изучения:*\n\n' +
    '👇 Нажми на кнопку с нужной темой:',
    { 
      parse_mode: 'Markdown',
      ...getCategoriesMenu()
    }
  );
}

// Обработчик выбора категории
bot.action(/cat_(.+)/, async (ctx) => {
  const category = ctx.match[1];
  const categoryWords = getWordsByCategory(category);
  
  if (categoryWords.length === 0) {
    return ctx.answerCbQuery('В этой категории пока нет слов', true);
  }
  
  userStates.set(ctx.from.id, { mode: 'category', category, index: 0 });
  
  await ctx.editMessageText(
    `*${category}*\n\n` +
    `📊 Слов в категории: ${categoryWords.length}\n` +
    `👇 Выбери режим изучения:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          { text: '📖 Учить по очереди', callback_data: `learn_${category}` },
          { text: '🎯 Викторина по теме', callback_data: `quiz_${category}` }
        ],
        [{ text: '🔙 Назад к категориям', callback_data: 'back_categories' }]
      ])
    }
  );
});

// Режим карточек
async function startFlashcards(ctx) {
  userStates.set(ctx.from.id, { 
    mode: 'flashcards', 
    index: 0,
    correct: 0,
    total: 0
  });
  
  await sendNextFlashcard(ctx);
}

// Отправка следующей карточки
async function sendNextFlashcard(ctx) {
  const state = userStates.get(ctx.from.id);
  if (!state || state.mode !== 'flashcards') return;
  
  const word = words[state.index];
  
  await ctx.reply(
    `*📚 Карточка ${state.index + 1}/${words.length}*\n\n` +
    `🔤 *${word.hanzi}*\n` +
    `🗣️ ${word.pinyin}\n\n` +
    `💡 _Нажми "Показать перевод", когда будешь готов_`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          { text: '👁️ Показать перевод', callback_data: `show_${state.index}` },
          { text: '⏭️ Следующая', callback_data: 'next_card' }
        ],
        [{ text: '🏁 Завершить', callback_data: 'end_cards' }]
      ])
    }
  );
}

// Показать перевод карточки
bot.action(/show_(\d+)/, async (ctx) => {
  const index = parseInt(ctx.match[1]);
  const word = words[index];
  
  await ctx.editMessageText(
    `*📚 Карточка ${index + 1}/${words.length}*\n\n` +
    `🔤 *${word.hanzi}*\n` +
    `🗣️ ${word.pinyin}\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `📝 Пример: ${word.example || '—'}\n` +
    `🏷️ Категория: ${word.category}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          { text: '✅ Я знал', callback_data: `knew_${index}` },
          { text: '❌ Не знал', callback_data: `not_knew_${index}` }
        ],
        [{ text: '➡️ Продолжить', callback_data: 'next_card' }]
      ])
    }
  );
});

// Обработка ответа в карточках
bot.action(/knew_(\d+)/, async (ctx) => {
  const state = userStates.get(ctx.from.id);
  if (state) {
    state.correct++;
    state.total++;
  }
  await ctx.answerCbQuery('✅ Отлично! Запомни это слово!');
});

bot.action(/not_knew_(\d+)/, async (ctx) => {
  const state = userStates.get(ctx.from.id);
  if (state) {
    state.total++;
  }
  await ctx.answerCbQuery('📝 Запомни это слово!');
});

// Следующая карточка
bot.action('next_card', async (ctx) => {
  const state = userStates.get(ctx.from.id);
  if (state) {
    state.index = (state.index + 1) % words.length;
    if (state.index === 0) {
      // Прошли все карточки
      await ctx.editMessageText(
        `🎉 *Ты прошел все карточки!*\n\n` +
        `📊 Результат: ${state.correct}/${state.total}\n` +
        `✅ Процент правильных: ${Math.round((state.correct / state.total) * 100)}%\n\n` +
        `Хочешь повторить?`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              { text: '🔄 Повторить', callback_data: 'restart_cards' },
              { text: '🎯 Викторина', callback_data: 'start_quiz' }
            ],
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ])
        }
      );
      return;
    }
  }
  await sendNextFlashcard(ctx);
});

// Начать викторину
async function startQuiz(ctx) {
  userStates.set(ctx.from.id, { 
    mode: 'quiz', 
    score: 0,
    total: 0,
    questions: []
  });
  
  await sendQuizQuestion(ctx);
}

// Отправка вопроса викторины
async function sendQuizQuestion(ctx) {
  const state = userStates.get(ctx.from.id);
  if (!state) return;
  
  const correct = getRandomWord();
  const options = [correct.translation];
  
  // Добавляем 3 неверных варианта
  while (options.length < 4) {
    const word = getRandomWord();
    if (!options.includes(word.translation)) {
      options.push(word.translation);
    }
  }
  
  // Сохраняем правильный ответ
  state.currentCorrect = correct.translation;
  state.questions.push({
    word: correct,
    answered: false,
    correct: false
  });
  
  // Перемешиваем варианты
  const shuffled = options.sort(() => 0.5 - Math.random());
  
  await ctx.reply(
    `*🎯 Вопрос ${state.questions.length}*\n\n` +
    `Что означает слово:\n\n` +
    `🔤 *${correct.hanzi}*\n` +
    `🗣️ ${correct.pinyin}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        shuffled.map(opt => [{ 
          text: opt, 
          callback_data: `ans_${opt}` 
        }]),
        [{ text: '🏁 Завершить викторину', callback_data: 'end_quiz' }]
      ])
    }
  );
}

// Обработка ответа в викторине
bot.action(/ans_(.+)/, async (ctx) => {
  const answer = ctx.match[1];
  const state = userStates.get(ctx.from.id);
  
  if (!state || state.mode !== 'quiz') return;
  
  const lastQuestion = state.questions[state.questions.length - 1];
  lastQuestion.answered = true;
  lastQuestion.userAnswer = answer;
  lastQuestion.correct = (answer === state.currentCorrect);
  
  state.total++;
  if (lastQuestion.correct) {
    state.score++;
    await ctx.answerCbQuery('✅ Верно! Молодец!');
  } else {
    await ctx.answerCbQuery(`❌ Неверно! Правильно: ${state.currentCorrect}`);
  }
  
  // Показываем правильный ответ
  await ctx.editMessageText(
    `*${lastQuestion.correct ? '✅ Верно!' : '❌ Неверно!'}*\n\n` +
    `🔤 ${lastQuestion.word.hanzi}\n` +
    `🗣️ ${lastQuestion.word.pinyin}\n` +
    `🇷🇺 *${lastQuestion.word.translation}*\n\n` +
    `📝 ${lastQuestion.word.example || ''}\n\n` +
    `📊 Твой счёт: ${state.score}/${state.total}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [{ text: '➡️ Следующий вопрос', callback_data: 'next_question' }],
        [{ text: '🏁 Завершить викторину', callback_data: 'end_quiz' }]
      ])
    }
  );
});

// Следующий вопрос
bot.action('next_question', async (ctx) => {
  await sendQuizQuestion(ctx);
});

// Игра "Угадай слово"
async function startWordGame(ctx) {
  userStates.set(ctx.from.id, {
    mode: 'wordgame',
    score: 0,
    streak: 0,
    maxStreak: 0,
    lives: 3
  });
  
  await sendWordGameQuestion(ctx);
}

async function sendWordGameQuestion(ctx) {
  const state = userStates.get(ctx.from.id);
  if (!state || state.lives <= 0) {
    await endWordGame(ctx);
    return;
  }
  
  const correct = getRandomWord();
  const options = [correct.translation];
  
  while (options.length < 3) {
    const word = getRandomWord();
    if (!options.includes(word.translation)) {
      options.push(word.translation);
    }
  }
  
  state.currentCorrect = correct.translation;
  
  const shuffled = options.sort(() => 0.5 - Math.random());
  
  await ctx.reply(
    `*🎮 Угадай слово!*\n\n` +
    `🔤 *${correct.hanzi}*\n` +
    `🗣️ ${correct.pinyin}\n\n` +
    `📊 Счёт: ${state.score} | 🏆 Серия: ${state.streak} | ❤️ Жизни: ${'❤️'.repeat(state.lives)}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        shuffled.map(opt => [{ 
          text: opt, 
          callback_data: `game_${opt}` 
        }]),
        [{ text: '🏁 Закончить игру', callback_data: 'end_game' }]
      ])
    }
  );
}

// Обработка ответа в игре
bot.action(/game_(.+)/, async (ctx) => {
  const answer = ctx.match[1];
  const state = userStates.get(ctx.from.id);
  
  if (!state) return;
  
  if (answer === state.currentCorrect) {
    state.score += 10;
    state.streak++;
    state.maxStreak = Math.max(state.maxStreak, state.streak);
    await ctx.answerCbQuery(`✅ Правильно! +10 очков! Серия: ${state.streak}`);
  } else {
    state.lives--;
    state.streak = 0;
    await ctx.answerCbQuery(`❌ Неверно! -1 жизнь. Осталось: ${state.lives}`);
  }
  
  if (state.lives > 0) {
    setTimeout(() => sendWordGameQuestion(ctx), 1000);
  } else {
    await endWordGame(ctx);
  }
});

// Завершение игры
async function endWordGame(ctx) {
  const state = userStates.get(ctx.from.id);
  if (!state) return;
  
  await ctx.reply(
    `*🎮 Игра окончена!*\n\n` +
    `🏆 *Итоговый счёт:* ${state.score} очков\n` +
    `🔥 *Лучшая серия:* ${state.maxStreak} правильных подряд\n` +
    `📊 *Всего вопросов:* ${Math.floor(state.score / 10)}\n\n` +
    `Хочешь сыграть ещё?`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          { text: '🔄 Играть снова', callback_data: 'restart_game' },
          { text: '🏠 Главное меню', callback_data: 'main_menu' }
        ]
      ])
    }
  );
  
  userStates.delete(ctx.from.id);
}

// Показать статистику
async function showStats(ctx) {
  const userId = ctx.from.id;
  const state = userStates.get(userId);
  
  let statsText = '*📊 Твоя статистика*\n\n';
  
  if (state) {
    if (state.mode === 'quiz') {
      statsText += `🎯 *Викторина:* ${state.score}/${state.total}\n`;
      if (state.total > 0) {
        statsText += `✅ Процент правильных: ${Math.round((state.score / state.total) * 100)}%\n`;
      }
    }
    if (state.mode === 'flashcards') {
      statsText += `📚 *Карточки:* ${state.correct}/${state.total}\n`;
    }
    if (state.mode === 'wordgame') {
      statsText += `🎮 *Игра:* ${state.score} очков\n`;
      statsText += `🔥 Лучшая серия: ${state.maxStreak}\n`;
    }
  }
  
  statsText += `\n📖 *Всего слов в базе:* ${words.length}\n`;
  statsText += `🗂️ *Категорий:* ${getCategories().length}\n\n`;
  statsText += `💪 Продолжай в том же духе!`;
  
  await ctx.reply(statsText, { 
    parse_mode: 'Markdown',
    ...mainMenu 
  });
}

// Вспомогательная функция для отправки карточки слова
async function sendWordCard(ctx, word) {
  await ctx.reply(
    `*🔤 Новое слово!*\n\n` +
    `${word.emoji || '📝'} *${word.hanzi}*\n` +
    `🗣️ *${word.pinyin}*\n` +
    `🇷🇺 *${word.translation}*\n\n` +
    `📝 *Пример:* ${word.example || '—'}\n` +
    `🏷️ *Категория:* ${word.category}\n` +
    `⭐ *Сложность:* ${'★'.repeat(word.difficulty || 1)}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          { text: '📚 Ещё слово', callback_data: 'another_word' },
          { text: '🎯 Викторина с этим словом', callback_data: `quiz_word_${word.hanzi}` }
        ]
      ])
    }
  );
}

// Обработчики для кнопок
bot.action('another_word', async (ctx) => {
  const word = getRandomWord();
  await sendWordCard(ctx, word);
});

bot.action('restart_cards', async (ctx) => {
  await startFlashcards(ctx);
});

bot.action('start_quiz', async (ctx) => {
  await startQuiz(ctx);
});

bot.action('end_quiz', async (ctx) => {
  const state = userStates.get(ctx.from.id);
  let resultText = '*🎯 Викторина завершена!*\n\n';
  
  if (state) {
    resultText += `📊 *Итоговый счёт:* ${state.score}/${state.total}\n`;
    if (state.total > 0) {
      resultText += `✅ *Процент правильных:* ${Math.round((state.score / state.total) * 100)}%\n`;
    }
    
    if (state.questions.length > 0) {
      resultText += `\n*📝 Разбор ошибок:*\n`;
      state.questions.forEach((q, i) => {
        if (!q.correct) {
          resultText += `\n${i + 1}. ${q.word.hanzi} — ${q.word.translation}`;
        }
      });
    }
    
    userStates.delete(ctx.from.id);
  }
  
  await ctx.editMessageText(resultText, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        { text: '🔄 Ещё викторина', callback_data: 'restart_quiz' },
        { text: '🏠 Главное меню', callback_data: 'main_menu' }
      ]
    ])
  });
});

bot.action('restart_quiz', async (ctx) => {
  await startQuiz(ctx);
});

bot.action('restart_game', async (ctx) => {
  await startWordGame(ctx);
});

bot.action('end_game', async (ctx) => {
  await endWordGame(ctx);
});

bot.action('main_menu', async (ctx) => {
  await ctx.editMessageText('Выбери действие:', mainMenu);
});

bot.action('back_categories', async (ctx) => {
  await showCategories(ctx);
});

bot.action('end_cards', async (ctx) => {
  const state = userStates.get(ctx.from.id);
  if (state) {
    await ctx.editMessageText(
      `📚 *Сессия карточек завершена!*\n\n` +
      `✅ Правильных: ${state.correct}/${state.total}\n` +
      `📊 Пройдено: ${Math.round((state.index / words.length) * 100)}%\n\n` +
      `Хочешь продолжить?`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            { text: '🔄 Продолжить', callback_data: 'restart_cards' },
            { text: '🎯 Викторина', callback_data: 'start_quiz' }
          ],
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ])
      }
    );
    userStates.delete(ctx.from.id);
  }
});

// POST-обработчик для Telegram webhook
export async function POST(request) {
  try {
    const update = await request.json();
    await bot.handleUpdate(update);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Bot error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// GET для проверки
export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'Telegram bot webhook ready',
    features: [
      '🎲 Случайные слова',
      '🎯 Викторины',
      '📚 Карточки для запоминания',
      '🗂️ Изучение по категориям',
      '🎮 Игра "Угадай слово"',
      '📊 Статистика прогресса'
    ]
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
