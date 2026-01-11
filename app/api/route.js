// app/api/bot/route.js
import { Telegraf } from 'telegraf';
import { words } from '../../../lib/words.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) =>
  ctx.reply(
    '📚 Привет! Я помогу тебе выучить китайский!\n\n' +
    'Команды:\n' +
    '• /word — новое слово\n' +
    '• /quiz — проверь себя'
  )
);

bot.command('word', (ctx) => {
  const word = words[Math.floor(Math.random() * words.length)];
  ctx.reply(
    `🔤 ${word.hanzi}\n` +
    `🗣️ ${word.pinyin}\n` +
    `🇷🇺 ${word.translation}`
  );
});

bot.command('quiz', (ctx) => {
  const correct = words[Math.floor(Math.random() * words.length)];
  const options = [correct.translation];
  while (options.length < 3) {
    const w = words[Math.floor(Math.random() * words.length)];
    if (!options.includes(w.translation)) {
      options.push(w.translation);
    }
  }
  const shuffled = options.sort(() => 0.5 - Math.random());
  ctx.reply(
    `Что означает «${correct.hanzi}»?`,
    {
      reply_markup: {
        inline_keyboard: shuffled.map(opt => [{
          text: opt,
          callback_data: opt === correct.translation ? 'correct' : 'wrong'
        }])
      }
    }
  );
});

bot.action('correct', (ctx) => ctx.answerCbQuery('✅ Верно! Молодец!', true));
bot.action('wrong', (ctx) => ctx.answerCbQuery('❌ Почти! Попробуй ещё раз.', true));

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

// Опционально: GET для проверки (можно удалить в продакшене)
export async function GET() {
  return new Response(JSON.stringify({ status: 'Telegram bot webhook ready' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
