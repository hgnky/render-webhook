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

// Enhanced signal strength sesuai Pine Script
function calculateSignalStrength(data) {
    let strength = 0;
    let factors = [];
    
    // ACR Direction (base strength)
    if (data.acr_direction && data.acr_direction !== 'NEUTRAL') {
        strength += 25;
        factors.push('ACR Pattern');
    }
    
    // CISD Status
    if (data.cisd_status && data.cisd_status.includes('CISD')) {
        strength += 20;
        factors.push('CISD Confirmed');
        
        // Extra for CISD direction
        if (data.cisd_direction && data.cisd_direction.includes('SETUP')) {
            strength += 10;
            factors.push('CISD Setup');
        }
    }
    
    // ACRX Signals (sesuai Pine Script)
    if (data.acrx_signals) {
        if (data.acrx_signals.includes('CISD')) {
            strength += 15;
            factors.push('ACR+ CISD');
        }
        if (data.acrx_signals.includes('EXP')) {
            strength += 10;
            factors.push('ACR+ Expansion');
        }
        if (data.acrx_signals.includes('REV')) {
            strength += 8;
            factors.push('ACR+ Reversal');
        }
    }
    
    // HTF momentum
    const htfChange = parseFloat(data.htf_change_pct) || 0;
    if (Math.abs(htfChange) > 0.3) {
        strength += 7;
        factors.push('HTF Momentum');
    }
    
    // Pattern validation
    if (data.pattern_details && data.pattern_details.pattern_id > 0) {
        strength += 5;
        factors.push('Pattern ID');
    }
    
    // Volume confirmation
    if (parseFloat(data.htf_volume) > 1000) {
        strength += 5;
        factors.push('Volume');
    }
    
    // Market context (ATR, RSI)
    if (data.market_context) {
        if (data.market_context.current_atr > 0) {
            strength += 3;
            factors.push('ATR Context');
        }
        const rsi = data.market_context.rsi || 50;
        if ((data.acr_direction === 'BULLISH' && rsi < 70) || 
            (data.acr_direction === 'BEARISH' && rsi > 30)) {
            strength += 5;
            factors.push('RSI Alignment');
        }
    }
    
    return {
        strength: Math.min(strength, 100),
        factors: factors
    };
}
// ENHANCED JSON Parser - Handle incomplete dan malformed data
function parseAlertData(rawData) {
    try {
        console.log('🔍 Parsing raw data type:', typeof rawData);
        console.log('📝 Raw data sample:', typeof rawData === 'string' ? rawData.substring(0, 300) + '...' : rawData);
        
        // Jika sudah object, langsung return
        if (typeof rawData === 'object' && rawData !== null) {
            console.log('✅ Data already parsed as object');
            return rawData;
        }
        
        // Jika string, process lebih careful
        if (typeof rawData === 'string') {
            let cleanData = rawData.trim();
            console.log('🧹 Cleaning string data...');
            
            // Method 1: Cek apakah sudah valid JSON
            if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
                try {
                    const parsed = JSON.parse(cleanData);
                    console.log('✅ Valid JSON parsed successfully');
                    return parsed;
                } catch (e) {
                    console.log('❌ JSON parse failed despite brackets:', e.message);
                }
            }
            
            // Method 2: Fix malformed JSON (missing opening bracket)
            if (cleanData.startsWith('"') && !cleanData.startsWith('{')) {
                console.log('🔧 Adding missing opening bracket...');
                cleanData = '{' + cleanData;
            }
            
            // Method 3: Fix incomplete JSON (missing closing bracket)
            if (!cleanData.endsWith('}')) {
                console.log('🔧 Adding missing closing bracket...');
                cleanData = cleanData + '}';
            }
            
            // Method 4: Fix malformed nested objects
            console.log('🔧 Fixing nested objects...');
            cleanData = fixNestedObjects(cleanData);
            
            // Try parsing fixed JSON
            try {
                const parsed = JSON.parse(cleanData);
                console.log('✅ Fixed JSON parsed successfully');
                console.log('📊 Parsed keys:', Object.keys(parsed));
                return parsed;
            } catch (parseError) {
                console.log('❌ JSON parse still failed:', parseError.message);
                console.log('🔍 Problematic data:', cleanData.substring(0, 200));
                
                // Method 5: Extract key data manually using regex
                console.log('🆘 Attempting manual extraction...');
                return extractDataManually(rawData);
            }
        }
        
        // Fallback
        console.log('❌ Unable to parse data type:', typeof rawData);
        return { error: 'Unable to parse data', raw: rawData };
        
    } catch (error) {
        console.error('💥 Parse error:', error.message);
        return extractDataManually(rawData);
    }
}

