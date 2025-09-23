const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment Variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: 'text/plain', limit: '10mb' }));

// Enable CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Trading Tips Array (Enhanced)
const tradingTips = [
    "HTF bias menentukan arah, LTF untuk timing entry presisi 🎯",
    "ACR sweep adalah invitation untuk institutional money flow 💰",
    "CISD konfirmasi memberikan probability tinggi untuk success rate 📈",
    "Tunggu konfirmasi di HTF sebelum execute di LTF ⏰",
    "Risk management adalah 80% dari trading yang sukses 🛡️",
    "Market tidak akan kemana-mana, sabar menunggu setup terbaik 🧘‍♂️",
    "Support dan resistance adalah magnet untuk price action 🧲",
    "Volume adalah konfirmasi terbaik untuk breakout movement 📊",
    "Plan your trade, trade your plan - disiplin adalah kunci 🔑",
    "Market maker selalu hunting liquidity, ikuti jejak mereka 🏹",
    "Patience pays - menunggu adalah bagian dari strategi trading ⏳",
    "CE zones are premium areas untuk high-probability setups 💎",
    "FVG mitigation memberikan clue untuk market direction 🔍",
    "ACR+ expansion menandakan momentum yang kuat 🚀",
    "Reversal + Market Structure = powerful combination 🔄"
];

// Market Analysis Messages
const marketAnalysis = {
    bullish_momentum: [
        "🚀 Strong bullish momentum detected",
        "📈 Uptrend continuation likely",
        "🟢 Bulls are in control",
        "⬆️ Buying pressure increasing"
    ],
    bearish_momentum: [
        "🎯 Strong bearish momentum detected", 
        "📉 Downtrend continuation likely",
        "🔴 Bears are in control",
        "⬇️ Selling pressure increasing"
    ],
    consolidation: [
        "🔄 Market in consolidation phase",
        "⚖️ Bulls and bears fighting for control",
        "📊 Waiting for clear direction",
        "🎭 Market indecision phase"
    ]
};

// Utility Functions
function getRandomTip() {
    const randomIndex = Math.floor(Math.random() * tradingTips.length);
    return tradingTips[randomIndex];
}

function getMarketAnalysis(direction, acrxSignals) {
    if (direction === 'BULLISH' && (acrxSignals.includes('CISD') || acrxSignals.includes('EXP'))) {
        return marketAnalysis.bullish_momentum[Math.floor(Math.random() * marketAnalysis.bullish_momentum.length)];
    } else if (direction === 'BEARISH' && (acrxSignals.includes('CISD') || acrxSignals.includes('EXP'))) {
        return marketAnalysis.bearish_momentum[Math.floor(Math.random() * marketAnalysis.bearish_momentum.length)];
    } else {
        return marketAnalysis.consolidation[Math.floor(Math.random() * marketAnalysis.consolidation.length)];
    }
}

function formatTimeframe(tf) {
    const timeframes = {
        '1': 'M1', '3': 'M3', '5': 'M5', '15': 'M15', '30': 'M30',
        '60': 'H1', '120': 'H2', '240': 'H4', '360': 'H6', '480': 'H8',
        '720': 'H12', '1D': 'D1', '1W': 'W1', '1M': 'MN'
    };
    return timeframes[tf] || tf;
}

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

function formatVolume(volume) {
    const vol = parseFloat(volume) || 0;
    if (vol >= 1000000) {
        return `${(vol / 1000000).toFixed(1)}M`;
    } else if (vol >= 1000) {
        return `${(vol / 1000).toFixed(1)}K`;
    }
    return vol.toString();
}

function calculateSignalStrength(data) {
    let strength = 0;
    let factors = [];
    
    // ACR Direction (base)
    if (data.acr_direction !== 'NEUTRAL') {
        strength += 30;
        factors.push('ACR Pattern');
    }
    
    // CISD Confirmation
    if (data.cisd_status && data.cisd_status.includes('CISD')) {
        strength += 25;
        factors.push('CISD Confirmed');
    }
    
    // ACRX Signals
    if (data.acrx_signals) {
        if (data.acrx_signals.includes('CISD')) {
            strength += 20;
            factors.push('ACR+ CISD');
        }
        if (data.acrx_signals.includes('EXP')) {
            strength += 15;
            factors.push('Expansion');
        }
        if (data.acrx_signals.includes('REV')) {
            strength += 10;
            factors.push('Reversal');
        }
    }
    
    // Price momentum
    const priceChange = parseFloat(data.htf_change_pct) || 0;
    if (Math.abs(priceChange) > 0.5) {
        strength += 10;
        factors.push('HTF Momentum');
    }
    
    return {
        strength: Math.min(strength, 100),
        factors: factors
    };
}

