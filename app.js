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

// Enable CORS
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
    bullish_momentum: ["🚀 Strong bullish momentum detected", "📈 Uptrend continuation likely"],
    bearish_momentum: ["🎯 Strong bearish momentum detected", "📉 Downtrend continuation likely"],
    consolidation: ["🔄 Market in consolidation phase", "📊 Waiting for clear direction"]
};

// ============= UTILITY FUNCTIONS =============
function getRandomTip() {
    return tradingTips[Math.floor(Math.random() * tradingTips.length)];
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
    
    if (day === 0 || day === 6) return "🛌 Weekend - Market Closed";
    if (hour >= 5 && hour < 14) return "🌏 Asian Session";
    if (hour >= 14 && hour < 22) return "🇪🇺 European Session";
    if (hour >= 22 || hour < 5) return "🇺🇸 US Session";
    return "🌙 Market Transition";
}

// FIXED: Missing getSignalEmoji function
function getSignalEmoji(strength) {
    if (strength >= 80) return '🔥';
    if (strength >= 60) return '⚡';
    if (strength >= 40) return '💫';
    return '⭐';
}

// Signal strength calculation
function calculateSignalStrength(data) {
    let strength = 0;
    let factors = [];
    
    try {
        // ACR Direction (base strength)
        if (data.acr_direction && data.acr_direction !== 'NEUTRAL') {
            strength += 25;
            factors.push('ACR Pattern');
        }
        
        // CISD Status
        if (data.cisd_status && data.cisd_status.includes('CISD')) {
            strength += 20;
            factors.push('CISD Confirmed');
        }
        
        // ACRX Signals
        if (data.acrx_signals) {
            if (data.acrx_signals.includes('CISD')) {
                strength += 15;
                factors.push('ACR+ CISD');
            }
            if (data.acrx_signals.includes('EXP')) {
                strength += 10;
                factors.push('ACR+ Expansion');
            }
        }
        
        // HTF momentum
        const htfChange = parseFloat(data.htf_change_pct) || 0;
        if (Math.abs(htfChange) > 0.3) {
            strength += 10;
            factors.push('HTF Momentum');
        }
        
        return {
            strength: Math.min(strength, 100),
            factors: factors
        };
    } catch (error) {
        console.error('Signal strength calculation error:', error);
        return { strength: 0, factors: [] };
    }
}

// ============= PARSING FUNCTIONS =============
function extractDataManually(rawData) {
    console.log('🔍 Manual extraction started...');
    
    const extracted = { parsing_method: 'manual_regex' };
    
    try {
        const dataString = rawData.toString();
        
        const extractField = (fieldName, defaultValue = '') => {
            const regex = new RegExp(`"${fieldName}":(\\d+\\.?\\d*|"[^"]*"|true|false)`, 'i');
            const match = dataString.match(regex);
            if (match) {
                let value = match[1];
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                if (value === 'true') return true;
                if (value === 'false') return false;
                return value;
            }
            return defaultValue;
        };
        
        // Extract basic fields
        extracted.symbol = extractField('symbol', 'UNKNOWN');
        extracted.alert_type = extractField('alert_type', 'HTF_ACR_SWEEP');
        extracted.current_ltf_price = parseFloat(extractField('current_ltf_price', '0')) || 0;
        extracted.ltf_timeframe = extractField('ltf_timeframe', '1');
        extracted.htf_timeframe = extractField('htf_timeframe', '15');
        extracted.acr_direction = extractField('acr_direction', 'NEUTRAL');
        extracted.sweep_level = parseFloat(extractField('sweep_level', '0')) || 0;
        extracted.cisd_status = extractField('cisd_status', 'NEUTRAL');
        extracted.cisd_direction = extractField('cisd_direction', 'NONE');
        extracted.acrx_signals = extractField('acrx_signals', '');
        extracted.htf_change_pct = parseFloat(extractField('htf_change_pct', '0')) || 0;
        extracted.htf_volume = parseFloat(extractField('htf_volume', '0')) || 0;
        
        console.log('✅ Manual extraction completed:', {
            symbol: extracted.symbol,
            direction: extracted.acr_direction,
            price: extracted.current_ltf_price
        });
        
        return extracted;
        
    } catch (error) {
        console.error('❌ Manual extraction failed:', error.message);
        return { 
            error: 'Manual extraction failed',
            symbol: 'EXTRACT_ERROR',
            acr_direction: 'UNKNOWN'
        };
    }
}

