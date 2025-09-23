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
    const priceChange = parseFloat(data.htf_change_pct) || parseFloat(data.price_change_1h) || 0;
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

// Manual data extraction using regex (fallback)
function extractDataManually(rawData) {
    console.log('🔍 Manual extraction started...');
    
    const extracted = {
        parsing_method: 'manual_regex'
    };
    
    try {
        const dataString = rawData.toString();
        
        // Extract key fields using regex
        const extractField = (fieldName, defaultValue = '') => {
            const regex = new RegExp(`"${fieldName}":(\\d+\\.?\\d*|"[^"]*")`, 'i');
            const match = dataString.match(regex);
            if (match) {
                let value = match[1];
                // Remove quotes if string
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                return value;
            }
            return defaultValue;
        };
        
        // Extract semua field yang dibutuhkan
        extracted.symbol = extractField('symbol', 'UNKNOWN');
        extracted.alerttype = extractField('alerttype', 'HTFACRSWEEP');
        extracted.currentltfprice = parseFloat(extractField('currentltfprice', '0')) || 0;
        extracted.ltftimeframe = extractField('ltftimeframe', '1');
        extracted.htftimeframe = extractField('htftimeframe', '15');
        extracted.htfbartime = parseInt(extractField('htfbartime', Date.now().toString())) || Date.now();
        extracted.acrdirection = extractField('acrdirection', 'NEUTRAL');
        extracted.sweeplevel = parseFloat(extractField('sweeplevel', '0')) || 0;
        extracted.cisdstatus = extractField('cisdstatus', 'NEUTRAL');
        extracted.cisddirection = extractField('cisddirection', '');
        extracted.acrxsignals = extractField('acrxsignals', '');
        extracted.htfchangepct = parseFloat(extractField('htfchangepct', '0')) || 0;
        extracted.htfvolume = parseFloat(extractField('htfvolume', '0')) || 0;
        
        console.log('✅ Manual extraction completed:', {
            symbol: extracted.symbol,
            direction: extracted.acrdirection,
            price: extracted.currentltfprice
        });
        
        return extracted;
        
    } catch (error) {
        console.error('❌ Manual extraction failed:', error.message);
        return { 
            error: 'Manual extraction failed', 
            raw: rawData,
            symbol: 'EXTRACT_ERROR',
            acrdirection: 'UNKNOWN'
        };
    }
}
// Data Mapper - Convert dari Pine Script naming ke internal naming
function mapAlertData(parsedData) {
    // Map field names dari Pine Script ke format internal
    const mapped = {
        symbol: parsedData.symbol || parsedData.ticker || 'UNKNOWN',
        alert_type: parsedData.alerttype || parsedData.alert_type || 'HTF_ACR_SWEEP',
        current_price: parsedData.currentltfprice || parsedData.current_ltf_price || parsedData.current_price || '0.00000',
        timeframe: parsedData.ltftimeframe || parsedData.ltf_timeframe || parsedData.timeframe || '1',
        htf: parsedData.htftimeframe || parsedData.htf_timeframe || parsedData.htf || '15',
        htf_bar_time: parsedData.htfbartime || parsedData.htf_bar_time || parsedData.alert_time || Date.now(),
        acr_direction: parsedData.acrdirection || parsedData.acr_direction || 'NEUTRAL',
        sweep_level: parsedData.sweeplevel || parsedData.sweep_level || '0.00000',
        cisd_status: parsedData.cisdstatus || parsedData.cisd_status || 'NEUTRAL',
        cisd_direction: parsedData.cisddirection || parsedData.cisd_direction || '',
        acrx_signals: parsedData.acrxsignals || parsedData.acrx_signals || '',
        htf_change_pct: parsedData.htfchangepct || parsedData.htf_change_pct || parsedData.price_change_1h || 0,
        htf_volume: parsedData.htfvolume || parsedData.htf_volume || parsedData.volume || 0,
        
        // OHLC data
        htf_ohlc: parsedData.htfohlc || parsedData.htf_ohlc || {},
        ltf_ohlc: parsedData.ltfohlc || parsedData.ltf_ohlc || {},
        
        // Pattern details
        pattern_details: parsedData.patterndetails || parsedData.pattern_details || {},
        
        // Market context
        market_context: parsedData.marketcontext || parsedData.market_context || {},
        
        // Keep original data for reference
        _original: parsedData
    };
    
    console.log('📊 Data mapped successfully:', {
        symbol: mapped.symbol,
        direction: mapped.acr_direction,
        price: mapped.current_price,
        htf: mapped.htf
    });
    
    return mapped;
}

