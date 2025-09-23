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

// Trading Tips Array (Enhanced) - 100+ quotes
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
    "Reversal + Market Structure = powerful combination 🔄",
    "Trading itu gampang… kalau tau arah candle selanjutnya 😂",
    "SL kena = market bilang kamu terlalu pede 😏",
    "TP kelewatan = market bilang kamu terlalu rakus 🐷",
    "Chart sideways itu bukan market istirahat, itu market nge-prank kamu 🃏",
    "Trader sejati tau rasanya bangun jam 3 pagi cuma buat liat floating merah 😭",
    "Indikator paling jujur adalah saldo akun 💸",
    "Overtrading = cara tercepat kenalan sama MC 🪦",
    "Kalau trading bikin kaya, kenapa banyak trader suka ngutang kopi? ☕",
    "Entry tanpa plan itu sama kayak nyebur kolam tanpa cek kedalaman 🏊",
    "Market itu drama queen, suka bikin plot twist 🎭",
    "Profit kecil konsisten lebih enak daripada sekali jackpot lalu hilang akun 🎲",
    "Hedging itu kayak pacaran sama dua orang: ribet, deg-degan, tapi seru 🤐",
    "Leverage gede = cara instan jadi miskin 🚑",
    "News trading itu judi berizin, siap-siap lempar koin 🪙",
    "Cut loss cepat bikin sakit sebentar, hold loss bikin trauma seumur hidup 💔",
    "Market bukan tempat cari kepastian, itu kerjaannya pasanganmu 😏",
    "Candle doji = market lagi mikir, kamu jangan sok tau 🤓",
    "Kalau modal kecil, jangan gaya lot gede. Itu namanya suicidal trading 💀",
    "Candle merah panjang = pasar lagi diet, buang lemak 📉",
    "Candle hijau panjang = pasar habis gajian, belanja besar 📈",
    "Floating minus itu bukan nasib, itu pilihan 🙃",
    "Lot besar bikin kaya lebih cepat, miskin juga lebih cepat 🏎️",
    "Jangan bilang scalping sebentar kalau ujung-ujungnya seharian depan chart 😆",
    "Trading plan tanpa disiplin = dekorasi PDF 💻",
    "Kalau chart bikin pusing, itu tandanya kamu butuh tidur, bukan entry 🛌",
    "MC itu bukan Mister Candle, tapi Mister Cancel mimpi 💀",
    "Trader pemula lihat signal langsung entry. Trader pro lihat signal masih nunggu 🙄",
    "Akun demo selalu hijau, akun real selalu drama 🎬",
    "Kalau nggak sabar, lebih baik main catur daripada trading ⏳",
    "Market itu bukan mantan, jangan coba-coba balikan revenge trade 😅",
    "Indikator 10 layer nggak bikin kaya, cuma bikin chart kayak pelangi 🌈",
    "SL kecil = sakit sedikit. SL gede = sakit lama 😵",
    "Kalau entry cuma karena bosan, MC sudah menunggu di ujung jalan 🛣️",
    "Trader pro bilang less is more, pemula bilang klik lagi aja 🤦",
    "Kalau trading sambil emosi, siap-siap bikin broker makin kaya 💰",
    "Buy high, sell low = hobi favorit trader pemula 🤡",
    "Market selalu benar. Kamu? cuma numpang lewat 😏",
    "Candle pattern bagus di textbook, tapi market lebih suka freestyle 🕺",
    "Chart keliatan gampang di screenshot, susah di live trade 📸",
    "Risk reward 1:3 cuma keren kalau disiplin, kalau nggak ya 3:0 😬",
    "Trader sukses punya 2 skill: entry tepat & close tepat. Sisanya drama 🪄",
    "Kalau modal pas-pasan, fokus survive dulu, jangan gaya kaya hedge fund 😎",
    "Floating profit jangan di-SS dulu, bisa jadi cerita horror nanti 👻",
    "Semua orang pinter baca chart ke belakang, yang mahal itu baca ke depan 🔮",
    "Market open = semangat. Market close = nyesel. Cycle repeat ♻️",
    "Kalau strategi kamu ribet, itu bukan canggih, tapi nyusahin 🤯",
    "Cut loss itu bukan lemah, itu tanda masih punya otak 🧠",
    "Kalau entry cuma ikut temen, siap-siap MC bareng 👫",
    "Scalping = adrenaline junkie trading version ⚡",
    "Kalau market lagi nge-prank, tutup laptop tetap selamat 😌",
    "Satu setup A+ lebih berharga dari 10 setup asal-asalan 🎯",
    "Kalau trading sambil makan mie instan, jangan heran kalau saldo ikutan instan 🍜",
    "Lot kecil = tidur nyenyak. Lot besar = mimpi buruk 🌙",
    "Overconfidence bikin akun hancur lebih cepat daripada crash crypto 💥",
    "Sinyal gratis = hiburan. Money management = kenyataan 📊",
    "Kalau modal kecil jangan mimpi jadi Warren Buffet dalam seminggu 🐢",
    "Market sideways = latihan kesabaran kelas internasional 🧘",
    "Setiap candle punya cerita, tapi nggak semua cerita happy ending 📖",
    "Kalau profit langsung tarik, jangan nunggu broker tiba-tiba drama 🚪",
    "MC bukan akhir dunia, tapi bisa jadi akhir hubungan 💔",
    "Kalau trading buat gaya, siap-siap jadi bahan lelucon grup WA 🤣",
    "Disiplin itu nggak bisa dibeli, tapi bisa nyelametin akun 💎",
    "Kalau strategi sering ganti, yang diganti sebenernya mental kamu 🌀",
    "Market itu bos. Jangan coba jadi hero, cukup jadi follower pintar 🏃",
    "Semua orang mau profit besar, jarang ada yang mau sabar lama ⏱️",
    "Kalau equity drop, jangan drop juga mentalnya 🙌",
    "Trader pemula suka bilang ah ini pasti balik arah market LOL no 😂",
    "Beli dip? Dip mana? Chart selalu punya dip baru 🕳️",
    "Kalau sinyal banyak, pilih satu. Kalau ambil semua, siap-siap chaos 🤯",
    "SL dihapus = MC menunggu di ujung pintu 🚪",
    "Kalau chart bikin baper, ingat: candle cuma pixel, bukan hatimu ❤️",
    "Candle bullish engulfing bukan berarti rejeki engulfing juga 😏",
    "Belajar trading itu kayak diet, teori gampang, prakteknya nyiksa 🍕",
    "Kalau deposit sering, itu bukan investasi, itu top up game 🎮",
    "Trader pro tau kapan nggak entry, pemula tau kapan klik buy/sell 🖱️",
    "Kalau lot over, jangan salahin broker. Salahin ego sendiri 😬",
    "Trading itu simple, manusia yang bikin ribet 👀",
    "Semua setup bagus sampai kena SL 🤡",
    "Market itu kasino elegan, kamu cuma tamu VIP wannabe 🃏",
    "Kalau floating minus bikin sakit, jangan trading lot jumbo lagi 🛑",
    "Plan > feeling. Kalau nggak, hasilnya random kayak cuaca 🌦️",
    "Kalau modal pas-pasan, stop gaya full margin. Broker senyum liat kamu 😈",
    "Chart itu netral, cuma trader yang kasih drama 🕶️",
    "Kalau kamu sering bilang last entry, berarti bakal ada entry lagi 🤔",
    "Trader newbie: fokus cari entry. Trader pro: fokus cari exit 🚪",
    "Kalau udah kena MC, jangan bilang ini ujian. Itu kesalahan 💀",
    "Market itu bukan pacar, jangan harap dia setia sama analisismu 😅",
    "Kalau chart bikin frustasi, inget: tombol log out gratis 🔌",
    "Profit kecil hari ini lebih baik daripada MC besar besok 📆",
    "Kalau trading sambil doa semoga profit, artinya strategi kamu nggak yakin 🙏",
    "Market kasih sinyal, kamu kasih drama. Fair enough 🤝",
    "Kalau sering entry random, akun kamu bakal random hilang 🌀",
    "Jangan percaya influencer trading mereka kaya dari follower, bukan market 😏",
    "Kalau SL kecil bikin kapok, berarti kamu belum tau rasanya margin call 😬",
    "Trading itu marathon. Lari sprint = langsung ngos-ngosan akun 💨",
    "Kalau sering overtrade, broker bakal undang kamu gala dinner 🎉",
    "Candle trap itu kejutan, bukan hadiah 🎁",
    "Market bisa lebih lama irrational daripada kamu bisa tahan floating 😵",
    "Jangan kejar market, biar market kejar setupmu 🏹",
    "Trader sejati tau bahwa hari tanpa entry juga produktif 📴",
    "Kalau profit langsung belanja, nanti market belanja balik modalmu 🛍️",
    "MC = Market Charity. Kamu donasi ke broker tiap minggu 🤲"
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

