const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Telegram Bot Config
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const CHAT_ID = process.env.CHAT_ID || 'YOUR_CHAT_ID_HERE';

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'AudenFX Webhook Server is running!',
        timestamp: new Date().toISOString()
    });
});

// Webhook endpoint for TradingView alerts
app.post('/webhook/audenfx', async (req, res) => {
    try {
        console.log('Received webhook:', req.body);
        
        // Get message from TradingView alert
        let message = '';
        
        // Handle different formats
        if (req.body.message) {
            message = req.body.message;
        } else if (req.body.text) {
            message = req.body.text;
        } else if (typeof req.body === 'string') {
            message = req.body;
        } else {
            // Fallback: convert whole body to string
            message = JSON.stringify(req.body, null, 2);
        }

        // Clean up common TradingView placeholders
        message = message.replace(/\{\{message\}\}/g, '');
        message = message.replace(/\{\{ticker\}\}/g, '');
        message = message.trim();

        // If message is empty, create a default one
        if (!message || message === '{}' || message === '') {
            message = '🚨 *AudenFX Alert Triggered* 🚨\n\n⚠️ _Message content not received properly_';
        }

        // Send to Telegram
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        await axios.post(telegramUrl, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        console.log('Message sent to Telegram successfully');
        res.json({ success: true, message: 'Alert sent to Telegram' });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Catch all for debugging
app.all('/debug', (req, res) => {
    res.json({
        method: req.method,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params
    });
});

app.listen(port, () => {
    console.log(`AudenFX Webhook Server running on port ${port}`);
});