// Helper function to fix nested objects
function fixNestedObjects(jsonString) {
    try {
        // Fix nested objects like "htfohlc":"open":1.35264,"high":1.35268
        // Should be "htfohlc":{"open":1.35264,"high":1.35268}
        
        let fixed = jsonString;
        
        // Pattern untuk nested objects yang rusak
        const nestedPatterns = [
            /"(htfohlc|ltfohlc|patterndetails|marketcontext)":"([^"]+)":/g,
            /"(htfohlc|ltfohlc|patterndetails|marketcontext)":([^}]+)(?=,"[^"]+":)/g
        ];
        
        // Fix pattern "field":"value": menjadi "field":{"value":
        fixed = fixed.replace(/"(htfohlc|ltfohlc|patterndetails|marketcontext)":"([^"]+)":/g, '"$1":{"$2":');
        
        // Add closing brackets untuk nested objects
        const nestedFields = ['htfohlc', 'ltfohlc', 'patterndetails', 'marketcontext'];
        for (const field of nestedFields) {
            const regex = new RegExp(`"${field}":\\{[^}]*(?=,"[^"]+":)`, 'g');
            fixed = fixed.replace(regex, (match) => match + '}');
        }
        
        console.log('🔧 Nested objects fixed');
        return fixed;
        
    } catch (error) {
        console.log('❌ Error fixing nested objects:', error.message);
        return jsonString;
    }
}


// ENHANCED Data Mapper - sesuai dengan Pine Script naming
function mapAlertData(parsedData) {
    const mapped = {
        symbol: parsedData.symbol || 'UNKNOWN',
        alert_type: parsedData.alert_type || 'HTF_ACR_SWEEP',
        
        // Current TF price data (sesuai Pine Script)
        current_ltf_price: parsedData.current_ltf_price || '0.00000',
        ltf_timeframe: parsedData.ltf_timeframe || '1',
        
        // HTF data (sesuai Pine Script)
        htf_timeframe: parsedData.htf_timeframe || '15',
        htf_bar_time: parsedData.htf_bar_time || Date.now(),
        
        // ACR Pattern data (sesuai Pine Script)
        acr_direction: parsedData.acr_direction || 'NEUTRAL',
        sweep_level: parsedData.sweep_level || '0.00000',
        
        // CISD data (sesuai Pine Script)
        cisd_status: parsedData.cisd_status || 'NEUTRAL',
        cisd_direction: parsedData.cisd_direction || 'NONE',
        
        // ACRX signals (sesuai Pine Script)
        acrx_signals: parsedData.acrx_signals || '',
        
        // HTF change percentage
        htf_change_pct: parsedData.htf_change_pct || 0,
        
        // HTF volume
        htf_volume: parsedData.htf_volume || 0,
        
        // OHLC data (sesuai Pine Script)
        htf_ohlc: {
            open: parsedData.htf_ohlc?.open || 0,
            high: parsedData.htf_ohlc?.high || 0,
            low: parsedData.htf_ohlc?.low || 0,
            close: parsedData.htf_ohlc?.close || 0
        },
        
        ltf_ohlc: {
            open: parsedData.ltf_ohlc?.open || 0,
            high: parsedData.ltf_ohlc?.high || 0,
            low: parsedData.ltf_ohlc?.low || 0,
            close: parsedData.ltf_ohlc?.close || 0
        },
        
        // Pattern details (sesuai Pine Script)
        pattern_details: {
            c1_high: parsedData.pattern_details?.c1_high || 0,
            c1_low: parsedData.pattern_details?.c1_low || 0,
            c2_high: parsedData.pattern_details?.c2_high || 0,
            c2_low: parsedData.pattern_details?.c2_low || 0,
            is_high_sweep: parsedData.pattern_details?.is_high_sweep || false,
            pattern_id: parsedData.pattern_details?.pattern_id || 0
        },
        
        // Market context (sesuai Pine Script)
        market_context: {
            current_atr: parsedData.market_context?.current_atr || 0,
            rsi: parsedData.market_context?.rsi || 50,
            timestamp: parsedData.market_context?.timestamp || Date.now()
        },
        
        // Keep original for debug
        _original: parsedData
    };
    
    console.log('📊 Data mapped successfully:', {
        symbol: mapped.symbol,
        direction: mapped.acr_direction,
        price: mapped.current_ltf_price,
        htf: mapped.htf_timeframe
    });
    
    return mapped;
}


