const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment Variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: 'text/plain' }));

// Trading Tips Array (inline)
const tradingTips = [
    "Tunggu konfirmasi sebelum entry, jangan FOMO!",
    "Risk management adalah 80% dari trading yang sukses",
    "Market tidak akan kemana-mana, sabar menunggu setup terbaik",
    "Cut loss kecil lebih baik daripada margin call besar",
    "Trend adalah teman terbaik trader yang konsisten",
    "Jangan trading saat emosi, ambil break dulu",
    "Journal trading adalah guru terbaik untuk evaluasi diri",
    "Support dan resistance adalah fondasi analisa teknikal",
    "Volume adalah konfirmasi terbaik untuk breakout",
    "Backtest strategi sebelum live trading dengan uang riil",
    "Risk per trade maksimal 1-2% dari total modal",
    "Plan your trade, trade your plan - disiplin adalah kunci",
    "Market maker selalu hunting liquidity, ikuti jejak mereka",
    "HTF bias menentukan arah, LTF untuk timing entry yang presisi",
    "Patience pays - menunggu adalah bagian dari strategi trading"
];

// Get random trading tip
function getRandomTip() {
    const randomIndex = Math.floor(Math.random() * tradingTips.length);
    return tradingTips[randomIndex];
}

// Format timeframe
function formatTimeframe(tf) {
    const timeframes = {
        '1': 'M1', '3': 'M3', '5': 'M5', '15': 'M15', '30': 'M30',
        '60': 'H1', '240': 'H4', '1D': 'D1', '1W': 'W1', '1M': 'MN'
    };
    return timeframes[tf] || tf;
}

// Format message function
function formatMessage(data) {
    try {
        const {
            symbol = 'Unknown',
            current_price = '0.00000',
            timeframe = '15',
            htf = '1H',
            acr_direction = 'NEUTRAL',
            sweep_level = '0.00000',
            cisd_status = 'NEUTRAL',
            acrx_signals = '',
            alert_time_wib = 'Unknown',
            market_session = '🌙 Unknown Session',
            price_change_1h = '0',
            random_tip = 'Always manage your risk!'
        } = data;

        // Direction emoji & arrows
        const isbullish = acr_direction === 'BULLISH';
        const directionEmoji = isbullish ? '🟢' : acr_direction === 'BEARISH' ? '🔴' : '⚪';
        const trendArrow = isbullish ? '📈' : acr_direction === 'BEARISH' ? '📉' : '➖';
        const setupIcon = isbullish ? '🚀' : acr_direction === 'BEARISH' ? '🎯' : '🔄';
        
        // Price change formatting
        const priceChange = parseFloat(price_change_1h) || 0;
        const changeEmoji = priceChange > 0 ? '📈' : priceChange < 0 ? '📉' : '➖';
        const changeSign = priceChange > 0 ? '+' : '';
        
        // Status formatting
        const cisdEmoji = cisd_status.includes('BULLISH') ? '🟢' : 
                          cisd_status.includes('BEARISH') ? '🔴' : '⚪';

        let message = `🚨 *AUDENFX SIGNAL ALERT* 🚨\n\n`;
        
        // Header Info
        message += `${setupIcon} *${symbol}* | ${formatTimeframe(timeframe)} → ${formatTimeframe(htf)}\n`;
        message += `${directionEmoji} *${acr_direction} ACR* ${trendArrow}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        // Trading Info
        message += `💰 *Current Price:* \`${current_price}\`\n`;
        message += `🎯 *Sweep Level:* \`${sweep_level}\`\n`;
        message += `${changeEmoji} *1H Change:* ${changeSign}${priceChange.toFixed(2)}%\n\n`;
        
        // Signal Status
        message += `${cisdEmoji} *CISD:* ${cisd_status}\n`;
        if (acrx_signals && acrx_signals !== '') {
            message += `⚡ *ACR+:* ${acrx_signals}\n`;
        }
        message += `\n`;
        
        // Session & Time Info
        message += `${market_session}\n`;
        message += `🕐 *Alert Time:* ${alert_time_wib}\n\n`;
        
        // Trading Tip
        message += `💡 *Tips Hari Ini:*\n`;
        message += `_"${random_tip}"_\n\n`;
        
        // Footer
        message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `⚠️ *Risk Management is Key*\n`;
        message += `📊 *Always DYOR • NFA*\n`;
        message += `🏷️ \`#AudenFX #${symbol} #${acr_direction}ACR\``;

        return message;
        
    } catch (error) {
        console.error('Format message error:', error);
        return `🚨 *AudenFX Alert*\n\nRaw data: ${JSON.stringify(data, null, 2)}\n\n⚠️ Format error occurred`;
    }
}

// Get market session
function getMarketSession() {
    const now = moment().tz('Asia/Jakarta');
    const hour = now.hour();
    const day = now.day();
    
    if (day === 0 || day === 6) {
        return "🛌 Weekend - Market Closed";
    }
    
    if (hour >= 5 && hour < 14) {
        return "🌏 Asian Session";
    } else if (hour >= 14 && hour < 22) {
        return "🇪🇺 European Session";
    } else if (hour >= 22 || hour < 5) {
        return "🇺🇸 US Session";
    } else {
        return "🌙 Market Transition";
    }
}