function getSignalEmoji(strength) {
    if (strength >= 80) return '🔥';
    if (strength >= 60) return '⚡';
    if (strength >= 40) return '💫';
    return '⭐';
}

// Enhanced message formatter for new data structure
function formatMessage(data) {
    try {
        const {
            symbol = 'UNKNOWN',
            alert_type = 'ACR_ALERT',
            current_ltf_price = '0.00000',
            ltf_timeframe = '15',
            htf_timeframe = '1H',
            acr_direction = 'NEUTRAL',
            sweep_level = '0.00000',
            cisd_status = 'NEUTRAL',
            cisd_direction = 'NONE',
            acrx_signals = '',
            htf_change_pct = '0',
            htf_volume = '0',
            htf_ohlc = {},
            ltf_ohlc = {},
            pattern_details = {},
            market_context = {}
        } = data;

        // Direction styling
        const isBullish = acr_direction === 'BULLISH';
        const isBearish = acr_direction === 'BEARISH';
        const directionEmoji = isBullish ? '🟢' : isBearish ? '🔴' : '⚪';
        const trendArrow = isBullish ? '📈' : isBearish ? '📉' : '➖';
        const setupIcon = isBullish ? '🚀' : isBearish ? '🎯' : '🔄';
        
        // Price change formatting
        const htfChange = parseFloat(htf_change_pct) || 0;
        const changeEmoji = htfChange > 0 ? '📈' : htfChange < 0 ? '📉' : '➖';
        const changeSign = htfChange > 0 ? '+' : '';
        
        // CISD status formatting
        const cisdEmoji = cisd_status.includes('BULLISH') ? '🟢' : 
                          cisd_status.includes('BEARISH') ? '🔴' : '⚪';

        // Calculate signal strength
        const signalData = calculateSignalStrength(data);
        const strengthEmoji = getSignalEmoji(signalData.strength);

        // Build professional message
        let message = `${strengthEmoji} *AUDENFX HTF ALERT* ${strengthEmoji}\n\n`;
        
        // Header Info
        message += `${setupIcon} *${symbol}* | ${formatTimeframe(ltf_timeframe)} → ${formatTimeframe(htf_timeframe)}\n`;
        message += `${directionEmoji} *${acr_direction} ACR SWEEP* ${trendArrow}\n`;
        message += `🎖️ *Signal Strength:* ${signalData.strength}%\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        // Price Information
        message += `💰 *LTF Price:* \`${current_ltf_price}\`\n`;
        
        // HTF OHLC if available
        if (htf_ohlc && htf_ohlc.close) {
            message += `📊 *HTF Close:* \`${htf_ohlc.close}\`\n`;
            message += `📈 *HTF High:* \`${htf_ohlc.high}\` | 📉 *Low:* \`${htf_ohlc.low}\`\n`;
        }
        
        message += `🎯 *Sweep Level:* \`${sweep_level}\`\n`;
        message += `${changeEmoji} *HTF Change:* ${changeSign}${htfChange.toFixed(2)}%\n`;
        
        // Volume info
        if (htf_volume && htf_volume !== '0') {
            message += `📊 *HTF Volume:* ${formatVolume(htf_volume)}\n`;
        }
        message += `\n`;
        
        // Signal Analysis
        message += `${cisdEmoji} *CISD:* ${cisd_status}\n`;
        if (cisd_direction && cisd_direction !== 'NONE') {
            message += `🎲 *CISD Direction:* ${cisd_direction}\n`;
        }
        
        if (acrx_signals && acrx_signals !== '') {
            message += `⚡ *ACR+ Signals:* ${acrx_signals}\n`;
        }
        
        // Signal Strength Factors
        if (signalData.factors.length > 0) {
            message += `🎯 *Confluence:* ${signalData.factors.join(' • ')}\n`;
        }
        message += `\n`;
        
        // Market Context
        if (market_context.rsi) {
            const rsi = parseFloat(market_context.rsi);
            const rsiStatus = rsi > 70 ? 'Overbought 🔴' : rsi < 30 ? 'Oversold 🟢' : 'Neutral ⚪';
            message += `📊 *RSI:* ${rsi.toFixed(1)} (${rsiStatus})\n`;
        }
        
        if (market_context.current_atr) {
            message += `📏 *ATR:* ${parseFloat(market_context.current_atr).toFixed(5)}\n`;
        }
        
        // Market Analysis
        const analysis = getMarketAnalysis(acr_direction, acrx_signals);
        message += `\n🔮 *Analysis:* ${analysis}\n`;
        
        // Session & Time Info
        message += `\n${getMarketSession()}\n`;
        message += `🕐 *Alert Time:* ${moment().tz('Asia/Jakarta').format('DD/MM HH:mm:ss')} WIB\n`;
        
        // Pattern Details (if available)
        if (pattern_details.c1_high || pattern_details.c2_high) {
            message += `\n📐 *Pattern Details:*\n`;
            if (pattern_details.c1_high) {
                message += `• C1: H=${parseFloat(pattern_details.c1_high).toFixed(5)} L=${parseFloat(pattern_details.c1_low).toFixed(5)}\n`;
            }
            if (pattern_details.c2_high) {
                message += `• C2: H=${parseFloat(pattern_details.c2_high).toFixed(5)} L=${parseFloat(pattern_details.c2_low).toFixed(5)}\n`;
            }
        }
        
        // Trading Tip
        message += `\n💡 *Pro Tip:*\n`;
        message += `_"${getRandomTip()}"_\n\n`;
        
        // Footer
        message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `⚠️ *Risk Management is Key*\n`;
        message += `📊 *Always DYOR • NFA*\n`;
        message += `🏷️ \`#AudenFX #${symbol} #HTF${acr_direction}\``;

        return message;
        
    } catch (error) {
        console.error('Format message error:', error);
        // Enhanced fallback message
        const fallbackData = extractBasicData(data);
        return `🚨 *AudenFX HTF Alert*\n\n📊 Symbol: ${fallbackData.symbol}\n🎯 Direction: ${fallbackData.direction}\n💰 Price: ${fallbackData.price}\n⏰ Time: ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')}\n\n⚠️ _Enhanced processing - check logs_`;
    }
}