function calculateSignalStrength(data) {
    let strength = 0;
    let factors = [];
    
    // ACR Direction (base)
    if (data.acr_direction && data.acr_direction !== 'NEUTRAL') {
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
    const priceChange = parseFloat(data.price_change_1h) || 0;
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

// Helper function to extract basic data
function extractBasicData(data) {
    return {
        symbol: data.symbol || data.ticker || 'UNKNOWN',
        direction: data.acr_direction || data.direction || 'NEUTRAL',
        price: data.current_price || data.price || '0.00000',
        timeframe: data.htf || data.timeframe || 'Unknown'
    };
}

// FIXED: Proper newline formatting for Telegram
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
            price_change_1h = '0',
            volume = '0'
        } = data;

        // Clean data dengan proper handling
        const cleanSymbol = (symbol || 'UNKNOWN').toString().replace(/[^\w]/g, '');
        const cleanPrice = (current_price || '0.00000').toString().replace(/[^0-9.]/g, '');
        const cleanSweep = (sweep_level || '0.00000').toString().replace(/[^0-9.]/g, '');
        const cleanCISD = (cisd_status || 'NEUTRAL').toString();
        const cleanACRX = (acrx_signals || '').toString();
        
        // Get fresh data
        const currentTime = moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss');
        const marketSession = getMarketSession();
        const randomTip = getRandomTip();
        
        // Direction styling
        const isbullish = acr_direction === 'BULLISH';
        const isbearish = acr_direction === 'BEARISH';
        const directionEmoji = isbullish ? '🟢' : isbearish ? '🔴' : '⚪';
        const trendArrow = isbullish ? '📈' : isbearish ? '📉' : '➖';
        const setupIcon = isbullish ? '🚀' : isbearish ? '🎯' : '🔄';
        
        // Price change
        const priceChange = parseFloat(price_change_1h) || 0;
        const changeEmoji = priceChange > 0 ? '📈' : priceChange < 0 ? '📉' : '➖';
        const changeSign = priceChange > 0 ? '+' : '';
        
        // CISD emoji
        const cisdEmoji = cleanCISD.includes('BULLISH') ? '🟢' : 
                          cleanCISD.includes('BEARISH') ? '🔴' : '⚪';

        // Signal strength
        const signalData = calculateSignalStrength(data);
        const strengthEmoji = getSignalEmoji(signalData.strength);

        // Volume formatting
        let volumeText = '';
        if (volume && volume !== '0') {
            const vol = parseFloat(volume);
            if (!isNaN(vol) && vol > 0) {
                if (vol > 1000000) {
                    volumeText = `📊 Volume: ${(vol/1000000).toFixed(1)}M`;
                } else if (vol > 1000) {
                    volumeText = `📊 Volume: ${(vol/1000).toFixed(1)}K`;
                } else {
                    volumeText = `📊 Volume: ${vol.toFixed(0)}`;
                }
            }
        }

        // Market analysis
        const analysis = getMarketAnalysis(acr_direction, cleanACRX);

        // BUILD MESSAGE dengan explicit line breaks
        const lines = [
            '🚨 AUDENFX SIGNAL ALERT 🚨',
            '',
            `${setupIcon} ${cleanSymbol} | ${formatTimeframe(timeframe)} → ${formatTimeframe(htf)}`,
            `${directionEmoji} ${acr_direction} ACR ${trendArrow}`,
            `${strengthEmoji} Signal Strength: ${signalData.strength}%`,
            '━━━━━━━━━━━━━━━━━━━━━━',
            '',
            `💰 Current Price: ${cleanPrice}`,
            `🎯 Sweep Level: ${cleanSweep}`,
            `${changeEmoji} 1H Change: ${changeSign}${Math.abs(priceChange).toFixed(2)}%`
        ];

        // Add volume if available
        if (volumeText) {
            lines.push(volumeText);
        }
        
        lines.push('');

        // Signal info
        lines.push(`${cisdEmoji} CISD: ${cleanCISD}`);
        if (cleanACRX && cleanACRX !== '') {
            lines.push(`⚡ ACR+: ${cleanACRX}`);
        }
        lines.push(`📊 Analysis: ${analysis}`);
        lines.push('');

        // Session & Time
        lines.push(marketSession);
        lines.push(`🕐 Alert Time: ${currentTime} WIB`);
        lines.push('');

        // Tip
        lines.push('💡 Kata-Kata Hari Ini King:');
        lines.push(`"${randomTip}"`);
        lines.push('');

        // Footer
        lines.push('━━━━━━━━━━━━━━━━━━━━━━');
        lines.push('⚠️ Risk Management is Key');
        lines.push('📊 Always DYOR • NFA');
        lines.push(`#AudenFX #${cleanSymbol} #${acr_direction}ACR`);

        // Join dengan newline yang benar
        const finalMessage = lines.join('\n');
        
        console.log('📝 Message formatted with', lines.length, 'lines');
        return finalMessage;
        
    } catch (error) {
        console.error('Format message error:', error);
        
        // Ultra-safe fallback dengan explicit newlines
        const fallbackLines = [
            '🚨 AUDENFX ALERT',
            '',
            `📊 ${data.symbol || 'Unknown'}`,
            `🎯 ${data.acr_direction || 'Unknown'} ACR`,
            `💰 Price: ${data.current_price || '0'}`,
            `🎯 Sweep: ${data.sweep_level || '0'}`,
            '',
            `⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')} WIB`,
            '',
            '⚠️ Always DYOR - NFA'
        ];
        
        return fallbackLines.join('\n');
    }
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

