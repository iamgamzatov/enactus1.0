require('dotenv').config();


const express = require('express');
const cors = require('cors');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api'); // Версия 0.66.0

const app = express();
app.use(cors());
app.use(express.json());

// --- НАСТРОЙКИ TELEGRAM ---
// Вставьте сюда ваши реальные данные!
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; 
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

// --- ФУНКЦИЯ СОХРАНЕНИЯ В ФАЙЛ ---
// (Вот та самая функция, которой не хватало)
function saveApplication(data) {
    const filePath = './applications.json';
    let applications = [];

    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf-8');
        if (fileData) applications = JSON.parse(fileData);
    }

    data.date = new Date().toISOString();
    applications.push(data);

    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));
}

// --- ОБРАБОТКА ФОРМЫ ---
app.post('/api/join', async (req, res) => {
    const { name, group, email, interest, message, website, consent } = req.body;

    // 1. Проверка на бота
    if (website) {
        console.log('🤖 Бот пойман!');
        return res.status(400).json({ error: 'Спам обнаружен' });
    }

    // 2. Проверка обязательных полей
    if (!name || !email || !group) {
        return res.status(400).json({ error: 'Заполните обязательные поля' });
    }

    // 3. Проверка согласия
    if (!consent) {
        return res.status(400).json({ error: 'Необходимо согласие на обработку данных' });
    }

    // 4. Сохраняем в файл applications.json
    saveApplication({ name, group, email, interest, message });

    // 5. Формируем и отправляем сообщение в Telegram
    const text = `
📬 *Новая заявка в Enactus IUCA!*

👤 *Имя:* ${name}
🎓 *Группа:* ${group}
📧 *Email:* ${email}
🎯 *Интерес:* ${interest}
💬 *Сообщение:* ${message || '—'}
    `;

    try {
        await bot.sendMessage(TELEGRAM_CHAT_ID, text, { parse_mode: 'Markdown' });
        console.log(`✅ Новая заявка от: ${name} (отправлено в Telegram)`);
        res.status(200).json({ success: true, message: 'Заявка принята и отправлена!' });
    } catch (err) {
        console.error('Ошибка отправки в Telegram:', err.message);
        // Даже если Telegram упал, заявка уже сохранена в файл
        res.status(200).json({ success: true, message: 'Заявка сохранена, но не отправлена в Telegram' });
    }
});

// --- ЗАПУСК СЕРВЕРА ---
app.listen(3000, () => {
    console.log('Бэкенд запущен: http://localhost:3000');
});