function parseAlertData(rawData) {
    try {
        console.log('🔍 Parsing raw data type:', typeof rawData);
        
        // If already object, return it
        if (typeof rawData === 'object' && rawData !== null) {
            console.log('✅ Data already parsed as object');
            return rawData;
        }
        
        // If string, try to parse
        if (typeof rawData === 'string') {
            let cleanData = rawData.trim();
            
            // Try direct JSON parse first
            if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
                try {
                    const parsed = JSON.parse(cleanData);
                    console.log('✅ Valid JSON parsed successfully');
                    return parsed;
                } catch (e) {
                    console.log('❌ JSON parse failed:', e.message);
                }
            }
            
            // Fix malformed JSON
            if (!cleanData.startsWith('{')) {
                cleanData = '{' + cleanData;
            }
            if (!cleanData.endsWith('}')) {
                cleanData = cleanData + '}';
            }
            
            try {
                const parsed = JSON.parse(cleanData);
                console.log('✅ Fixed JSON parsed successfully');
                return parsed;
            } catch (parseError) {
                console.log('❌ JSON parse still failed, using manual extraction');
                return extractDataManually(rawData);
            }
        }
        
        console.log('❌ Unable to parse data type:', typeof rawData);
        return { error: 'Unable to parse data', raw: rawData };
        
    } catch (error) {
        console.error('💥 Parse error:', error.message);
        return extractDataManually(rawData);
    }
}

// ============= DATA MAPPING =============
function mapAlertData(parsedData) {
    try {
        const mapped = {
            symbol: parsedData.symbol || 'UNKNOWN',
            alert_type: parsedData.alert_type || 'HTF_ACR_SWEEP',
            current_ltf_price: parsedData.current_ltf_price || 0,
            ltf_timeframe: parsedData.ltf_timeframe || '1',
            htf_timeframe: parsedData.htf_timeframe || '15',
            acr_direction: parsedData.acr_direction || 'NEUTRAL',
            sweep_level: parsedData.sweep_level || 0,
            cisd_status: parsedData.cisd_status || 'NEUTRAL',
            cisd_direction: parsedData.cisd_direction || 'NONE',
            acrx_signals: parsedData.acrx_signals || '',
            htf_change_pct: parsedData.htf_change_pct || 0,
            htf_volume: parsedData.htf_volume || 0,
            _original: parsedData
        };
        
        console.log('📊 Data mapped successfully:', {
            symbol: mapped.symbol,
            direction: mapped.acr_direction,
            price: mapped.current_ltf_price
        });
        
        return mapped;
    } catch (error) {
        console.error('❌ Data mapping error:', error);
        return {
            symbol: 'MAP_ERROR',
            acr_direction: 'NEUTRAL',
            current_ltf_price: 0,
            error: error.message
        };
    }
}