// Enhanced manual extraction sesuai Pine Script output
function extractDataManually(rawData) {
    console.log('🔍 Manual extraction started...');
    
    const extracted = {
        parsing_method: 'manual_regex'
    };
    
    try {
        const dataString = rawData.toString();
        
        // Extract dengan field names yang tepat sesuai Pine Script
        const extractField = (fieldName, defaultValue = '') => {
            const regex = new RegExp(`"${fieldName}":(\\d+\\.?\\d*|"[^"]*"|true|false)`, 'i');
            const match = dataString.match(regex);
            if (match) {
                let value = match[1];
                // Remove quotes if string
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                // Convert boolean strings
                if (value === 'true') return true;
                if (value === 'false') return false;
                return value;
            }
            return defaultValue;
        };
        
        // Extract semua field sesuai Pine Script buildHTFAlertData()
        extracted.symbol = extractField('symbol', 'UNKNOWN');
        extracted.alert_type = extractField('alert_type', 'HTF_ACR_SWEEP');
        extracted.current_ltf_price = parseFloat(extractField('current_ltf_price', '0')) || 0;
        extracted.ltf_timeframe = extractField('ltf_timeframe', '1');
        extracted.htf_timeframe = extractField('htf_timeframe', '15');
        extracted.htf_bar_time = parseInt(extractField('htf_bar_time', Date.now().toString())) || Date.now();
        extracted.acr_direction = extractField('acr_direction', 'NEUTRAL');
        extracted.sweep_level = parseFloat(extractField('sweep_level', '0')) || 0;
        extracted.cisd_status = extractField('cisd_status', 'NEUTRAL');
        extracted.cisd_direction = extractField('cisd_direction', 'NONE');
        extracted.acrx_signals = extractField('acrx_signals', '');
        extracted.htf_change_pct = parseFloat(extractField('htf_change_pct', '0')) || 0;
        extracted.htf_volume = parseFloat(extractField('htf_volume', '0')) || 0;
        
        // Extract nested OHLC data
        extracted.htf_ohlc = {
            open: parseFloat(extractField('open', '0')) || 0,
            high: parseFloat(extractField('high', '0')) || 0,
            low: parseFloat(extractField('low', '0')) || 0,
            close: parseFloat(extractField('close', '0')) || 0
        };
        
        // Extract pattern details
        extracted.pattern_details = {
            c1_high: parseFloat(extractField('c1_high', '0')) || 0,
            c1_low: parseFloat(extractField('c1_low', '0')) || 0,
            c2_high: parseFloat(extractField('c2_high', '0')) || 0,
            c2_low: parseFloat(extractField('c2_low', '0')) || 0,
            is_high_sweep: extractField('is_high_sweep', false),
            pattern_id: parseInt(extractField('pattern_id', '0')) || 0
        };
        
        // Extract market context
        extracted.market_context = {
            current_atr: parseFloat(extractField('current_atr', '0')) || 0,
            rsi: parseFloat(extractField('rsi', '50')) || 50,
            timestamp: parseInt(extractField('timestamp', Date.now().toString())) || Date.now()
        };
        
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
            raw: rawData,
            symbol: 'EXTRACT_ERROR',
            acr_direction: 'UNKNOWN'
        };
    }
}