// Helper function to extract basic data from complex structure
function extractBasicData(data) {
    return {
        symbol: data.symbol || data.ticker || 'UNKNOWN',
        direction: data.acr_direction || data.direction || 'NEUTRAL',
        price: data.current_ltf_price || data.current_price || data.price || '0.00000',
        timeframe: data.htf_timeframe || data.timeframe || 'Unknown'
    };
}

// Enhanced validation function
async function validateBotCredentials() {
    if (!BOT_TOKEN || !CHAT_ID) {
        return {
            valid: false,
            error: 'Missing BOT_TOKEN or CHAT_ID environment variables'
        };
    }

    try {
        // Test bot token with timeout
        const botInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
        const botResponse = await axios.get(botInfoUrl, { timeout: 10000 });
        
        if (!botResponse.data.ok) {
            return { valid: false, error: 'Invalid BOT_TOKEN' };
        }

        // Test chat access
        const chatInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${CHAT_ID}`;
        const chatResponse = await axios.get(chatInfoUrl, { timeout: 10000 });
        
        if (!chatResponse.data.ok) {
            return {
                valid: false,
                error: `Cannot access chat ${CHAT_ID}. Bot might not be added or chat ID is wrong`
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

// Enhanced send to Telegram function
async function sendToTelegram(message, retries = 3) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`📤 Sending to Telegram (attempt ${i + 1}/${retries})`);
            
            const response = await axios.post(url, {
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                disable_notification: false
            }, {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            });
            
            console.log('✅ HTF Alert sent successfully');
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
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
    }
}

// =================== ROUTES ===================

// Health check
app.get('/', async (req, res) => {
    const validation = await validateBotCredentials();
    
    res.json({
        status: 'AudenFX HTF Alert Bot',
        version: '2.0 - Enhanced HTF Support',
        bot_status: validation.valid ? '✅ Ready' : '❌ Configuration Error',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
        features: [
            '🎯 HTF-based ACR Detection',
            '⚡ ACRX Signal Processing',
            '📊 CISD Confirmation Analysis', 
            '🔥 Signal Strength Calculation',
            '📈 Market Context Integration',
            '🎖️ Multi-timeframe Data Handling'
        ],
        server_info: {
            uptime: process.uptime(),
            memory_usage: process.memoryUsage(),
            node_version: process.version
        },
        validation: {
            credentials_valid: validation.valid,
            error: validation.error || null,
            bot_name: validation.bot_info?.first_name || null,
            chat_type: validation.chat_info?.type || null
        },
        supported_data_structure: {
            alert_type: 'HTF_ACR_SWEEP',
            timeframes: 'Multi-TF (LTF + HTF)',
            signals: 'ACR + ACRX + CISD',
            analysis: 'Signal Strength + Market Context'
        }
    });
});

// Main webhook endpoint - Enhanced for new data structure
app.post('/webhook/tradingview', async (req, res) => {
    try {
        // Quick validation
        const validation = await validateBotCredentials();
        if (!validation.valid) {
            console.error('❌ Bot credentials invalid:', validation.error);
            return res.status(500).json({
                success: false,
                error: 'Bot configuration error',
                details: validation.error
            });
        }

        console.log('📨 TradingView HTF webhook received');
        console.log('Content-Type:', req.headers['content-type']);
        
        let alertData;
        
        // Parse different body formats
        if (typeof req.body === 'string') {
            try {
                alertData = JSON.parse(req.body);
                console.log('✅ Parsed JSON from string');
            } catch (parseError) {
                console.log('📝 Treating as plain text message');
                const plainMessage = `🚨 *AudenFX HTF Alert*\n\n${req.body}\n\n⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')}\n${getMarketSession()}`;
                const result = await sendToTelegram(plainMessage);
                
                return res.status(result.ok ? 200 : 500).json({
                    success: result.ok,
                    message: result.ok ? 'Plain text alert sent' : 'Failed to send alert',
                    error: result.ok ? null : result.error
                });
            }
        } else if (typeof req.body === 'object') {
            alertData = req.body;
            console.log('✅ Using object body directly');
        } else {
            throw new Error('Unsupported request body format');
        }

        // Log received data structure
        console.log('📊 HTF Alert data received:', {
            symbol: alertData.symbol,
            alert_type: alertData.alert_type,
            acr_direction: alertData.acr_direction,
            htf_timeframe: alertData.htf_timeframe,
            signal_strength: calculateSignalStrength(alertData).strength
        });

        // Format and send message
        const formattedMessage = formatMessage(alertData);
        const result = await sendToTelegram(formattedMessage);
        
        if (result.ok) {
            const basicData = extractBasicData(alertData);
            console.log(`✅ HTF Alert sent: ${basicData.symbol} ${basicData.direction} (${basicData.timeframe})`);
            
            res.status(200).json({
                success: true,
                message: 'HTF Alert sent to Telegram successfully',
                data: {
                    symbol: basicData.symbol,
                    direction: basicData.direction,
                    alert_type: alertData.alert_type || 'HTF_ACR',
                    signal_strength: calculateSignalStrength(alertData).strength,
                    timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
                }
            });
        } else {
            console.error('❌ Failed to send HTF alert:', result.error);
            res.status(500).json({
                success: false,
                message: 'Failed to send HTF alert to Telegram',
                error: result.error,
                status_code: result.status_code
            });
        }

    } catch (error) {
        console.error('❌ HTF Webhook processing error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
        });
    }
});