// ============= MESSAGE FORMATTING =============
function formatMessage(data) {
    try {
        // SAFE data extraction with fallbacks
        const symbol = (data.symbol || 'UNKNOWN').toString().replace(/[^\w]/g, '').toUpperCase();
        const direction = (data.acr_direction || 'NEUTRAL').toString().toUpperCase();
        const ltfPrice = (data.current_ltf_price || 0).toString();
        const sweep = (data.sweep_level || 0).toString();
        const cisd = (data.cisd_status || 'NEUTRAL').toString();
        const acrx = (data.acrx_signals || '').toString();
        const ltfTF = (data.ltf_timeframe || '1').toString();
        const htfTF = (data.htf_timeframe || '15').toString();
        
        // Time & session
        const now = moment().tz('Asia/Jakarta');
        const timeStr = now.format('DD/MM/YYYY HH:mm:ss');
        const session = getMarketSession();
        const tip = getRandomTip();
        
        // Emojis
        const dirEmoji = direction === 'BULLISH' ? '🟢' : direction === 'BEARISH' ? '🔴' : '⚪';
        const arrow = direction === 'BULLISH' ? '📈' : direction === 'BEARISH' ? '📉' : '➖';
        const icon = direction === 'BULLISH' ? '🚀' : direction === 'BEARISH' ? '🎯' : '🔄';
        
        // HTF change
        const change = parseFloat(data.htf_change_pct) || 0;
        const changeEmoji = change > 0 ? '📈' : change < 0 ? '📉' : '➖';
        const changeSign = change > 0 ? '+' : '';
        
        // Signal strength
        const strength = calculateSignalStrength(data).strength;
        const strengthEmoji = getSignalEmoji(strength);
        
        // Market analysis
        const analysis = getMarketAnalysis(direction, acrx);
        
        // BUILD MESSAGE SAFELY
        let msg = '';
        msg += '🚨 AUDENFX SWEEP ACR ALERT 🚨\n\n';
        msg += `${icon} ${symbol} | ${formatTimeframe(ltfTF)} → ${formatTimeframe(htfTF)}\n`;
        msg += `${dirEmoji} ${direction} ACR SWEEP ${arrow}\n`;
        msg += `${strengthEmoji} Signal Strength: ${strength}%\n`;
        msg += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
        
        // Price info
        msg += `💰 LTF Price: ${ltfPrice}\n`;
        msg += `🎯 Sweep Level: ${sweep}\n`;
        msg += `${changeEmoji} HTF Change: ${changeSign}${Math.abs(change).toFixed(2)}%\n\n`;
        
        // CISD info
        msg += `🔵 CISD: ${cisd}\n`;
        if (acrx && acrx !== '') {
            msg += `⚡ ACR+: ${acrx}\n`;
        }
        
        msg += `\n📊 Analysis: ${analysis}\n\n`;
        msg += `${session}\n`;
        msg += `🕐 ${timeStr} WIB\n\n`;
        msg += `💡 "${tip}"\n\n`;
        msg += '━━━━━━━━━━━━━━━━━━━━━━\n';
        msg += '⚠️ Risk Management is Key\n';
        msg += '📊 Always DYOR • NFA\n';
        msg += `#AudenFX #${symbol} #${direction}ACR`;
        
        console.log('✅ Message formatted successfully');
        return msg;
        
    } catch (error) {
        console.error('❌ Format error:', error);
        const now = moment().tz('Asia/Jakarta');
        return `🚨 AUDENFX HTF ALERT\n\nFormatting Error: ${error.message}\n\n⏰ ${now.format('DD/MM/YYYY HH:mm:ss')} WIB\n${getMarketSession()}\n\n⚠️ Always DYOR`;
    }
}