// Enhanced message formatter sesuai Pine Script data
function formatMessage(data) {
    try {
        // Extract data dengan field names yang benar
        const symbol = (data.symbol || 'UNKNOWN').toString().replace(/[^\w]/g, '');
        const direction = data.acr_direction || 'NEUTRAL';
        const ltfPrice = (data.current_ltf_price || '0.00000').toString();
        const sweep = (data.sweep_level || '0.00000').toString();
        const cisd = data.cisd_status || 'NEUTRAL';
        const cisdDir = data.cisd_direction || 'NONE';
        const acrx = data.acrx_signals || '';
        const ltfTF = data.ltf_timeframe || '1';
        const htfTF = data.htf_timeframe || '15';
        
        // HTF OHLC data
        const htfOpen = data.htf_ohlc?.open || 0;
        const htfHigh = data.htf_ohlc?.high || 0;
        const htfLow = data.htf_ohlc?.low || 0;
        const htfClose = data.htf_ohlc?.close || 0;
        
        // Current time & session
        const now = moment().tz('Asia/Jakarta');
        const timeStr = now.format('DD/MM/YYYY HH:mm:ss');
        const session = getMarketSession();
        const tip = getRandomTip();
        
        // Emojis berdasarkan direction
        const dirEmoji = direction === 'BULLISH' ? '🟢' : direction === 'BEARISH' ? '🔴' : '⚪';
        const arrow = direction === 'BULLISH' ? '📈' : direction === 'BEARISH' ? '📉' : '➖';
        const icon = direction === 'BULLISH' ? '🚀' : direction === 'BEARISH' ? '🎯' : '🔄';
        const cisdEmoji = cisd.includes('BULLISH') ? '🟢' : cisd.includes('BEARISH') ? '🔴' : '⚪';
        
        // HTF price change
        const change = parseFloat(data.htf_change_pct) || 0;
        const changeEmoji = change > 0 ? '📈' : change < 0 ? '📉' : '➖';
        const changeSign = change > 0 ? '+' : '';
        
        // Signal strength calculation
        const strength = calculateSignalStrength(data).strength;
        const strengthEmoji = getSignalEmoji(strength);
        
        // Volume formatting
        let volumeText = '';
        const volume = parseFloat(data.htf_volume) || 0;
        if (volume > 0) {
            if (volume > 1000000) {
                volumeText = `📊 HTF Volume: ${(volume/1000000).toFixed(1)}M\n`;
            } else if (volume > 1000) {
                volumeText = `📊 HTF Volume: ${(volume/1000).toFixed(1)}K\n`;
            } else {
                volumeText = `📊 HTF Volume: ${volume.toFixed(0)}\n`;
            }
        }
        
        // Pattern details
        let patternText = '';
        if (data.pattern_details && data.pattern_details.pattern_id > 0) {
            patternText = `🔄 Pattern ID: ${data.pattern_details.pattern_id}\n`;
            if (data.pattern_details.c1_high > 0 && data.pattern_details.c1_low > 0) {
                patternText += `📊 C1: ${data.pattern_details.c1_high} / ${data.pattern_details.c1_low}\n`;
            }
        }
        
        // Market context
        let contextText = '';
        if (data.market_context && data.market_context.current_atr > 0) {
            contextText = `📈 ATR: ${data.market_context.current_atr.toFixed(5)}\n`;
            contextText += `📊 RSI: ${data.market_context.rsi.toFixed(1)}\n`;
        }
        
        // Market analysis
        const analysis = getMarketAnalysis(direction, acrx);
        
        // BUILD MESSAGE
        let msg = '';
        msg += '🚨 AUDENFX HTF SIGNAL ALERT 🚨\n';
        msg += '\n';
        msg += `${icon} ${symbol} | ${formatTimeframe(ltfTF)} → ${formatTimeframe(htfTF)}\n`;
        msg += `${dirEmoji} ${direction} ACR SWEEP ${arrow}\n`;
        msg += `${strengthEmoji} Signal Strength: ${strength}%\n`;
        msg += '━━━━━━━━━━━━━━━━━━━━━━\n';
        msg += '\n';
        
        // Price information
        msg += `💰 LTF Price: ${ltfPrice}\n`;
        msg += `🎯 Sweep Level: ${sweep}\n`;
        if (htfClose > 0) {
            msg += `📊 HTF Close: ${htfClose.toFixed(5)}\n`;
        }
        msg += `${changeEmoji} HTF Change: ${changeSign}${Math.abs(change).toFixed(2)}%\n`;
        
        // Add volume if available
        if (volumeText) {
            msg += volumeText;
        }
        
        msg += '\n';
        
        // CISD information
        msg += `${cisdEmoji} CISD Status: ${cisd}\n`;
        if (cisdDir !== 'NONE' && cisdDir !== '') {
            msg += `🎯 CISD Direction: ${cisdDir}\n`;
        }
        
        // ACRX signals
        if (acrx && acrx !== '') {
            msg += `⚡ ACR+ Signals: ${acrx}\n`;
        }
        
        msg += '\n';
        
        // Pattern details if available
        if (patternText) {
            msg += patternText;
        }
        
        // Market context if available
        if (contextText) {
            msg += contextText;
        }
        
        msg += `📊 Analysis: ${analysis}\n`;
        msg += '\n';
        msg += `${session}\n`;
        msg += `🕐 Alert Time: ${timeStr} WIB\n`;
        msg += '\n';
        msg += '💡 Kata-Kata Hari Ini King:\n';
        msg += `"${tip}"\n`;
        msg += '\n';
        msg += '━━━━━━━━━━━━━━━━━━━━━━\n';
        msg += '⚠️ Risk Management is Key\n';
        msg += '📊 Always DYOR • NFA\n';
        msg += `#AudenFX #${symbol} #${direction}ACR`;
        
        console.log('✅ Message formatted successfully');
        return msg;
        
    } catch (error) {
        console.error('Format error:', error);
        const now = moment().tz('Asia/Jakarta');
        return `🚨 AUDENFX HTF ALERT\n\nFormatting Error Occurred\nData received but processing failed\n\n⏰ ${now.format('DD/MM/YYYY HH:mm:ss')} WIB\n${getMarketSession()}\n\n⚠️ Always DYOR`;
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
        // Test bot token
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
    
    // Ensure proper newlines
    cleanMessage = cleanMessage.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Clean excessive whitespace
    cleanMessage = cleanMessage.replace(/[ \t]+/g, ' ');
    cleanMessage = cleanMessage.replace(/\n{3,}/g, '\n\n');
    cleanMessage = cleanMessage.trim();
    
    // Length check
    if (cleanMessage.length > 4000) {
        cleanMessage = cleanMessage.substring(0, 4000) + '...\n\n⚠️ Message truncated';
    }

    for (let i = 0; i < retries; i++) {
        try {
            console.log(`📤 Sending message to Telegram (attempt ${i + 1}/${retries})`);
            console.log(`📏 Message: ${cleanMessage.length} chars, ${cleanMessage.split('\n').length} lines`);
            
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
        version: '2.2 - Smart JSON Parser + Fixed Formatting',
        bot_status: validation.valid ? '✅ Ready' : '❌ Configuration Error',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
        features: [
            '🎯 HTF-based ACR Detection',
            '⚡ Smart JSON Parser (handles malformed data)',
            '📊 CISD Confirmation Analysis', 
            '🔥 Signal Strength Calculation',
            '📈 Market Context Integration',
            '🛡️ Parse-Error-Free Messaging',
            '🕐 Fixed Timezone (WIB)',
            '📱 Proper Newline Formatting'
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

// MAIN WEBHOOK ENDPOINT - ENHANCED ERROR HANDLING
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

        console.log('📨 TradingView webhook received');
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Body type:', typeof req.body);
        console.log('Body length:', typeof req.body === 'string' ? req.body.length : 'N/A');
        
        // ENHANCED PARSING dengan detailed logging
        console.log('🔍 Starting data parsing...');
        const parsedData = parseAlertData(req.body);
        
        // Check hasil parsing
        if (parsedData.error && !parsedData.symbol) {
            console.log('❌ Complete parsing failure:', parsedData.error);
            
            const errorMessage = `🚨 AudenFX Alert - Parse Error\n\nUnable to process incoming data\nError: ${parsedData.error}\n\n⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')} WIB\n${getMarketSession()}\n\n⚠️ Check TradingView alert format`;
            
            const result = await sendToTelegram(errorMessage);
            
            return res.status(result.ok ? 200 : 500).json({
                success: result.ok,
                message: 'Parse error alert sent',
                error: parsedData.error,
                suggestion: 'Check TradingView alert JSON format'
            });
        }
        
        // Check jika parsing berhasil (manual atau normal)
        if (parsedData.symbol && parsedData.symbol !== 'UNKNOWN' && parsedData.symbol !== 'EXTRACT_ERROR') {
            console.log('✅ Data parsing successful');
            
            // MAP DATA
            const mappedData = mapAlertData(parsedData);
            
            console.log('📊 Alert data processed:', {
                symbol: mappedData.symbol,
                direction: mappedData.acr_direction,
                price: mappedData.current_price,
                parsing_method: parsedData.parsing_method || 'json'
            });

            // FORMAT MESSAGE
            const formattedMessage = formatMessage(mappedData);
            
            // SEND TO TELEGRAM
            const result = await sendToTelegram(formattedMessage);
            
            if (result.ok) {
                console.log(`✅ Alert sent: ${mappedData.symbol} ${mappedData.acr_direction} (${parsedData.parsing_method || 'json'})`);
                
                res.status(200).json({
                    success: true,
                    message: 'HTF Alert sent successfully',
                    data: {
                        symbol: mappedData.symbol,
                        direction: mappedData.acr_direction,
                        parsing_method: parsedData.parsing_method || 'json',
                        signal_strength: calculateSignalStrength(mappedData).strength,
                        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
                    }
                });
            } else {
                console.error('❌ Failed to send alert:', result.error);
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }
        } else {
            console.log('⚠️ Partial parsing, sending diagnostic message');
            
            const diagnosticMessage = `🚨 AudenFX Alert - Partial Data\n\nReceived data but extraction incomplete\nSymbol detected: ${parsedData.symbol || 'None'}\nDirection: ${parsedData.acrdirection || 'None'}\n\n⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')} WIB\n\n⚠️ Check TradingView alert configuration`;
            
            const result = await sendToTelegram(diagnosticMessage);
            
            res.status(result.ok ? 200 : 500).json({
                success: result.ok,
                message: 'Partial data alert sent',
                extracted_fields: Object.keys(parsedData).filter(key => key !== 'error' && key !== 'raw')
            });
        }

    } catch (error) {
        console.error('💥 Webhook processing error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
        });
    }
});

// Enhanced test dengan format Pine Script yang tepat
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

        // Test data sesuai Pine Script buildHTFAlertData()
        const testData = {
            symbol: 'EURUSD',
            alert_type: 'HTF_ACR_SWEEP',
            current_ltf_price: 1.08425,
            ltf_timeframe: '1',
            htf_timeframe: '240',
            htf_bar_time: Date.now(),
            acr_direction: 'BULLISH',
            sweep_level: 1.08550,
            cisd_status: 'BULLISH CISD',
            cisd_direction: 'BUY SETUP',
            acrx_signals: 'CISD / EXP',
            htf_change_pct: 0.45,
            htf_volume: 1250000,
            htf_ohlc: {
                open: 1.08400,
                high: 1.08580,
                low: 1.08390,
                close: 1.08425
            },
            ltf_ohlc: {
                open: 1.08420,
                high: 1.08430,
                low: 1.08415,
                close: 1.08425
            },
            pattern_details: {
                c1_high: 1.08500,
                c1_low: 1.08380,
                c2_high: 1.08580,
                c2_low: 1.08450,
                is_high_sweep: false,
                pattern_id: 1
            },
            market_context: {
                current_atr: 0.00085,
                rsi: 58.5,
                timestamp: Date.now()
            }
        };

        const mappedData = mapAlertData(testData);
        const testMessage = formatMessage(mappedData);
        const result = await sendToTelegram(testMessage);
        
        res.json({
            success: result.ok,
            message: result.ok ? 'Enhanced HTF test alert sent successfully!' : 'Failed to send test alert',
            error: result.ok ? null : result.error,
            test_info: {
                signal_strength: calculateSignalStrength(mappedData).strength,
                data_fields_mapped: Object.keys(mappedData).length,
                pine_script_compatible: true
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

// Test endpoint untuk debugging parsing
app.post('/test-parse', (req, res) => {
    console.log('🧪 Testing parsing with sample malformed data...');
    
    const sampleMalformedData = `"symbol":"GBPUSD","alerttype":"HTFACRSWEEP","currentltfprice":1.35264,"ltftimeframe":"1","htftimeframe":"15","htfbartime":1758670200000,"acrdirection":"BULLISH","sweeplevel":1.35243,"cisdstatus":"BULLISH CISD","cisddirection":"BUY SETUP","acrxsignals":"","htfchangepct":0,"htfvolume":81,"htfohlc":"open":1.35264,"high":1.35268,"low":1.35258,"close":1.35266`;
    
    const parsed = parseAlertData(sampleMalformedData);
    const mapped = mapAlertData(parsed);
    
    res.json({
        test_result: 'Parse test completed',
        original_data_type: typeof sampleMalformedData,
        parsing_successful: !parsed.error,
        parsing_method: parsed.parsing_method || 'json',
        extracted_fields: Object.keys(parsed),
        mapped_data: {
            symbol: mapped.symbol,
            direction: mapped.acr_direction,
            price: mapped.current_price
        }
    });
});

// Webhook GET (info)
app.get('/webhook/tradingview', (req, res) => {
    res.json({
        message: 'AudenFX HTF Alert Endpoint Ready! 🎯',
        version: '2.2 - Smart JSON Parser + Fixed Formatting',
        method: 'Use POST method to send HTF alerts from TradingView',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
        data_handling: [
            '🧠 Smart JSON Parser (handles malformed data)',
            '🔄 Auto Field Mapping (Pine Script format)',
            '🛡️ Error Recovery (fallback to plain text)',
            '📱 Fixed Formatting (proper newlines)',
            '🕐 Correct Timezone (WIB)'
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
        version: '2.2 - Smart Parser + Fixed Formatting',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AudenFX HTF Bot Server v2.2 running on port ${PORT}`);
    console.log(`🕐 Server time: ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🧠 Features: Smart JSON Parser, Fixed Formatting, Error Recovery`);
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
            console.log(`🧠 Smart parser enabled - handles malformed TradingView data!`);
        }
    }, 3000);
});