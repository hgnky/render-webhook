const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');
const { formatMessage } = require('./utils/formatter');
const { getRandomTip } = require('./utils/trading-tips');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment Variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'AudenFX Telegram Bot is running!',
        timestamp: new Date().toISOString(),
        timezone: 'UTC+7'
    });
});

// Main webhook endpoint untuk TradingView
app.post('/webhook/tradingview', async (req, res) => {
    try {
        console.log('Received webhook:', req.body);
        
        // Parse data dari TradingView
        let alertData;
        if (typeof req.body === 'string') {
            alertData = JSON.parse(req.body);
        } else {
            alertData = req.body;
        }

        // Tambah data tambahan
        const enrichedData = {
            ...alertData,
            alert_time_wib: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
            market_session: getMarketSession(),
            random_tip: getRandomTip()
        };

        // Format message
        const message = formatMessage(enrichedData);
        
        // Kirim ke Telegram
        const telegramResponse = await sendToTelegram(message);
        
        if (telegramResponse.ok) {
            res.status(200).json({ 
                success: true, 
                message: 'Alert sent successfully',
                telegram_response: telegramResponse.data
            });
        } else {
            throw new Error('Failed to send to Telegram');
        }

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Function untuk kirim ke Telegram
async function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    try {
        const response = await axios.post(url, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        
        return { ok: true, data: response.data };
    } catch (error) {
        console.error('Telegram error:', error.response?.data || error.message);
        return { ok: false, error: error.message };
    }
}

// Function untuk deteksi sesi market
function getMarketSession() {
    const now = moment().tz('Asia/Jakarta');
    const hour = now.hour();
    
    if (hour >= 5 && hour < 14) {
        return "🌏 Asian Session";
    } else if (hour >= 14 && hour < 22) {
        return "🇪🇺 European Session";
    } else if (hour >= 22 || hour < 5) {
        return "🇺🇸 US Session";
    } else {
        return "🌙 Market Closed";
    }
}

app.listen(PORT, () => {
    console.log(`🚀 AudenFX Bot Server running on port ${PORT}`);
    console.log(`📱 Ready to receive TradingView webhooks`);
});