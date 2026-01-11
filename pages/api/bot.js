import { Telegraf } from 'telegraf';
import { words } from '../../lib/words';

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

// Webhook handler for Vercel
export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body, res);
    } catch (e) {
      console.error('Bot error:', e);
      res.status(500).send('Error');
    }
    return;
  }
  res.status(404).send('Not found');
};