// Validation function
async function validateBotCredentials() {
    if (!BOT_TOKEN || !CHAT_ID) {
        return {
            valid: false,
            error: 'Missing BOT_TOKEN or CHAT_ID environment variables'
        };
    }

    try {
        // Test bot token
        const botInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
        const botResponse = await axios.get(botInfoUrl, { timeout: 5000 });
        
        if (!botResponse.data.ok) {
            return {
                valid: false,
                error: 'Invalid BOT_TOKEN'
            };
        }

        // Test chat access
        const chatInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${CHAT_ID}`;
        const chatResponse = await axios.get(chatInfoUrl, { timeout: 5000 });
        
        if (!chatResponse.data.ok) {
            return {
                valid: false,
                error: `Cannot access chat ${CHAT_ID}. Bot might not be added to chat or chat ID is wrong`
            };
        }

        return {
            valid: true,
            bot_info: botResponse.data.result,
            chat_info: chatResponse.data.result
        };

    } catch (error) {
        return {
            valid: false,
            error: error.response?.data?.description || error.message
        };
    }
}

// Send to Telegram function
async function sendToTelegram(message, retries = 2) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`📤 Sending to Telegram (attempt ${i + 1}/${retries})`);
            
            const response = await axios.post(url, {
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            }, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Telegram success');
            return { ok: true, data: response.data };
            
        } catch (error) {
            const errorDetails = error.response?.data || error.message;
            console.error(`❌ Telegram error (attempt ${i + 1}):`, errorDetails);
            
            if (i === retries - 1) {
                return { 
                    ok: false, 
                    error: errorDetails,
                    status_code: error.response?.status
                };
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Routes
app.get('/', async (req, res) => {
    const validation = await validateBotCredentials();
    
    res.json({
        status: validation.valid ? 'Bot is ready! ✅' : 'Bot configuration error ❌',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
        validation: {
            credentials_valid: validation.valid,
            error: validation.error || null
        },
        endpoints: {
            health: 'GET /',
            webhook: 'POST /webhook/tradingview',
            test: 'POST /test'
        }
    });
});

app.get('/webhook/tradingview', (req, res) => {
    res.json({
        message: 'Webhook endpoint is ready! 🎯',
        method: 'Use POST method to send alerts',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
    });
});

app.post('/webhook/tradingview', async (req, res) => {
    try {
        // Validate credentials first
        const validation = await validateBotCredentials();
        if (!validation.valid) {
            return res.status(500).json({
                success: false,
                error: 'Bot configuration error',
                details: validation.error
            });
        }

        console.log('📨 Webhook received');
        
        let alertData;
        
        // Parse request body
        if (typeof req.body === 'string') {
            try {
                alertData = JSON.parse(req.body);
            } catch (parseError) {
                // Handle as plain text
                const message = `🚨 *AudenFX Alert*\n\n${req.body}\n\n⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')}`;
                const result = await sendToTelegram(message);
                
                return res.status(result.ok ? 200 : 500).json({
                    success: result.ok,
                    message: result.ok ? 'Plain text alert sent' : 'Failed to send alert'
                });
            }
        } else {
            alertData = req.body;
        }

        // Enrich data
        const enrichedData = {
            symbol: 'UNKNOWN',
            current_price: '0.00000',
            timeframe: '15',
            htf: '1H', 
            acr_direction: 'NEUTRAL',
            sweep_level: '0.00000',
            cisd_status: 'NEUTRAL',
            acrx_signals: '',
            price_change_1h: '0',
            ...alertData,
            alert_time_wib: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
            market_session: getMarketSession(),
            random_tip: getRandomTip()
        };

        console.log('✅ Processing alert:', enrichedData.symbol, enrichedData.acr_direction);

        const formattedMessage = formatMessage(enrichedData);
        const result = await sendToTelegram(formattedMessage);
        
        res.status(result.ok ? 200 : 500).json({
            success: result.ok,
            message: result.ok ? 'Alert sent to Telegram' : 'Failed to send to Telegram',
            error: result.ok ? null : result.error
        });

    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/test', async (req, res) => {
    try {
        const validation = await validateBotCredentials();
        
        if (!validation.valid) {
            return res.status(500).json({
                success: false,
                error: 'Bot configuration error',
                details: validation.error
            });
        }

        const testMessage = `🧪 *Test Alert - ${moment().tz('Asia/Jakarta').format('HH:mm:ss')}*\n\n✅ Server is working\n✅ Bot credentials valid\n✅ Chat access confirmed\n\n🤖 Bot: ${validation.bot_info.first_name}\n💬 Chat: ${validation.chat_info.title || validation.chat_info.first_name || 'Private Chat'}`;
        
        const result = await sendToTelegram(testMessage);
        
        res.json({
            success: result.ok,
            message: result.ok ? 'Test message sent!' : 'Failed to send test message',
            error: result.ok ? null : result.error
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 AudenFX Bot Server running on port ${PORT}`);
    console.log(`🕐 Server time: ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')}`);
    
    // Validate on startup
    setTimeout(async () => {
        const validation = await validateBotCredentials();
        console.log(`🤖 Bot validation: ${validation.valid ? '✅ VALID' : '❌ INVALID'}`);
        if (!validation.valid) {
            console.error(`❌ Error: ${validation.error}`);
        } else {
            console.log(`✅ Bot ready: ${validation.bot_info.first_name}`);
        }
    }, 2000);
});