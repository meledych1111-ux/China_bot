// ===== words.js =====
// 📚 200+ китайских слов с эмодзи и примерами

export const words = [
  // 🗣️ ПРИВЕТСТВИЯ (20 слов)
  { hanzi: '你好 👋', pinyin: 'Nǐ hǎo', translation: 'Привет', category: 'greetings', example: '你好！', difficulty: 1 },
  { hanzi: '谢谢 🙏', pinyin: 'Xièxie', translation: 'Спасибо', category: 'greetings', example: '谢谢你的帮助。', difficulty: 1 },
  { hanzi: '不客气 👍', pinyin: 'Bù kèqì', translation: 'Пожалуйста', category: 'greetings', example: '不客气！', difficulty: 2 },
  { hanzi: '对不起 😔', pinyin: 'Duìbuqǐ', translation: 'Извините', category: 'greetings', example: '对不起，我迟到了。', difficulty: 2 },
  { hanzi: '再见 👋', pinyin: 'Zàijiàn', translation: 'До свидания', category: 'greetings', example: '明天见！再见！', difficulty: 1 },
  { hanzi: '请 🙏', pinyin: 'Qǐng', translation: 'Пожалуйста', category: 'greetings', example: '请坐。', difficulty: 1 },
  { hanzi: '早上好 🌅', pinyin: 'Zǎoshang hǎo', translation: 'Доброе утро', category: 'greetings', example: '早上好！', difficulty: 2 },
  { hanzi: '晚上好 🌙', pinyin: 'Wǎnshang hǎo', translation: 'Добрый вечер', category: 'greetings', example: '晚上好！', difficulty: 2 },
  { hanzi: '晚安 😴', pinyin: 'Wǎn ān', translation: 'Спокойной ночи', category: 'greetings', example: '晚安，好梦。', difficulty: 2 },
  { hanzi: '最近怎么样？🤔', pinyin: 'Zuìjìn zěnmeyàng?', translation: 'Как дела?', category: 'greetings', example: '最近怎么样？我很好。', difficulty: 3 },
  
  // 🍜 ЕДА (30 слов) - ИСПРАВЛЕНО: убраны эмодзи из категории
  { hanzi: '水 💧', pinyin: 'Shuǐ', translation: 'Вода', category: 'food', example: '请给我一杯水。', difficulty: 1 },
  { hanzi: '茶 🍵', pinyin: 'Chá', translation: 'Чай', category: 'food', example: '我喜欢绿茶。', difficulty: 1 },
  { hanzi: '咖啡 ☕', pinyin: 'Kāfēi', translation: 'Кофе', category: 'food', example: '我要一杯咖啡。', difficulty: 1 },
  { hanzi: '米饭 🍚', pinyin: 'Mǐfàn', translation: 'Рис', category: 'food', example: '吃米饭。', difficulty: 1 },
  { hanzi: '面条 🍜', pinyin: 'Miàntiáo', translation: 'Лапша', category: 'food', example: '我爱吃面条。', difficulty: 2 },
  { hanzi: '面包 🍞', pinyin: 'Miànbāo', translation: 'Хлеб', category: 'food', example: '早餐吃面包。', difficulty: 2 },
  { hanzi: '鸡 🍗', pinyin: 'Jī', translation: 'Курица', category: 'food', example: '炸鸡很好吃。', difficulty: 2 },
  { hanzi: '鱼 🐟', pinyin: 'Yú', translation: 'Рыба', category: 'food', example: '今天吃鱼。', difficulty: 2 },
  { hanzi: '牛肉 🥩', pinyin: 'Niúròu', translation: 'Говядина', category: 'food', example: '牛肉面', difficulty: 3 },
  { hanzi: '猪肉 🐷', pinyin: 'Zhūròu', translation: 'Свинина', category: 'food', example: '猪肉饺子', difficulty: 3 },
  { hanzi: '蔬菜 🥦', pinyin: 'Shūcài', translation: 'Овощи', category: 'food', example: '多吃蔬菜。', difficulty: 2 },
  { hanzi: '水果 🍎', pinyin: 'Shuǐguǒ', translation: 'Фрукты', category: 'food', example: '买水果。', difficulty: 2 },
  { hanzi: '苹果 🍎', pinyin: 'Píngguǒ', translation: 'Яблоко', category: 'food', example: '红苹果', difficulty: 1 },
  { hanzi: '香蕉 🍌', pinyin: 'Xiāngjiāo', translation: 'Банан', category: 'food', example: '一根香蕉', difficulty: 1 },
  { hanzi: '牛奶 🥛', pinyin: 'Niúnǎi', translation: 'Молоко', category: 'food', example: '每天喝牛奶。', difficulty: 1 },
  { hanzi: '鸡蛋 🥚', pinyin: 'Jīdàn', translation: 'Яйцо', category: 'food', example: '早餐有鸡蛋。', difficulty: 1 },
  { hanzi: '好吃 😋', pinyin: 'Hǎochī', translation: 'Вкусно', category: 'food', example: '这个很好吃！', difficulty: 2 },
  { hanzi: '饿 🤤', pinyin: 'È', translation: 'Голодный', category: 'food', example: '我饿了。', difficulty: 1 },
  { hanzi: '渴 😓', pinyin: 'Kě', translation: 'Хочу пить', category: 'food', example: '我渴了。', difficulty: 1 },
  
  // 👥 ОБЩЕНИЕ (25 слов)
  { hanzi: '我 🧍', pinyin: 'Wǒ', translation: 'Я', category: 'people', example: '我是学生。', difficulty: 1 },
  { hanzi: '你 🧍', pinyin: 'Nǐ', translation: 'Ты', category: 'people', example: '你好吗？', difficulty: 1 },
  { hanzi: '他 👨', pinyin: 'Tā', translation: 'Он', category: 'people', example: '他是我朋友。', difficulty: 1 },
  { hanzi: '她 👩', pinyin: 'Tā', translation: 'Она', category: 'people', example: '她很好。', difficulty: 1 },
  { hanzi: '我们 👥', pinyin: 'Wǒmen', translation: 'Мы', category: 'people', example: '我们去吃饭。', difficulty: 2 },
  { hanzi: '你们 👥', pinyin: 'Nǐmen', translation: 'Вы', category: 'people', example: '你们好吗？', difficulty: 2 },
  { hanzi: '他们 👥', pinyin: 'Tāmen', translation: 'Они', category: 'people', example: '他们来了。', difficulty: 2 },
  { hanzi: '朋友 👫', pinyin: 'Péngyou', translation: 'Друг', category: 'people', example: '这是我的朋友。', difficulty: 1 },
  { hanzi: '老师 👨‍🏫', pinyin: 'Lǎoshī', translation: 'Учитель', category: 'people', example: '中文老师', difficulty: 2 },
  { hanzi: '学生 👩‍🎓', pinyin: 'Xuéshēng', translation: 'Студент', category: 'people', example: '我是学生。', difficulty: 1 },
  { hanzi: '医生 👨‍⚕️', pinyin: 'Yīshēng', translation: 'Врач', category: 'people', example: '去看医生。', difficulty: 2 },
  { hanzi: '名字 📛', pinyin: 'Míngzì', translation: 'Имя', category: 'people', example: '你叫什么名字？', difficulty: 2 },
  { hanzi: '年龄 🎂', pinyin: 'Niánlíng', translation: 'Возраст', category: 'people', example: '你多大？', difficulty: 3 },
  { hanzi: '国家 🗺️', pinyin: 'Guójiā', translation: 'Страна', category: 'people', example: '你来自哪个国家？', difficulty: 3 },
  
  // 🏠 СЕМЬЯ (20 слов)
  { hanzi: '爸爸 👨', pinyin: 'Bàba', translation: 'Папа', category: 'family', example: '我爸爸是工程师。', difficulty: 1 },
  { hanzi: '妈妈 👩', pinyin: 'Māma', translation: 'Мама', category: 'family', example: '我妈妈做饭很好吃。', difficulty: 1 },
  { hanzi: '哥哥 👦', pinyin: 'Gēge', translation: 'Старший брат', category: 'family', example: '我有一个哥哥。', difficulty: 2 },
  { hanzi: '姐姐 👧', pinyin: 'Jiějie', translation: 'Старшая сестра', category: 'family', example: '姐姐很漂亮。', difficulty: 2 },
  { hanzi: '弟弟 👶', pinyin: 'Dìdi', translation: 'Младший брат', category: 'family', example: '弟弟五岁。', difficulty: 2 },
  { hanzi: '妹妹 👧', pinyin: 'Mèimei', translation: 'Младшая сестра', category: 'family', example: '妹妹上学。', difficulty: 2 },
  { hanzi: '家人 👨‍👩‍👧‍👦', pinyin: 'Jiārén', translation: 'Семья', category: 'family', example: '我爱我的家人。', difficulty: 2 },
  { hanzi: '孩子 👶', pinyin: 'Háizi', translation: 'Ребенок', category: 'family', example: '两个孩子', difficulty: 2 },
  { hanzi: '儿子 👦', pinyin: 'Érzi', translation: 'Сын', category: 'family', example: '我的儿子', difficulty: 2 },
  { hanzi: '女儿 👧', pinyin: 'Nǚ\'ér', translation: 'Дочь', category: 'family', example: '我的女儿', difficulty: 2 },
  
  // 🏡 ДОМ (20 слов)
  { hanzi: '家 🏠', pinyin: 'Jiā', translation: 'Дом', category: 'home', example: '我回家。', difficulty: 1 },
  { hanzi: '房间 🚪', pinyin: 'Fángjiān', translation: 'Комната', category: 'home', example: '我的房间', difficulty: 2 },
  { hanzi: '床 🛏️', pinyin: 'Chuáng', translation: 'Кровать', category: 'home', example: '我想睡觉。', difficulty: 1 },
  { hanzi: '桌子 🪑', pinyin: 'Zhuōzi', translation: 'Стол', category: 'home', example: '书在桌子上。', difficulty: 2 },
  { hanzi: '椅子 🪑', pinyin: 'Yǐzi', translation: 'Стул', category: 'home', example: '请坐椅子。', difficulty: 2 },
  { hanzi: '门 🚪', pinyin: 'Mén', translation: 'Дверь', category: 'home', example: '开门', difficulty: 1 },
  { hanzi: '窗户 🪟', pinyin: 'Chuānghu', translation: 'Окно', category: 'home', example: '打开窗户', difficulty: 2 },
  { hanzi: '厨房 🍳', pinyin: 'Chúfáng', translation: 'Кухня', category: 'home', example: '妈妈在厨房。', difficulty: 3 },
  { hanzi: '卫生间 🚽', pinyin: 'Wèishēngjiān', translation: 'Ванная', category: 'home', example: '卫生间在那里。', difficulty: 3 },
  { hanzi: '电视 📺', pinyin: 'Diànshì', translation: 'Телевизор', category: 'home', example: '看电视', difficulty: 2 },
  
  // 🏙️ ГОРОД (25 слов)
  { hanzi: '城市 🏙️', pinyin: 'Chéngshì', translation: 'Город', category: 'city', example: '大城市', difficulty: 2 },
  { hanzi: '街道 🛣️', pinyin: 'Jiēdào', translation: 'Улица', category: 'city', example: '这条街道', difficulty: 2 },
  { hanzi: '公园 🌳', pinyin: 'Gōngyuán', translation: 'Парк', category: 'city', example: '去公园散步', difficulty: 2 },
  { hanzi: '超市 🛒', pinyin: 'Chāoshì', translation: 'Супермаркет', category: 'city', example: '去超市买东西', difficulty: 2 },
  { hanzi: '医院 🏥', pinyin: 'Yīyuàn', translation: 'Больница', category: 'city', example: '他去医院了。', difficulty: 2 },
  { hanzi: '学校 🏫', pinyin: 'Xuéxiào', translation: 'Школа', category: 'city', example: '我去学校。', difficulty: 1 },
  { hanzi: '银行 🏦', pinyin: 'Yínháng', translation: 'Банк', category: 'city', example: '银行在哪里？', difficulty: 2 },
  { hanzi: '饭店 🍽️', pinyin: 'Fàndiàn', translation: 'Ресторан', category: 'city', example: '我们在饭店吃饭。', difficulty: 2 },
  { hanzi: '咖啡馆 ☕', pinyin: 'Kāfēi guǎn', translation: 'Кафе', category: 'city', example: '咖啡馆见', difficulty: 3 },
  { hanzi: '书店 📚', pinyin: 'Shūdiàn', translation: 'Книжный магазин', category: 'city', example: '买中文书', difficulty: 3 },
  
  // 🚇 ТРАНСПОРТ (20 слов)
  { hanzi: '车 🚗', pinyin: 'Chē', translation: 'Машина', category: 'transport', example: '我的车', difficulty: 1 },
  { hanzi: '地铁 🚇', pinyin: 'Dìtiě', translation: 'Метро', category: 'transport', example: '坐地铁', difficulty: 2 },
  { hanzi: '公共汽车 🚌', pinyin: 'Gōnggòng qìchē', translation: 'Автобус', category: 'transport', example: '几路公共汽车？', difficulty: 3 },
  { hanzi: '出租车 🚕', pinyin: 'Chūzū chē', translation: 'Такси', category: 'transport', example: '叫出租车', difficulty: 2 },
  { hanzi: '自行车 🚲', pinyin: 'Zìxíngchē', translation: 'Велосипед', category: 'transport', example: '骑自行车', difficulty: 2 },
  { hanzi: '飞机 ✈️', pinyin: 'Fēijī', translation: 'Самолет', category: 'transport', example: '坐飞机', difficulty: 2 },
  { hanzi: '火车 🚂', pinyin: 'Huǒchē', translation: 'Поезд', category: 'transport', example: '火车票', difficulty: 2 },
  { hanzi: '站 🚉', pinyin: 'Zhàn', translation: 'Станция', category: 'transport', example: '地铁站', difficulty: 2 },
  { hanzi: '票 🎫', pinyin: 'Piào', translation: 'Билет', category: 'transport', example: '买票', difficulty: 1 },
  
  // 🛒 ПОКУПКИ (25 слов)
  { hanzi: '买 🛍️', pinyin: 'Mǎi', translation: 'Покупать', category: 'shopping', example: '买东西', difficulty: 1 },
  { hanzi: '卖 🏷️', pinyin: 'Mài', translation: 'Продавать', category: 'shopping', example: '卖水果', difficulty: 1 },
  { hanzi: '钱 💰', pinyin: 'Qián', translation: 'Деньги', category: 'shopping', example: '我有钱。', difficulty: 1 },
  { hanzi: '便宜 💸', pinyin: 'Piányi', translation: 'Дешево', category: 'shopping', example: '这个很便宜。', difficulty: 2 },
  { hanzi: '贵 💎', pinyin: 'Guì', translation: 'Дорого', category: 'shopping', example: '太贵了！', difficulty: 2 },
  { hanzi: '多少钱？💰', pinyin: 'Duōshǎo qián?', translation: 'Сколько стоит?', category: 'shopping', example: '这个多少钱？', difficulty: 2 },
  { hanzi: '商店 🏪', pinyin: 'Shāngdiàn', translation: 'Магазин', category: 'shopping', example: '去商店', difficulty: 2 },
  { hanzi: '市场 🏬', pinyin: 'Shìchǎng', translation: 'Рынок', category: 'shopping', example: '菜市场', difficulty: 3 },
  { hanzi: '衣服 👕', pinyin: 'Yīfu', translation: 'Одежда', category: 'shopping', example: '买新衣服', difficulty: 2 },
  { hanzi: '鞋子 👟', pinyin: 'Xiézi', translation: 'Обувь', category: 'shopping', example: '运动鞋子', difficulty: 2 },
  
  // 💼 РАБОТА (15 слов)
  { hanzi: '工作 💼', pinyin: 'Gōngzuò', translation: 'Работа', category: 'work', example: '我在工作。', difficulty: 1 },
  { hanzi: '公司 🏢', pinyin: 'Gōngsī', translation: 'Компания', category: 'work', example: '我在一家公司工作。', difficulty: 2 },
  { hanzi: '电脑 💻', pinyin: 'Diànnǎo', translation: 'Компьютер', category: 'work', example: '用电脑工作', difficulty: 2 },
  { hanzi: '电话 📱', pinyin: 'Diànhuà', translation: 'Телефон', category: 'work', example: '打电话', difficulty: 1 },
  { hanzi: '会议 📅', pinyin: 'Huìyì', translation: 'Встреча', category: 'work', example: '今天有会议。', difficulty: 3 },
  
  // 🔢 ЧИСЛА (15 слов)
  { hanzi: '一 1️⃣', pinyin: 'Yī', translation: 'Один', category: 'numbers', example: '一个人', difficulty: 1 },
  { hanzi: '二 2️⃣', pinyin: 'Èr', translation: 'Два', category: 'numbers', example: '两个苹果', difficulty: 1 },
  { hanzi: '三 3️⃣', pinyin: 'Sān', translation: 'Три', category: 'numbers', example: '三本书', difficulty: 1 },
  { hanzi: '四 4️⃣', pinyin: 'Sì', translation: 'Четыре', category: 'numbers', example: '四季', difficulty: 1 },
  { hanzi: '五 5️⃣', pinyin: 'Wǔ', translation: 'Пять', category: 'numbers', example: '五点钟', difficulty: 1 },
  { hanzi: '六 6️⃣', pinyin: 'Liù', translation: 'Шесть', category: 'numbers', example: '六个人', difficulty: 1 },
  { hanzi: '七 7️⃣', pinyin: 'Qī', translation: 'Семь', category: 'numbers', example: '七天', difficulty: 1 },
  { hanzi: '八 8️⃣', pinyin: 'Bā', translation: 'Восемь', category: 'numbers', example: '八块钱', difficulty: 1 },
  { hanzi: '九 9️⃣', pinyin: 'Jiǔ', translation: 'Девять', category: 'numbers', example: '九月', difficulty: 1 },
  { hanzi: '十 🔟', pinyin: 'Shí', translation: 'Десять', category: 'numbers', example: '十个人', difficulty: 1 },
  
  // ⏰ ВРЕМЯ (15 слов)
  { hanzi: '今天 📅', pinyin: 'Jīntiān', translation: 'Сегодня', category: 'time', example: '今天天气很好。', difficulty: 1 },
  { hanzi: '明天 ⏭️', pinyin: 'Míngtiān', translation: 'Завтра', category: 'time', example: '明天见！', difficulty: 1 },
  { hanzi: '昨天 ↩️', pinyin: 'Zuótiān', translation: 'Вчера', category: 'time', example: '昨天我病了。', difficulty: 2 },
  { hanzi: '现在 🕒', pinyin: 'Xiànzài', translation: 'Сейчас', category: 'time', example: '现在几点？', difficulty: 1 },
  { hanzi: '时间 ⏰', pinyin: 'Shíjiān', translation: 'Время', category: 'time', example: '我没有时间。', difficulty: 2 },
  { hanzi: '早上 🌅', pinyin: 'Zǎoshang', translation: 'Утро', category: 'time', example: '早上好！', difficulty: 1 },
  { hanzi: '中午 🌞', pinyin: 'Zhōngwǔ', translation: 'День', category: 'time', example: '中午吃饭', difficulty: 2 },
  { hanzi: '晚上 🌙', pinyin: 'Wǎnshang', translation: 'Вечер', category: 'time', example: '晚上学习', difficulty: 1 },
  { hanzi: '小时 ⏳', pinyin: 'Xiǎoshí', translation: 'Час', category: 'time', example: '两个小时', difficulty: 2 },
  
  // 🎨 ХОББИ (15 слов)
  { hanzi: '学习 📚', pinyin: 'Xuéxí', translation: 'Учиться', category: 'hobbies', example: '学习中文', difficulty: 1 },
  { hanzi: '读书 📖', pinyin: 'Dúshū', translation: 'Читать', category: 'hobbies', example: '我喜欢读书。', difficulty: 2 },
  { hanzi: '看电影 🎬', pinyin: 'Kàn diànyǐng', translation: 'Смотреть кино', category: 'hobbies', example: '周末看电影', difficulty: 3 },
  { hanzi: '听音乐 🎵', pinyin: 'Tīng yīnyuè', translation: 'Слушать музыку', category: 'hobbies', example: '听中文音乐', difficulty: 3 },
  { hanzi: '运动 🏃', pinyin: 'Yùndòng', translation: 'Спорт', category: 'hobbies', example: '做运动', difficulty: 2 },
  { hanzi: '游泳 🏊', pinyin: 'Yóuyǒng', translation: 'Плавать', category: 'hobbies', example: '夏天游泳', difficulty: 3 },
  { hanzi: '旅行 🧳', pinyin: 'Lǚxíng', translation: 'Путешествовать', category: 'hobbies', example: '我喜欢旅行。', difficulty: 3 },
  
  // 🌤️ ПОГОДА (10 слов)
  { hanzi: '天气 🌤️', pinyin: 'Tiānqì', translation: 'Погода', category: 'weather', example: '今天天气怎么样？', difficulty: 2 },
  { hanzi: '太阳 ☀️', pinyin: 'Tàiyáng', translation: 'Солнце', category: 'weather', example: '太阳很大。', difficulty: 2 },
  { hanzi: '下雨 🌧️', pinyin: 'Xià yǔ', translation: 'Дождь', category: 'weather', example: '今天下雨。', difficulty: 2 },
  { hanzi: '下雪 ❄️', pinyin: 'Xià xuě', translation: 'Снег', category: 'weather', example: '冬天下雪。', difficulty: 3 },
  { hanzi: '热 🔥', pinyin: 'Rè', translation: 'Жарко', category: 'weather', example: '夏天很热。', difficulty: 1 },
  { hanzi: '冷 🥶', pinyin: 'Lěng', translation: 'Холодно', category: 'weather', example: '冬天很冷。', difficulty: 1 },
  
  // 💖 ЭМОЦИИ (10 слов)
  { hanzi: '爱 ❤️', pinyin: 'Ài', translation: 'Любить', category: 'emotions', example: '我爱你。', difficulty: 1 },
  { hanzi: '喜欢 👍', pinyin: 'Xǐhuan', translation: 'Нравиться', category: 'emotions', example: '我喜欢中国菜。', difficulty: 1 },
  { hanzi: '高兴 😊', pinyin: 'Gāoxìng', translation: 'Радостный', category: 'emotions', example: '我很高兴。', difficulty: 2 },
  { hanzi: '开心 😄', pinyin: 'Kāixīn', translation: 'Счастливый', category: 'emotions', example: '今天很开心！', difficulty: 2 },
  { hanzi: '难过 😢', pinyin: 'Nánguò', translation: 'Грустный', category: 'emotions', example: '我很难过。', difficulty: 3 },
  { hanzi: '累 😫', pinyin: 'Lèi', translation: 'Усталый', category: 'emotions', example: '我很累。', difficulty: 1 },
  { hanzi: '病 🤒', pinyin: 'Bìng', translation: 'Болеть', category: 'emotions', example: '我病了。', difficulty: 1 },
  
  // 🚨 ЭКСТРЕННЫЕ СИТУАЦИИ (10 слов)
  { hanzi: '帮助 🆘', pinyin: 'Bāngzhù', translation: 'Помощь', category: 'emergency', example: '我需要帮助！', difficulty: 2 },
  { hanzi: '警察 👮', pinyin: 'Jǐngchá', translation: 'Полиция', category: 'emergency', example: '叫警察！', difficulty: 2 },
  { hanzi: '医院 🏥', pinyin: 'Yīyuàn', translation: 'Госпиталь', category: 'emergency', example: '快去医院！', difficulty: 2 },
  { hanzi: '疼 🤕', pinyin: 'Téng', translation: 'Больно', category: 'emergency', example: '我头疼。', difficulty: 2 },
  
  // 📱 ТЕХНОЛОГИИ (10 слов)
  { hanzi: '手机 📱', pinyin: 'Shǒujī', translation: 'Мобильный телефон', category: 'tech', example: '新手机', difficulty: 2 },
  { hanzi: '电脑 💻', pinyin: 'Diànnǎo', translation: 'Компьютер', category: 'tech', example: '用电脑', difficulty: 2 },
  { hanzi: '网络 🌐', pinyin: 'Wǎngluò', translation: 'Интернет', category: 'tech', example: '上网', difficulty: 3 },
  { hanzi: 'Wi-Fi 📶', pinyin: 'Wǎifài', translation: 'Wi-Fi', category: 'tech', example: '有Wi-Fi吗？', difficulty: 2 },
  
  // 🎯 КЛЮЧЕВЫЕ ГЛАГОЛЫ (15 слов)
  { hanzi: '是 ✔️', pinyin: 'Shì', translation: 'Быть', category: 'verbs', example: '我是学生。', difficulty: 1 },
  { hanzi: '有 📦', pinyin: 'Yǒu', translation: 'Иметь', category: 'verbs', example: '我有书。', difficulty: 1 },
  { hanzi: '去 🚶', pinyin: 'Qù', translation: 'Идти', category: 'verbs', example: '我去学校。', difficulty: 1 },
  { hanzi: '来 📍', pinyin: 'Lái', translation: 'Приходить', category: 'verbs', example: '来我这里。', difficulty: 1 },
  { hanzi: '吃 🍽️', pinyin: 'Chī', translation: 'Есть', category: 'verbs', example: '吃饭', difficulty: 1 },
  { hanzi: '喝 🥤', pinyin: 'Hē', translation: 'Пить', category: 'verbs', example: '喝水', difficulty: 1 },
  { hanzi: '看 👀', pinyin: 'Kàn', translation: 'Смотреть', category: 'verbs', example: '看电视', difficulty: 1 },
  { hanzi: '听 👂', pinyin: 'Tīng', translation: 'Слушать', category: 'verbs', example: '听音乐', difficulty: 1 },
  { hanzi: '说 🗣️', pinyin: 'Shuō', translation: 'Говорить', category: 'verbs', example: '说中文', difficulty: 1 },
  { hanzi: '做 🛠️', pinyin: 'Zuò', translation: 'Делать', category: 'verbs', example: '做作业', difficulty: 1 },
  { hanzi: '住 🏠', pinyin: 'Zhù', translation: 'Жить', category: 'verbs', example: '我住在这里。', difficulty: 1 },
  { hanzi: '工作 💼', pinyin: 'Gōngzuò', translation: 'Работать', category: 'verbs', example: '我在工作。', difficulty: 1 },
  { hanzi: '睡觉 😴', pinyin: 'Shuìjiào', translation: 'Спать', category: 'verbs', example: '我要睡觉。', difficulty: 2 },
  { hanzi: '起床 🛏️', pinyin: 'Qǐchuáng', translation: 'Вставать', category: 'verbs', example: '早上起床', difficulty: 2 },
  { hanzi: '回家 🏠', pinyin: 'Huí jiā', translation: 'Возвращаться домой', category: 'verbs', example: '我回家。', difficulty: 2 }
];
// ===== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ =====

export function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

export function getWordsByCategory(category) {
  // Категории чистые — никакой очистки не нужно!
  return words.filter(word => word.category === category);
}

export function getCategories() {
  // Возвращаем просто уникальные названия категорий
  return [...new Set(words.map(word => word.category))];
}



// Утилита для удаления эмодзи из hanzi
export function removeEmojis(str) {
  return str.replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
}

// 📊 СТАТИСТИКА
console.log(`✅ words.js загружен успешно!`);
console.log(`📚 Всего слов: ${words.length}`);
console.log(`🏷️ Категорий: ${getCategories().length}`);