// FIXED: sendToTelegram dengan proper newline handling
async function sendToTelegram(message, retries = 2) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    // Clean message tapi preserve newlines
    let cleanMessage = message.toString();
    
    // Remove hanya karakter berbahaya, KEEP newlines
    cleanMessage = cleanMessage.replace(/[*_`\[\]()~>#+=|{}!\\]/g, '');
    
    // Ensure proper newlines (convert any weird line breaks to \n)
    cleanMessage = cleanMessage.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Remove excessive whitespace tapi preserve line structure
    cleanMessage = cleanMessage.replace(/[ \t]+/g, ' '); // multiple spaces/tabs to single space
    cleanMessage = cleanMessage.replace(/\n{3,}/g, '\n\n'); // max 2 consecutive newlines
    cleanMessage = cleanMessage.trim();
    
    // Length check
    if (cleanMessage.length > 4000) {
        cleanMessage = cleanMessage.substring(0, 4000) + '...\n\n⚠️ Message truncated';
    }

    for (let i = 0; i < retries; i++) {
        try {
            console.log(`📤 Sending message to Telegram (attempt ${i + 1}/${retries})`);
            console.log(`📏 Message length: ${cleanMessage.length} chars, ${cleanMessage.split('\n').length} lines`);
            
            const response = await axios.post(url, {
                chat_id: CHAT_ID,
                text: cleanMessage,
                disable_web_page_preview: true
            }, {
                timeout: 20000,
                headers: { 'Content-Type': 'application/json' }
            });
            
            console.log('✅ Message sent with proper formatting');
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
// =================== ROUTES ===================

// Health check
app.get('/', async (req, res) => {
    const validation = await validateBotCredentials();
    
    res.json({
        status: 'AudenFX HTF Alert Bot',
        version: '2.1 - Enhanced HTF Support + Parse-Safe',
        bot_status: validation.valid ? '✅ Ready' : '❌ Configuration Error',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
        features: [
            '🎯 HTF-based ACR Detection',
            '⚡ ACRX Signal Processing',
            '📊 CISD Confirmation Analysis', 
            '🔥 Signal Strength Calculation',
            '📈 Market Context Integration',
            '🎖️ Multi-timeframe Data Handling',
            '🛡️ Parse-Error-Free Messaging'
        ],
        quotes_available: tradingTips.length,
        server_info: {
            uptime: Math.floor(process.uptime()),
            memory_usage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            node_version: process.version
        },
        validation: {
            credentials_valid: validation.valid,
            error: validation.error || null,
            bot_name: validation.bot_info?.first_name || null,
            chat_type: validation.chat_info?.type || null
        }
    });
});

// Main webhook endpoint - Enhanced & Parse-Safe
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
                
                // Ultra-simple plain text message
                const simpleMessage = `🚨 AudenFX Alert\n\n${req.body}\n\n⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')}\n${getMarketSession()}\n\n⚠️ Always DYOR`;
                
                const result = await sendToTelegram(simpleMessage);
                
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
        const basicData = extractBasicData(alertData);
        console.log('📊 HTF Alert data received:', {
            symbol: basicData.symbol,
            direction: basicData.direction,
            price: basicData.price,
            signal_strength: calculateSignalStrength(alertData).strength
        });

        // Add server-side enrichments
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
            volume: '0',
            ...alertData,
            alert_time_wib: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
            market_session: getMarketSession(),
            random_tip: getRandomTip()
        };

        console.log('🔥 Enriched data ready for formatting');

        // Format and send message
        const formattedMessage = formatMessage(enrichedData);
        const result = await sendToTelegram(formattedMessage);
        
        if (result.ok) {
            console.log(`✅ HTF Alert sent: ${basicData.symbol} ${basicData.direction} (Strength: ${calculateSignalStrength(enrichedData).strength}%)`);
            
            res.status(200).json({
                success: true,
                message: 'HTF Alert sent to Telegram successfully',
                data: {
                    symbol: basicData.symbol,
                    direction: basicData.direction,
                    alert_type: alertData.alert_type || 'HTF_ACR',
                    signal_strength: calculateSignalStrength(enrichedData).strength,
                    timestamp: enrichedData.alert_time_wib
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

        // Create comprehensive test alert
        const testData = {
            symbol: 'EURUSD',
            alert_type: 'HTF_ACR_SWEEP',
            current_price: '1.08425',
            timeframe: '15',
            htf: '240',
            acr_direction: 'BULLISH',
            sweep_level: '1.08550',
            cisd_status: 'BULLISH CISD',
            acrx_signals: 'CISD / EXP',
            price_change_1h: '0.45',
            volume: '1250000'
        };

        const testMessage = formatMessage(testData);
        const result = await sendToTelegram(testMessage);
        
        res.json({
            success: result.ok,
            message: result.ok ? 'Enhanced HTF test alert sent successfully!' : 'Failed to send test alert',
            error: result.ok ? null : result.error,
            test_data: {
                signal_strength: calculateSignalStrength(testData).strength,
                quotes_available: tradingTips.length,
                parse_safe: true
            },
            bot_info: {
                name: validation.bot_info?.first_name,
                username: validation.bot_info?.username
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

// Debug endpoint
app.get('/debug', async (req, res) => {
    const validation = await validateBotCredentials();
    
    res.json({
        debug_info: {
            version: '2.1 - HTF Enhanced + Parse-Safe',
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
            quotes_count: tradingTips.length,
            features_enabled: [
                'HTF ACR Detection',
                'ACRX Signal Processing', 
                'CISD Confirmation',
                'Signal Strength Analysis',
                'Multi-timeframe Context',
                'Parse-Error-Free Messaging',
                `${tradingTips.length}+ Trading Quotes`
            ]
        }
    });
});

// Webhook GET (info)
app.get('/webhook/tradingview', (req, res) => {
    res.json({
        message: 'AudenFX HTF Alert Endpoint Ready! 🎯',
        version: '2.1 - Enhanced HTF Support + Parse-Safe',
        method: 'Use POST method to send HTF alerts from TradingView',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
        features: [
            '🎖️ Signal Strength Calculation',
            '📊 Market Context Analysis', 
            '⚡ Multi-signal Confluence',
            '🔮 Automated Market Analysis',
            '🛡️ Parse-Error-Free Delivery',
            `💬 ${tradingTips.length}+ Trading Quotes`
        ]
    });
});

// Emergency test endpoint (ultra-minimal)
app.post('/test-minimal', async (req, res) => {
    try {
        const testMessage = `🧪 Test Alert\n\nServer working\nBot connected\nTime: ${moment().tz('Asia/Jakarta').format('HH:mm DD/MM/YYYY')}\n\nQuotes available: ${tradingTips.length}\n\nTest successful`;
        
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: testMessage
        }, { timeout: 10000 });
        
        res.json({
            success: true,
            message: 'Minimal test sent',
            quotes_count: tradingTips.length,
            telegram_response: response.data
        });
        
    } catch (error) {
        console.error('Minimal test error:', error);
        res.status(500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
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
            'POST /test': 'Send enhanced test alert',
            'POST /test-minimal': 'Send minimal test alert'
        },
        version: '2.1 - HTF Enhanced + Parse-Safe',
        quotes_available: tradingTips.length,
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AudenFX HTF Bot Server v2.1 running on port ${PORT}`);
    console.log(`🕐 Server time: ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎯 Features: HTF ACR Detection, Parse-Safe Messaging`);
    console.log(`💬 Trading quotes loaded: ${tradingTips.length}`);
    
    // Validate credentials on startup
    setTimeout(async () => {
        const validation = await validateBotCredentials();
        console.log(`🤖 Bot validation: ${validation.valid ? '✅ VALID' : '❌ INVALID'}`);
        if (!validation.valid) {
            console.error(`❌ Configuration error: ${validation.error}`);
        } else {
            console.log(`✅ HTF Alert Bot ready: ${validation.bot_info.first_name}`);
            console.log(`💬 Target chat: ${validation.chat_info.title || validation.chat_info.first_name || 'Private'}`);
            console.log(`🛡️ Parse-safe messaging enabled - No more Telegram errors!`);
        }
    }, 3000);
});