// ============= BOT FUNCTIONS =============
async function validateBotCredentials() {
    if (!BOT_TOKEN || !CHAT_ID) {
        return { valid: false, error: 'Missing BOT_TOKEN or CHAT_ID' };
    }

    try {
        const botInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
        const botResponse = await axios.get(botInfoUrl, { timeout: 10000 });
        
        if (!botResponse.data.ok) {
            return { valid: false, error: 'Invalid BOT_TOKEN' };
        }

        const chatInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${CHAT_ID}`;
        const chatResponse = await axios.get(chatInfoUrl, { timeout: 10000 });
        
        if (!chatResponse.data.ok) {
            return { valid: false, error: `Cannot access chat ${CHAT_ID}` };
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

async function sendToTelegram(message, retries = 2) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    let cleanMessage = message.toString();
    cleanMessage = cleanMessage.replace(/[*_`\[\]()~>#+=|{}!\\]/g, '');
    cleanMessage = cleanMessage.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    cleanMessage = cleanMessage.replace(/[ \t]+/g, ' ');
    cleanMessage = cleanMessage.replace(/\n{3,}/g, '\n\n');
    cleanMessage = cleanMessage.trim();
    
    if (cleanMessage.length > 4000) {
        cleanMessage = cleanMessage.substring(0, 4000) + '...\n\n⚠️ Message truncated';
    }

    for (let i = 0; i < retries; i++) {
        try {
            console.log(`📤 Sending message to Telegram (attempt ${i + 1}/${retries})`);
            
            const response = await axios.post(url, {
                chat_id: CHAT_ID,
                text: cleanMessage,
                disable_web_page_preview: true
            }, {
                timeout: 20000,
                headers: { 'Content-Type': 'application/json' }
            });
            
            console.log('✅ Message sent successfully');
            return { ok: true, data: response.data };
            
        } catch (error) {
            const errorDetails = error.response?.data || error.message;
            console.error(`❌ Telegram error (attempt ${i + 1}):`, errorDetails);
            
            if (i === retries - 1) {
                return { ok: false, error: errorDetails };
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// ============= ROUTES =============

// Health check
app.get('/', async (req, res) => {
    const validation = await validateBotCredentials();
    
    res.json({
        status: 'AudenFX HTF Alert Bot',
        version: '3.0 - Clean & Fixed',
        bot_status: validation.valid ? '✅ Ready' : '❌ Configuration Error',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
        features: [
            '🎯 HTF-based ACR Detection',
            '⚡ Smart JSON Parser',
            '🛡️ Error-Resistant Parsing',
            '📱 Clean Message Formatting'
        ],
        quotes_available: tradingTips.length,
        validation: validation
    });
});

// Main webhook endpoint
app.post('/webhook/tradingview', async (req, res) => {
    try {
        const validation = await validateBotCredentials();
        if (!validation.valid) {
            return res.status(500).json({
                success: false,
                error: 'Bot configuration error'
            });
        }

        console.log('📨 TradingView webhook received');
        
        // Parse data
        const parsedData = parseAlertData(req.body);
        
        if (parsedData.error && !parsedData.symbol) {
            const errorMessage = `🚨 AudenFX Alert - Parse Error\n\nError: ${parsedData.error}\n\n⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')} WIB`;
            const result = await sendToTelegram(errorMessage);
            
            return res.status(200).json({
                success: result.ok,
                message: 'Parse error alert sent'
            });
        }
        
        // Map and format
        const mappedData = mapAlertData(parsedData);
        const formattedMessage = formatMessage(mappedData);
        const result = await sendToTelegram(formattedMessage);
        
        res.status(200).json({
            success: result.ok,
            message: result.ok ? 'HTF Alert sent successfully' : 'Failed to send alert',
            data: {
                symbol: mappedData.symbol,
                direction: mappedData.acr_direction,
                timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
            }
        });

    } catch (error) {
        console.error('💥 Webhook error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test endpoint
app.post('/test', async (req, res) => {
    try {
        const validation = await validateBotCredentials();
        if (!validation.valid) {
            return res.status(500).json({
                success: false,
                error: 'Bot configuration error'
            });
        }

        const testData = {
            symbol: 'EURUSD',
            alert_type: 'HTF_ACR_SWEEP',
            current_ltf_price: 1.08425,
            ltf_timeframe: '1',
            htf_timeframe: '240',
            acr_direction: 'BULLISH',
            sweep_level: 1.08550,
            cisd_status: 'BULLISH CISD',
            acrx_signals: 'CISD / EXP',
            htf_change_pct: 0.45
        };

        const mappedData = mapAlertData(testData);
        const testMessage = formatMessage(mappedData);
        const result = await sendToTelegram(testMessage);
        
        res.json({
            success: result.ok,
            message: result.ok ? 'Test alert sent successfully!' : 'Failed to send test alert',
            signal_strength: calculateSignalStrength(mappedData).strength
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: {
            'GET /': 'Health check',
            'POST /webhook/tradingview': 'Main webhook',
            'POST /test': 'Test alert'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AudenFX HTF Bot v3.0 running on port ${PORT}`);
    console.log(`🕐 ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')}`);
    console.log(`💬 Trading quotes: ${tradingTips.length}`);
    
    setTimeout(async () => {
        const validation = await validateBotCredentials();
        console.log(`🤖 Bot validation: ${validation.valid ? '✅ VALID' : '❌ INVALID'}`);
        if (validation.valid) {
            console.log(`✅ Bot ready: ${validation.bot_info.first_name}`);
        }
    }, 3000);
});  