// ULTRA-CLEAN Message Formatter dengan error handling
function formatMessage(data) {
    try {
        // Extract data dengan mapping yang benar
        const symbol = (data.symbol || 'UNKNOWN').toString().replace(/[^\w]/g, '');
        const direction = data.acr_direction || 'NEUTRAL';
        const price = (data.current_price || '0.00000').toString();
        const sweep = (data.sweep_level || '0.00000').toString();
        const cisd = data.cisd_status || 'NEUTRAL';
        const acrx = data.acrx_signals || '';
        const ltfTF = data.timeframe || '1';
        const htfTF = data.htf || '15';
        
        // Current time & session (FIXED timezone)
        const now = moment().tz('Asia/Jakarta');
        const timeStr = now.format('DD/MM/YYYY HH:mm:ss');
        const session = getMarketSession();
        const tip = getRandomTip();
        
        // Emojis
        const dirEmoji = direction === 'BULLISH' ? '🟢' : direction === 'BEARISH' ? '🔴' : '⚪';
        const arrow = direction === 'BULLISH' ? '📈' : direction === 'BEARISH' ? '📉' : '➖';
        const icon = direction === 'BULLISH' ? '🚀' : direction === 'BEARISH' ? '🎯' : '🔄';
        const cisdEmoji = cisd.includes('BULLISH') ? '🟢' : cisd.includes('BEARISH') ? '🔴' : '⚪';
        
        // Price change
        const change = parseFloat(data.htf_change_pct) || 0;
        const changeEmoji = change > 0 ? '📈' : change < 0 ? '📉' : '➖';
        const changeSign = change > 0 ? '+' : '';
        
        // Signal strength
        const strength = calculateSignalStrength(data).strength;
        const strengthEmoji = getSignalEmoji(strength);
        
        // Volume formatting
        let volumeText = '';
        const volume = parseFloat(data.htf_volume) || 0;
        if (volume > 0) {
            if (volume > 1000000) {
                volumeText = `📊 Volume: ${(volume/1000000).toFixed(1)}M\n`;
            } else if (volume > 1000) {
                volumeText = `📊 Volume: ${(volume/1000).toFixed(1)}K\n`;
            } else {
                volumeText = `📊 Volume: ${volume.toFixed(0)}\n`;
            }
        }
        
        // Market analysis
        const analysis = getMarketAnalysis(direction, acrx);
        
        // BUILD MESSAGE LINE BY LINE (FIXED)
        let msg = '';
        msg += '🚨 AUDENFX SIGNAL ALERT 🚨\n';
        msg += '\n';
        msg += `${icon} ${symbol} | ${formatTimeframe(ltfTF)} → ${formatTimeframe(htfTF)}\n`;
        msg += `${dirEmoji} ${direction} ACR ${arrow}\n`;
        msg += `${strengthEmoji} Signal Strength: ${strength}%\n`;
        msg += '━━━━━━━━━━━━━━━━━━━━━━\n';
        msg += '\n';
        msg += `💰 Current Price: ${price}\n`;
        msg += `🎯 Sweep Level: ${sweep}\n`;
        msg += `${changeEmoji} HTF Change: ${changeSign}${Math.abs(change).toFixed(2)}%\n`;
        
        // Add volume if available
        if (volumeText) {
            msg += volumeText;
        }
        
        msg += '\n';
        msg += `${cisdEmoji} CISD: ${cisd}\n`;
        
        if (acrx && acrx !== '') {
            msg += `⚡ ACR+: ${acrx}\n`;
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
        return `🚨 AUDENFX ALERT\n\nFormatting Error Occurred\nData received but processing failed\n\n⏰ ${now.format('DD/MM/YYYY HH:mm:ss')} WIB\n${getMarketSession()}\n\n⚠️ Always DYOR`;
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

// MAIN WEBHOOK ENDPOINT - FIXED untuk handle TradingView data
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
        console.log('Raw body type:', typeof req.body);
        console.log('Raw body sample:', typeof req.body === 'string' ? req.body.substring(0, 200) + '...' : req.body);
        
        // SMART PARSING - Handle semua format dari TradingView
        const parsedData = parseAlertData(req.body);
        
        // Check jika parsing error
        if (parsedData.error) {
            console.log('⚠️ Parse error, sending as plain text:', parsedData.error);
            
            const plainMessage = `🚨 AudenFX Alert\n\nData received but parsing failed\nRaw data: ${typeof req.body === 'string' ? req.body.substring(0, 500) : JSON.stringify(req.body).substring(0, 500)}\n\n⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')} WIB\n${getMarketSession()}\n\n⚠️ Always DYOR`;
            
            const result = await sendToTelegram(plainMessage);
            
            return res.status(result.ok ? 200 : 500).json({
                success: result.ok,
                message: result.ok ? 'Plain text alert sent (parse error)' : 'Failed to send alert',
                error: result.ok ? null : result.error,
                parse_error: parsedData.error
            });
        }
        
        // Check jika plain text
        if (parsedData.plain_text) {
            console.log('📝 Plain text detected, formatting simple message');
            
            const simpleMessage = `🚨 AudenFX Alert\n\n${parsedData.plain_text}\n\n⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')} WIB\n${getMarketSession()}\n\n⚠️ Always DYOR`;
            
            const result = await sendToTelegram(simpleMessage);
            
            return res.status(result.ok ? 200 : 500).json({
                success: result.ok,
                message: result.ok ? 'Plain text alert sent' : 'Failed to send alert',
                error: result.ok ? null : result.error
            });
        }

        // MAP DATA dari Pine Script format ke internal format
        const mappedData = mapAlertData(parsedData);
        
        console.log('✅ Data parsed and mapped successfully:', {
            symbol: mappedData.symbol,
            direction: mappedData.acr_direction,
            price: mappedData.current_price,
            type: mappedData.alert_type
        });

        // FORMAT MESSAGE
        const formattedMessage = formatMessage(mappedData);
        
        // SEND TO TELEGRAM
        const result = await sendToTelegram(formattedMessage);
        
        if (result.ok) {
            console.log(`✅ HTF Alert sent successfully: ${mappedData.symbol} ${mappedData.acr_direction}`);
            
            res.status(200).json({
                success: true,
                message: 'HTF Alert sent to Telegram successfully',
                data: {
                    symbol: mappedData.symbol,
                    direction: mappedData.acr_direction,
                    alert_type: mappedData.alert_type,
                    signal_strength: calculateSignalStrength(mappedData).strength,
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
        console.error('❌ Webhook processing error:', error);
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

        // Test dengan format yang sama seperti TradingView
        const testData = {
            symbol: 'EURUSD',
            alerttype: 'HTFACRSWEEP',
            currentltfprice: 1.08425,
            ltftimeframe: '1',
            htftimeframe: '240',
            htfbartime: Date.now(),
            acrdirection: 'BULLISH',
            sweeplevel: 1.08550,
            cisdstatus: 'BULLISH CISD',
            cisddirection: 'BUY SETUP',
            acrxsignals: 'CISD / EXP',
            htfchangepct: 0.45,
            htfvolume: 1250000
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
                quotes_available: tradingTips.length,
                formatting_fixed: true,
                timezone_fixed: true
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
            version: '2.2 - Smart Parser + Fixed Formatting',
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
            fixes_applied: [
                'Smart JSON Parser (handles malformed data)',
                'Field mapping (Pine Script → Internal)',
                'Fixed timezone (WIB)',
                'Proper newline formatting',
                'Error handling for all scenarios'
            ]
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