// Enhanced test endpoint
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

        // Create comprehensive test alert matching new structure
        const testData = {
            symbol: 'EURUSD',
            alert_type: 'HTF_ACR_SWEEP',
            current_ltf_price: '1.08425',
            ltf_timeframe: '15',
            htf_timeframe: '240',
            htf_bar_time: Date.now(),
            acr_direction: 'BULLISH',
            sweep_level: '1.08550',
            cisd_status: 'BULLISH CISD',
            cisd_direction: 'BUY SETUP',
            acrx_signals: 'CISD / EXP',
            htf_change_pct: '0.45',
            htf_volume: '1250000',
            htf_ohlc: {
                open: '1.08380',
                high: '1.08470',
                low: '1.08350',
                close: '1.08425'
            },
            ltf_ohlc: {
                open: '1.08420',
                high: '1.08435',
                low: '1.08415',
                close: '1.08425'
            },
            pattern_details: {
                c1_high: '1.08380',
                c1_low: '1.08320',
                c2_high: '1.08470',
                c2_low: '1.08350',
                is_high_sweep: false,
                pattern_id: 1
            },
            market_context: {
                current_atr: '0.00085',
                rsi: '65.25',
                timestamp: Date.now()
            }
        };

        const testMessage = formatMessage(testData);
        const result = await sendToTelegram(testMessage);
        
        res.json({
            success: result.ok,
            message: result.ok ? 'Enhanced HTF test alert sent successfully!' : 'Failed to send test alert',
            error: result.ok ? null : result.error,
            test_data_structure: 'HTF ACR with full market context',
            signal_strength: calculateSignalStrength(testData).strength,
            bot_info: {
                name: validation.bot_info.first_name,
                username: validation.bot_info.username
            }
        });

    } catch (error) {
        console.error('Test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Debug endpoint - Enhanced
app.get('/debug', async (req, res) => {
    const validation = await validateBotCredentials();
    
    res.json({
        debug_info: {
            version: '2.0 - HTF Enhanced',
            timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
            environment: {
                BOT_TOKEN_present: !!BOT_TOKEN,
                BOT_TOKEN_format: BOT_TOKEN ? `${BOT_TOKEN.substring(0, 10)}...` : 'MISSING',
                CHAT_ID_present: !!CHAT_ID,
                CHAT_ID_value: CHAT_ID || 'MISSING'
            },
            validation_result: validation,
            market_session: getMarketSession(),
            random_tip: getRandomTip(),
            supported_features: [
                'HTF ACR Detection',
                'ACRX Signal Processing', 
                'CISD Confirmation',
                'Signal Strength Analysis',
                'Multi-timeframe Context'
            ]
        },
        sample_alert_structure: {
            alert_type: 'HTF_ACR_SWEEP',
            symbol: 'EURUSD',
            acr_direction: 'BULLISH',
            htf_timeframe: '240',
            ltf_timeframe: '15',
            signal_components: ['ACR', 'CISD', 'ACRX', 'Market Context']
        }
    });
});

// Webhook GET (info) - Updated
app.get('/webhook/tradingview', (req, res) => {
    res.json({
        message: 'AudenFX HTF Alert Endpoint Ready! 🎯',
        version: '2.0 - Enhanced HTF Support',
        method: 'Use POST method to send HTF alerts from TradingView',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
        supported_alert_types: [
            'HTF_ACR_SWEEP - Main signal type',
            'ACRX_EXPANSION - Momentum signals', 
            'CISD_CONFIRMATION - Structure confirmations'
        ],
        data_processing: [
            '🎖️ Signal Strength Calculation',
            '📊 Market Context Analysis', 
            '⚡ Multi-signal Confluence',
            '🔮 Automated Market Analysis'
        ]
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        method: req.method,
        url: req.originalUrl,
        available_endpoints: {
            'GET /': 'Health check and bot status',
            'GET /debug': 'Debug information', 
            'GET /webhook/tradingview': 'Webhook info',
            'POST /webhook/tradingview': 'Main HTF webhook for alerts',
            'POST /test': 'Send enhanced test alert'
        },
        version: '2.0 - HTF Enhanced',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AudenFX HTF Bot Server v2.0 running on port ${PORT}`);
    console.log(`🕐 Server time: ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎯 Features: HTF ACR Detection, ACRX Signals, Signal Strength Analysis`);
    
    // Validate credentials on startup
    setTimeout(async () => {
        const validation = await validateBotCredentials();
        console.log(`🤖 Bot validation: ${validation.valid ? '✅ VALID' : '❌ INVALID'}`);
        if (!validation.valid) {
            console.error(`❌ Configuration error: ${validation.error}`);
        } else {
            console.log(`✅ HTF Alert Bot ready: ${validation.bot_info.first_name}`);
            console.log(`💬 Target chat: ${validation.chat_info.title || validation.chat_info.first_name || 'Private'}`);
        }
    }, 3000);
});