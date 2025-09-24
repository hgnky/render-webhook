const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');

// Keep-alive configuration
const KEEP_ALIVE_CONFIG = {
    self_ping_interval: 25 * 60 * 1000, // 25 menit
    health_check_interval: 5 * 60 * 1000, // 5 menit
    telegram_test_interval: 30 * 60 * 1000, // 30 menit
    max_retries: 5,
    request_timeout: 30000
};

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Environment Variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Global state tracking
let serverStats = {
    startTime: Date.now(),
    alertsReceived: 0,
    alertsSent: 0,
    errors: 0,
    lastAlert: null,
    lastPing: null,
    isHealthy: true,
    c2ValidSweeps: 0,
    highQualitySignals: 0
};

// Enhanced middleware with keep-alive headers
app.use((req, res, next) => {
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=65, max=10000');
    res.setHeader('X-Powered-By', 'AudenFX-Bot-v3.2-C2-Scoring');
    
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Enhanced body parser with larger limits
app.use(express.json({ 
    limit: '50mb',
    strict: false,
    type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '50mb',
    parameterLimit: 50000
}));
app.use(express.text({ 
    type: ['text/plain', 'application/json'], 
    limit: '50mb' 
}));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = moment().tz('Asia/Jakarta').format('HH:mm:ss');
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
    next();
});

// Trading Tips Array (Enhanced with C2 and CISD focus)
const tradingTips = [
    "C2 Valid Sweep + CISD = Golden combination untuk high probability setup 🏆",
    "Expansion candle after CISD confirms momentum - jangan skip ini! ⚡",
    "HTF C2 sweep tanpa CISD = incomplete setup, tunggu konfirmasi dulu 🛑",
    "CISD di LTF adalah kunci - ini yang membedakan noise dari signal 🔑",
    "Valid sweep + CISD + Expansion = Triple confirmation untuk entry 🎯",
    "C2 level adalah psychological level dimana smart money beroperasi 🧠",
    "Expansion setelah CISD menunjukkan institutional interest yang kuat 🏦",
    "Tanpa CISD, bahkan C2 sweep terbaik bisa jadi false signal ❌",
    "Risk management tetap prioritas, meski signal quality tinggi 🛡️",
    "HTF bias + C2 sweep + CISD = Formula profitable trading 💎",
    "Expansion volume confirms the breakout - volume never lies 📊",
    "C2 sweep yang gagal sering karena tidak ada CISD follow through 💔",
    "Patience untuk menunggu CISD + Expansion = Profit consistency 🧘‍♂️",
    "Market structure + C2 + CISD = Holy trinity of trading setups 🙏",
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
    "Expansion candle size matters - bigger expansion = stronger signal 📏"
];

// Market Analysis Messages (Updated for C2/CISD focus)
const marketAnalysis = {
    c2_cisd_bullish: [
        "🏆 Perfect C2 bullish sweep with CISD confirmation",
        "💎 High-quality bullish setup - C2 + CISD aligned",
        "🚀 Institutional bullish interest confirmed via C2/CISD",
        "⚡ Premium bullish signal - all conditions met"
    ],
    c2_cisd_bearish: [
        "🎯 Perfect C2 bearish sweep with CISD confirmation", 
        "💎 High-quality bearish setup - C2 + CISD aligned",
        "🐻 Institutional bearish interest confirmed via C2/CISD",
        "⚡ Premium bearish signal - all conditions met"
    ],
    c2_only: [
        "⚠️ C2 sweep detected - waiting for CISD confirmation",
        "🔍 Valid sweep but incomplete - need CISD follow through",
        "📊 C2 level touched - monitor for CISD development"
    ],
    cisd_only: [
        "🔵 CISD detected but no C2 sweep - partial setup",
        "📈 Good momentum but missing key sweep level",
        "⚡ CISD energy present - watch for sweep completion"
    ],
    incomplete: [
        "📊 Incomplete setup - missing key components",
        "🤔 Partial signal - wait for full confirmation", 
        "⏳ Setup in development - patience required"
    ]
};

// ============= NEW C2-FOCUSED SCORING SYSTEM =============

/**
 * New scoring system based on C2 Valid Sweep priority:
 * 1. C2 Valid Sweep (40 points) - PRIMARY FACTOR
 * 2. CISD in LTF (30 points) - MANDATORY CONFIRMATION  
 * 3. Expansion after CISD (20 points) - MOMENTUM CONFIRMATION
 * 4. Other factors (10 points total) - CONFIDENCE BOOSTERS
 */
function calculateC2SignalStrength(data) {
    let strength = 0;
    let factors = [];
    let quality = 'LOW';
    
    try {
        console.log('🎯 Starting C2-focused scoring calculation...');
        
        // === PRIMARY FACTOR: C2 Valid Sweep (40 points) ===
        const hasValidSweep = checkC2ValidSweep(data);
        if (hasValidSweep.isValid) {
            strength += 40;
            factors.push(`C2 Valid Sweep (${hasValidSweep.sweepType})`);
            console.log('✅ C2 Valid Sweep confirmed: +40 points');
            serverStats.c2ValidSweeps++;
        } else {
            console.log('❌ No C2 Valid Sweep detected');
        }
        
        // === MANDATORY CONFIRMATION: CISD in LTF (30 points) ===
        const hasCISD = checkCISDConfirmation(data);
        if (hasCISD.isConfirmed) {
            strength += 30;
            factors.push(`LTF CISD (${hasCISD.direction})`);
            console.log('✅ CISD confirmed in LTF: +30 points');
        } else {
            console.log('❌ No CISD confirmation in LTF');
        }
        
        // === MOMENTUM CONFIRMATION: Expansion after CISD (20 points) ===
        const hasExpansion = checkExpansionCandle(data);
        if (hasExpansion.isPresent) {
            strength += 20;
            factors.push(`Expansion Candle (${hasExpansion.strength})`);
            console.log('✅ Expansion candle detected: +20 points');
        } else {
            console.log('❌ No expansion candle after CISD');
        }
        
        // === CONFIDENCE BOOSTERS (10 points total) ===
        const confidenceBoosts = calculateConfidenceBoosts(data);
        strength += confidenceBoosts.points;
        factors.push(...confidenceBoosts.factors);
        
        // === QUALITY ASSESSMENT ===
        if (hasValidSweep.isValid && hasCISD.isConfirmed && hasExpansion.isPresent) {
            quality = 'PREMIUM'; // All 3 main factors present
            serverStats.highQualitySignals++;
            console.log('🏆 PREMIUM quality signal detected!');
        } else if (hasValidSweep.isValid && hasCISD.isConfirmed) {
            quality = 'HIGH'; // C2 + CISD present
            console.log('💎 HIGH quality signal detected');
        } else if (hasValidSweep.isValid || hasCISD.isConfirmed) {
            quality = 'MEDIUM'; // At least one main factor
            console.log('📊 MEDIUM quality signal detected');
        } else {
            quality = 'LOW'; // Missing main factors
            console.log('⚠️ LOW quality signal - missing key factors');
        }
        
        console.log(`📈 Final C2 Score: ${strength}/100 (${quality} quality)`);
        
        return {
            strength: Math.min(strength, 100),
            quality: quality,
            factors: factors,
            breakdown: {
                c2_sweep: hasValidSweep.isValid ? 40 : 0,
                cisd_ltf: hasCISD.isConfirmed ? 30 : 0,
                expansion: hasExpansion.isPresent ? 20 : 0,
                confidence: confidenceBoosts.points
            },
            requirements_met: {
                c2_valid_sweep: hasValidSweep.isValid,
                cisd_confirmation: hasCISD.isConfirmed,
                expansion_candle: hasExpansion.isPresent
            }
        };
        
    } catch (error) {
        console.error('❌ C2 scoring calculation error:', error);
        return { 
            strength: 0, 
            quality: 'ERROR',
            factors: ['Calculation Error'],
            breakdown: { c2_sweep: 0, cisd_ltf: 0, expansion: 0, confidence: 0 },
            requirements_met: { c2_valid_sweep: false, cisd_confirmation: false, expansion_candle: false }
        };
    }
}

// Check for C2 Valid Sweep
function checkC2ValidSweep(data) {
    try {
        // Check if this is specifically a C2 level sweep
        const alertType = (data.alert_type || '').toString().toLowerCase();
        const sweepLevel = parseFloat(data.sweep_level) || 0;
        const currentPrice = parseFloat(data.current_ltf_price) || 0;
        const acrDirection = (data.acr_direction || '').toString().toUpperCase();
        
        // Look for C2 indicators in the data
        const isC2Alert = alertType.includes('c2') || 
                         alertType.includes('htf_acr_sweep') ||
                         (data.sweep_type && data.sweep_type.includes('C2'));
        
        // Validate sweep distance (C2 should have meaningful distance)
        const sweepDistance = Math.abs(sweepLevel - currentPrice);
        const isValidDistance = sweepDistance > 0 && sweepDistance < (currentPrice * 0.01); // Within 1%
        
        // Check for proper direction alignment
        const hasDirectionAlignment = acrDirection === 'BULLISH' || acrDirection === 'BEARISH';
        
        // Additional validation from custom fields
        const c2Validation = data.c2_valid || data.is_c2_sweep || false;
        
        const isValid = (isC2Alert || c2Validation) && 
                       isValidDistance && 
                       hasDirectionAlignment && 
                       sweepLevel > 0;
        
        console.log(`🎯 C2 Sweep Check: ${isValid ? 'VALID' : 'INVALID'}`, {
            isC2Alert,
            isValidDistance,
            hasDirectionAlignment,
            sweepDistance: sweepDistance.toFixed(5)
        });
        
        return {
            isValid: isValid,
            sweepType: isValid ? `${acrDirection} C2` : 'Invalid',
            sweepLevel: sweepLevel,
            distance: sweepDistance
        };
        
    } catch (error) {
        console.error('❌ C2 sweep validation error:', error);
        return { isValid: false, sweepType: 'Error', sweepLevel: 0, distance: 0 };
    }
}

// Check for CISD Confirmation in LTF
function checkCISDConfirmation(data) {
    try {
        const cisdStatus = (data.cisd_status || '').toString().toUpperCase();
        const cisdDirection = (data.cisd_direction || '').toString().toUpperCase();
        const acrDirection = (data.acr_direction || '').toString().toUpperCase();
        
        // Check if CISD is present
        const hasCISDSignal = cisdStatus.includes('CISD') && cisdStatus !== 'NEUTRAL';
        
        // Check direction alignment
        const isDirectionAligned = (
            (acrDirection === 'BULLISH' && (cisdDirection === 'BULLISH' || cisdStatus.includes('BULLISH'))) ||
            (acrDirection === 'BEARISH' && (cisdDirection === 'BEARISH' || cisdStatus.includes('BEARISH')))
        );
        
        // Check for LTF confirmation
        const ltfTimeframe = data.ltf_timeframe || '1';
        const isLTF = ['1', '3', '5'].includes(ltfTimeframe);
        
        const isConfirmed = hasCISDSignal && isDirectionAligned && isLTF;
        
        console.log(`🔵 CISD Check: ${isConfirmed ? 'CONFIRMED' : 'NOT CONFIRMED'}`, {
            hasCISDSignal,
            isDirectionAligned,
            isLTF,
            cisdStatus
        });
        
        return {
            isConfirmed: isConfirmed,
            direction: isConfirmed ? cisdDirection : 'None',
            timeframe: ltfTimeframe
        };
        
    } catch (error) {
        console.error('❌ CISD confirmation error:', error);
        return { isConfirmed: false, direction: 'Error', timeframe: '0' };
    }
}

// Check for Expansion Candle after CISD
function checkExpansionCandle(data) {
    try {
        const acrxSignals = (data.acrx_signals || '').toString().toUpperCase();
        const hasExpansionSignal = acrxSignals.includes('EXP') || acrxSignals.includes('EXPANSION');
        
        // Check HTF change as expansion indicator
        const htfChange = Math.abs(parseFloat(data.htf_change_pct) || 0);
        const hasSignificantMove = htfChange > 0.2; // More than 0.2% change
        
        // Check volume confirmation if available
        const volume = parseFloat(data.htf_volume) || 0;
        const hasVolumeExpansion = volume > 0; // Basic volume presence check
        
        // Expansion strength calculation
        let expansionStrength = 'WEAK';
        if (hasExpansionSignal && hasSignificantMove && hasVolumeExpansion) {
            expansionStrength = 'STRONG';
        } else if (hasExpansionSignal && (hasSignificantMove || hasVolumeExpansion)) {
            expansionStrength = 'MEDIUM';
        } else if (hasExpansionSignal) {
            expansionStrength = 'WEAK';
        }
        
        const isPresent = hasExpansionSignal || hasSignificantMove;
        
        console.log(`⚡ Expansion Check: ${isPresent ? 'PRESENT' : 'ABSENT'}`, {
            hasExpansionSignal,
            hasSignificantMove,
            expansionStrength,
            htfChange: htfChange.toFixed(2) + '%'
        });
        
        return {
            isPresent: isPresent,
            strength: expansionStrength,
            changePercent: htfChange
        };
        
    } catch (error) {
        console.error('❌ Expansion check error:', error);
        return { isPresent: false, strength: 'Error', changePercent: 0 };
    }
}

// Calculate confidence boosters (max 10 points)
function calculateConfidenceBoosts(data) {
    let points = 0;
    let factors = [];
    
    try {
        // HTF momentum alignment (3 points)
        const htfChange = parseFloat(data.htf_change_pct) || 0;
        const acrDirection = (data.acr_direction || '').toString().toUpperCase();
        
        if ((acrDirection === 'BULLISH' && htfChange > 0.1) || 
            (acrDirection === 'BEARISH' && htfChange < -0.1)) {
            points += 3;
            factors.push('HTF Momentum Aligned');
        }
        
        // Market session bonus (2 points)
        const session = getMarketSession();
        if (session.includes('European') || session.includes('US')) {
            points += 2;
            factors.push('Active Session');
        }
        
        // Volume confirmation (3 points)
        const volume = parseFloat(data.htf_volume) || 0;
        if (volume > 0) {
            points += 3;
            factors.push('Volume Present');
        }
        
        // Multiple timeframe confirmation (2 points)
        const htfTF = data.htf_timeframe || '15';
        if (['240', '1D', '1W'].includes(htfTF)) {
            points += 2;
            factors.push('HTF Confirmation');
        }
        
        console.log(`💪 Confidence boosts: +${points} points`);
        
        return {
            points: Math.min(points, 10), // Cap at 10 points
            factors: factors
        };
        
    } catch (error) {
        console.error('❌ Confidence boost calculation error:', error);
        return { points: 0, factors: [] };
    }
}

// Get appropriate market analysis based on C2 scoring
function getC2MarketAnalysis(scoringResult, direction) {
    try {
        const { requirements_met, quality } = scoringResult;
        
        if (requirements_met.c2_valid_sweep && requirements_met.cisd_confirmation) {
            // Perfect setup
            if (direction === 'BULLISH') {
                return marketAnalysis.c2_cisd_bullish[Math.floor(Math.random() * marketAnalysis.c2_cisd_bullish.length)];
            } else {
                return marketAnalysis.c2_cisd_bearish[Math.floor(Math.random() * marketAnalysis.c2_cisd_bearish.length)];
            }
        } else if (requirements_met.c2_valid_sweep) {
            // C2 only
            return marketAnalysis.c2_only[Math.floor(Math.random() * marketAnalysis.c2_only.length)];
        } else if (requirements_met.cisd_confirmation) {
            // CISD only  
            return marketAnalysis.cisd_only[Math.floor(Math.random() * marketAnalysis.cisd_only.length)];
        } else {
            // Incomplete setup
            return marketAnalysis.incomplete[Math.floor(Math.random() * marketAnalysis.incomplete.length)];
        }
    } catch (error) {
        console.error('❌ Market analysis selection error:', error);
        return "📊 Analyzing market conditions...";
    }
}

// Enhanced signal emoji based on C2 scoring
function getC2SignalEmoji(quality, strength) {
    if (quality === 'PREMIUM') return '🏆'; // Premium quality
    if (quality === 'HIGH') return '💎';     // High quality
    if (quality === 'MEDIUM') return '⚡';   // Medium quality
    if (strength >= 40) return '💫';        // Above average
    return '⭐';                             // Basic
}

// ============= UTILITY FUNCTIONS =============
function getRandomTip() {
    return tradingTips[Math.floor(Math.random() * tradingTips.length)];
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

function getUptimeString() {
    const uptime = Date.now() - serverStats.startTime;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

// ============= KEEP-ALIVE FUNCTIONS =============
async function selfPing() {
    try {
        console.log('🏓 Self ping initiated...');
        const response = await axios.get(`${BASE_URL}/ping`, {
            timeout: 10000,
            headers: {
                'User-Agent': 'AudenFX-KeepAlive-Bot/3.2',
                'Cache-Control': 'no-cache'
            }
        });
        
        serverStats.lastPing = new Date();
        console.log('✅ Self ping successful');
        return true;
    } catch (error) {
        console.error('❌ Self ping failed:', error.message);
        return false;
    }
}

async function performHealthCheck() {
    try {
        console.log('🔍 Health check started...');
        
        const validation = await validateBotCredentials();
        if (!validation.valid) {
            serverStats.isHealthy = false;
            console.error('❌ Bot credentials invalid');
            return false;
        }
        
        const pingSuccess = await selfPing();
        if (!pingSuccess) {
            serverStats.isHealthy = false;
            return false;
        }
        
        serverStats.isHealthy = true;
        console.log('✅ Health check passed');
        return true;
        
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        serverStats.isHealthy = false;
        return false;
    }
}

async function testTelegramConnection() {
    try {
        console.log('📱 Testing Telegram connection...');
        
        const testMessage = `🔄 AudenFX C2 Bot Keep-Alive Test\n\n` +
                          `⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')} WIB\n` +
                          `📊 Alerts Sent: ${serverStats.alertsSent}\n` +
                          `🎯 C2 Valid Sweeps: ${serverStats.c2ValidSweeps}\n` +
                          `🏆 Premium Signals: ${serverStats.highQualitySignals}\n` +
                          `⚡ Uptime: ${getUptimeString()}\n` +
                          `🟢 Status: C2 System Active`;
        
        const result = await sendToTelegram(testMessage, 1);
        
        if (result.ok) {
            console.log('✅ Telegram test successful');
            return true;
        } else {
            console.error('❌ Telegram test failed:', result.error);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Telegram test error:', error.message);
        return false;
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
        
        // C2 specific fields
        extracted.c2_valid = extractField('c2_valid', false);
        extracted.is_c2_sweep = extractField('is_c2_sweep', false);
        extracted.sweep_type = extractField('sweep_type', '');
        
        console.log('✅ Manual extraction completed:', {
            symbol: extracted.symbol,
            direction: extracted.acr_direction,
            price: extracted.current_ltf_price,
            c2_indicators: {
                c2_valid: extracted.c2_valid,
                is_c2_sweep: extracted.is_c2_sweep,
                sweep_type: extracted.sweep_type
            }
        });
        
        return extracted;
        
    } catch (error) {
        console.error('❌ Manual extraction failed:', error.message);
        serverStats.errors++;
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
        
        if (typeof rawData === 'object' && rawData !== null) {
            console.log('✅ Data already parsed as object');
            return rawData;
        }
        
        if (typeof rawData === 'string') {
            let cleanData = rawData.trim();
            
            if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
                try {
                    const parsed = JSON.parse(cleanData);
                    console.log('✅ Valid JSON parsed successfully');
                    return parsed;
                } catch (e) {
                    console.log('❌ JSON parse failed:', e.message);
                }
            }
            
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
        serverStats.errors++;
        return extractDataManually(rawData);
    }
}

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
            
            // C2 specific mappings
            c2_valid: parsedData.c2_valid || false,
            is_c2_sweep: parsedData.is_c2_sweep || false,
            sweep_type: parsedData.sweep_type || '',
            
            _original: parsedData
        };
        
        console.log('📊 Data mapped successfully:', {
            symbol: mapped.symbol,
            direction: mapped.acr_direction,
            price: mapped.current_ltf_price,
            c2_data: {
                c2_valid: mapped.c2_valid,
                is_c2_sweep: mapped.is_c2_sweep,
                sweep_type: mapped.sweep_type
            }
        });
        
        return mapped;
    } catch (error) {
        console.error('❌ Data mapping error:', error);
        serverStats.errors++;
        return {
            symbol: 'MAP_ERROR',
            acr_direction: 'NEUTRAL',
            current_ltf_price: 0,
            error: error.message
        };
    }
}

// ============= ENHANCED MESSAGE FORMATTING =============
function formatMessage(data) {
    try {
        const symbol = (data.symbol || 'UNKNOWN').toString().replace(/[^\w]/g, '').toUpperCase();
        const direction = (data.acr_direction || 'NEUTRAL').toString().toUpperCase();
        const ltfPrice = (data.current_ltf_price || 0).toString();
        const sweep = (data.sweep_level || 0).toString();
        const cisd = (data.cisd_status || 'NEUTRAL').toString();
        const acrx = (data.acrx_signals || '').toString();
        const ltfTF = (data.ltf_timeframe || '1').toString();
        const htfTF = (data.htf_timeframe || '15').toString();
        
        const now = moment().tz('Asia/Jakarta');
        const timeStr = now.format('DD/MM/YYYY HH:mm:ss');
        const session = getMarketSession();
        const tip = getRandomTip();
        
        // === NEW C2 SCORING SYSTEM ===
        const c2Scoring = calculateC2SignalStrength(data);
        const analysis = getC2MarketAnalysis(c2Scoring, direction);
        
        // Emojis based on C2 scoring
        const dirEmoji = direction === 'BULLISH' ? '🟢' : direction === 'BEARISH' ? '🔴' : '⚪';
        const arrow = direction === 'BULLISH' ? '📈' : direction === 'BEARISH' ? '📉' : '➖';
        const icon = direction === 'BULLISH' ? '🚀' : direction === 'BEARISH' ? '🎯' : '🔄';
        const qualityEmoji = getC2SignalEmoji(c2Scoring.quality, c2Scoring.strength);
        
        // HTF change
        const change = parseFloat(data.htf_change_pct) || 0;
        const changeEmoji = change > 0 ? '📈' : change < 0 ? '📉' : '➖';
        const changeSign = change > 0 ? '+' : '';
        
        // BUILD ENHANCED C2 MESSAGE
        let msg = '';
        msg += '🚨 AUDENFX C2 SWEEP ALERT 🚨\n\n';
        msg += `${icon} ${symbol} | ${formatTimeframe(ltfTF)} → ${formatTimeframe(htfTF)}\n`;
        msg += `${dirEmoji} ${direction} C2 SWEEP ${arrow}\n`;
        msg += `${qualityEmoji} Signal Quality: ${c2Scoring.quality} (${c2Scoring.strength}%)\n`;
        msg += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
        
        // === C2 SCORING BREAKDOWN ===
        msg += '🎯 C2 SCORING BREAKDOWN:\n';
        msg += `${c2Scoring.requirements_met.c2_valid_sweep ? '✅' : '❌'} C2 Valid Sweep: ${c2Scoring.breakdown.c2_sweep}/40\n`;
        msg += `${c2Scoring.requirements_met.cisd_confirmation ? '✅' : '❌'} LTF CISD: ${c2Scoring.breakdown.cisd_ltf}/30\n`;
        msg += `${c2Scoring.requirements_met.expansion_candle ? '✅' : '❌'} Expansion: ${c2Scoring.breakdown.expansion}/20\n`;
        msg += `💪 Confidence: ${c2Scoring.breakdown.confidence}/10\n\n`;
        
        // Price info
        msg += `💰 LTF Price: ${ltfPrice}\n`;
        msg += `🎯 Sweep Level: ${sweep}\n`;
        msg += `${changeEmoji} HTF Change: ${changeSign}${Math.abs(change).toFixed(2)}%\n\n`;
        
        // CISD and signals info
        msg += `🔵 CISD Status: ${cisd}\n`;
        if (acrx && acrx !== '') {
            msg += `⚡ ACR+ Signals: ${acrx}\n`;
        }
        
        // Analysis
        msg += `\n📊 Analysis: ${analysis}\n\n`;
        
        // Quality indicators
        if (c2Scoring.quality === 'PREMIUM') {
            msg += `🏆 PREMIUM SETUP: All conditions met!\n`;
        } else if (c2Scoring.quality === 'HIGH') {
            msg += `💎 HIGH QUALITY: C2 + CISD confirmed\n`;
        } else if (c2Scoring.quality === 'MEDIUM') {
            msg += `⚡ MEDIUM SETUP: Partial confirmation\n`;
        } else {
            msg += `⚠️ INCOMPLETE: Missing key components\n`;
        }
        
        msg += `\n${session}\n`;
        msg += `🕐 ${timeStr} WIB\n\n`;
        msg += `💡 "${tip}"\n\n`;
        msg += '━━━━━━━━━━━━━━━━━━━━━━\n';
        msg += '🎯 C2 Valid Sweep + CISD = Gold Standard\n';
        msg += '⚠️ Risk Management Always First\n';
        msg += '📊 Always DYOR • NFA\n';
        msg += `#AudenFX #C2Sweep #${symbol} #${direction}`;
        
        console.log('✅ C2 message formatted successfully');
        return msg;
        
    } catch (error) {
        console.error('❌ C2 format error:', error);
        serverStats.errors++;
        const now = moment().tz('Asia/Jakarta');
        return `🚨 AUDENFX C2 ALERT\n\nFormatting Error: ${error.message}\n\n⏰ ${now.format('DD/MM/YYYY HH:mm:ss')} WIB\n${getMarketSession()}\n\n⚠️ Always DYOR`;
    }
}

// ============= BOT FUNCTIONS =============
async function validateBotCredentials() {
    if (!BOT_TOKEN || !CHAT_ID) {
        return { valid: false, error: 'Missing BOT_TOKEN or CHAT_ID' };
    }

    try {
        const botInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
        const botResponse = await axios.get(botInfoUrl, { 
            timeout: KEEP_ALIVE_CONFIG.request_timeout 
        });
        
        if (!botResponse.data.ok) {
            return { valid: false, error: 'Invalid BOT_TOKEN' };
        }

        const chatInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${CHAT_ID}`;
        const chatResponse = await axios.get(chatInfoUrl, { 
            timeout: KEEP_ALIVE_CONFIG.request_timeout 
        });
        
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

async function sendToTelegram(message, retries = KEEP_ALIVE_CONFIG.max_retries) {
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
            console.log(`📤 Sending C2 message to Telegram (attempt ${i + 1}/${retries})`);
            
            const response = await axios.post(url, {
                chat_id: CHAT_ID,
                text: cleanMessage,
                disable_web_page_preview: true
            }, {
                timeout: KEEP_ALIVE_CONFIG.request_timeout,
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'AudenFX-C2-Bot/3.2'
                }
            });
            
            console.log('✅ C2 message sent successfully');
            serverStats.alertsSent++;
            return { ok: true, data: response.data };
            
        } catch (error) {
            const errorDetails = error.response?.data || error.message;
            console.error(`❌ Telegram error (attempt ${i + 1}):`, errorDetails);
            serverStats.errors++;
            
            if (i === retries - 1) {
                return { ok: false, error: errorDetails };
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
    }
}

// ============= ROUTES =============

// Keep-alive ping endpoint
app.get('/ping', (req, res) => {
    const uptime = getUptimeString();
    res.json({
        status: 'alive',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
        uptime: uptime,
        memory: process.memoryUsage(),
        health: serverStats.isHealthy ? 'healthy' : 'unhealthy',
        c2_system: 'active'
    });
});

// Enhanced health check endpoint with C2 stats
app.get('/', async (req, res) => {
    const validation = await validateBotCredentials();
    
    res.json({
        status: '🎯 AudenFX C2 Sweep Alert Bot - Keep Alive Edition',
        version: '3.2 - C2 Focused Scoring System',
        bot_status: validation.valid ? '✅ Ready' : '❌ Configuration Error',
        uptime: getUptimeString(),
        c2_scoring_system: {
            primary_factor: 'C2 Valid Sweep (40 points)',
            mandatory_confirmation: 'LTF CISD (30 points)',
            momentum_confirmation: 'Expansion Candle (20 points)',
            confidence_boosters: 'Various factors (10 points)'
        },
        stats: {
            alerts_received: serverStats.alertsReceived,
            alerts_sent: serverStats.alertsSent,
            c2_valid_sweeps: serverStats.c2ValidSweeps,
            premium_signals: serverStats.highQualitySignals,
            success_rate: serverStats.alertsReceived > 0 ? 
                ((serverStats.c2ValidSweeps / serverStats.alertsReceived) * 100).toFixed(2) + '%' : 'N/A',
            errors: serverStats.errors,
            last_alert: serverStats.lastAlert,
            last_ping: serverStats.lastPing
        },
        keep_alive: {
            self_ping_interval: `${KEEP_ALIVE_CONFIG.self_ping_interval / 60000} minutes`,
            telegram_test_interval: `${KEEP_ALIVE_CONFIG.telegram_test_interval / 60000} minutes`,
            health_status: serverStats.isHealthy ? '🟢 Healthy' : '🔴 Unhealthy'
        },
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
        features: [
            '🎯 C2 Valid Sweep Priority Scoring',
            '🔵 CISD Mandatory Confirmation',
            '⚡ Expansion Candle Detection',
            '🏆 Premium Signal Classification',
            '🔄 Auto Keep-Alive System',
            '📊 Real-time C2 Analytics'
        ],
        quotes_available: tradingTips.length,
        validation: validation
    });
});

// Main webhook endpoint with C2 processing
app.post('/webhook/tradingview', async (req, res) => {
    const startTime = Date.now();
    
    try {
        serverStats.alertsReceived++;
        console.log(`📨 C2 Alert #${serverStats.alertsReceived} received from TradingView`);
        
        const validation = await validateBotCredentials();
        if (!validation.valid) {
            serverStats.errors++;
            return res.status(500).json({
                success: false,
                error: 'Bot configuration error',
                alert_id: serverStats.alertsReceived
            });
        }

        const parsedData = parseAlertData(req.body);
        
        if (parsedData.error && !parsedData.symbol) {
            const errorMessage = `🚨 AudenFX C2 Alert - Parse Error #${serverStats.alertsReceived}\n\nError: ${parsedData.error}\n\n⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')} WIB\n\n🔧 Auto-recovery active`;
            const result = await sendToTelegram(errorMessage);
            
            return res.status(200).json({
                success: result.ok,
                message: 'Parse error alert sent',
                alert_id: serverStats.alertsReceived,
                processing_time: `${Date.now() - startTime}ms`
            });
        }
        
        const mappedData = mapAlertData(parsedData);
        const c2Scoring = calculateC2SignalStrength(mappedData);
        const formattedMessage = formatMessage(mappedData);
        const result = await sendToTelegram(formattedMessage);
        
        if (result.ok) {
            serverStats.lastAlert = {
                symbol: mappedData.symbol,
                direction: mappedData.acr_direction,
                c2_score: c2Scoring.strength,
                quality: c2Scoring.quality,
                timestamp: new Date(),
                alert_id: serverStats.alertsReceived
            };
        }
        
        res.status(200).json({
            success: result.ok,
            message: result.ok ? 'C2 Alert sent successfully' : 'Failed to send alert',
            alert_id: serverStats.alertsReceived,
            processing_time: `${Date.now() - startTime}ms`,
            c2_scoring: {
                strength: c2Scoring.strength,
                quality: c2Scoring.quality,
                breakdown: c2Scoring.breakdown,
                requirements_met: c2Scoring.requirements_met
            },
            data: {
                symbol: mappedData.symbol,
                direction: mappedData.acr_direction,
                timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
            }
        });

    } catch (error) {
        console.error('💥 C2 webhook error:', error);
        serverStats.errors++;
        res.status(500).json({
            success: false,
            error: error.message,
            alert_id: serverStats.alertsReceived,
            processing_time: `${Date.now() - startTime}ms`
        });
    }
});

// Enhanced test endpoint with C2 testing
app.post('/test', async (req, res) => {
    try {
        const validation = await validateBotCredentials();
        if (!validation.valid) {
            return res.status(500).json({
                success: false,
                error: 'Bot configuration error'
            });
        }

        // C2 test data with all conditions met
        const testData = {
            symbol: 'EURUSD',
            alert_type: 'HTF_C2_SWEEP',
            current_ltf_price: 1.08425,
            ltf_timeframe: '1',
            htf_timeframe: '240',
            acr_direction: 'BULLISH',
            sweep_level: 1.08550,
            cisd_status: 'BULLISH CISD',
            cisd_direction: 'BULLISH',
            acrx_signals: 'CISD / EXP',
            htf_change_pct: 0.45,
            htf_volume: 1250000,
            c2_valid: true,
            is_c2_sweep: true,
            sweep_type: 'C2_BULLISH'
        };

        const mappedData = mapAlertData(testData);
        const c2Scoring = calculateC2SignalStrength(mappedData);
        let testMessage = formatMessage(mappedData);
        testMessage = `🧪 C2 TEST ALERT\n\n${testMessage}\n\n⚠️ This is a test of the C2 scoring system`;
        
        const result = await sendToTelegram(testMessage);
        
        res.json({
            success: result.ok,
            message: result.ok ? 'C2 test alert sent successfully!' : 'Failed to send test alert',
            c2_scoring_result: c2Scoring,
            uptime: getUptimeString(),
            stats: serverStats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// C2 Stats endpoint
app.get('/c2-stats', (req, res) => {
    res.json({
        c2_scoring_system: {
            version: '3.2',
            primary_factor: 'C2 Valid Sweep (40 points)',
            mandatory_confirmation: 'LTF CISD (30 points)', 
            momentum_confirmation: 'Expansion Candle (20 points)',
            confidence_boosters: 'Various factors (10 points max)'
        },
        performance_stats: {
            total_alerts: serverStats.alertsReceived,
            c2_valid_sweeps: serverStats.c2ValidSweeps,
            premium_signals: serverStats.highQualitySignals,
            c2_success_rate: serverStats.alertsReceived > 0 ? 
                ((serverStats.c2ValidSweeps / serverStats.alertsReceived) * 100).toFixed(2) + '%' : 'N/A',
            premium_rate: serverStats.alertsReceived > 0 ? 
                ((serverStats.highQualitySignals / serverStats.alertsReceived) * 100).toFixed(2) + '%' : 'N/A'
        },
        server_stats: serverStats,
        uptime: getUptimeString(),
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
    });
});

// Stats endpoint
app.get('/stats', (req, res) => {
    res.json({
        server_stats: serverStats,
        uptime: getUptimeString(),
        memory: process.memoryUsage(),
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB'),
        keep_alive_status: {
            last_ping: serverStats.lastPing,
            health_status: serverStats.isHealthy,
            config: KEEP_ALIVE_CONFIG
        },
        c2_system_performance: {
            c2_detection_rate: serverStats.alertsReceived > 0 ? 
                ((serverStats.c2ValidSweeps / serverStats.alertsReceived) * 100).toFixed(2) + '%' : 'N/A',
            premium_signal_rate: serverStats.alertsReceived > 0 ? 
                ((serverStats.highQualitySignals / serverStats.alertsReceived) * 100).toFixed(2) + '%' : 'N/A'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: {
            'GET /': 'Health check & C2 bot info',
            'GET /ping': 'Keep-alive ping',
            'GET /stats': 'Server statistics',
            'GET /c2-stats': 'C2 scoring system stats',
            'POST /webhook/tradingview': 'Main C2 webhook for alerts',
            'POST /test': 'Test C2 alert functionality'
        },
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('💥 Unhandled error:', error);
    serverStats.errors++;
    
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')
    });
});

// ============= KEEP-ALIVE INITIALIZATION =============
function startKeepAliveServices() {
    console.log('🔄 Starting C2 keep-alive services...');
    
    // Self ping interval
    setInterval(() => {
        selfPing().catch(err => {
            console.error('❌ Self ping error:', err.message);
        });
    }, KEEP_ALIVE_CONFIG.self_ping_interval);
    
    // Health check interval
    setInterval(() => {
        performHealthCheck().catch(err => {
            console.error('❌ Health check error:', err.message);
        });
    }, KEEP_ALIVE_CONFIG.health_check_interval);
    
    // Telegram test interval
    setInterval(() => {
        testTelegramConnection().catch(err => {
            console.error('❌ Telegram test error:', err.message);
        });
    }, KEEP_ALIVE_CONFIG.telegram_test_interval);
    
    console.log('✅ C2 keep-alive services started');
    console.log(`📊 Self ping: every ${KEEP_ALIVE_CONFIG.self_ping_interval / 60000} minutes`);
    console.log(`🔍 Health check: every ${KEEP_ALIVE_CONFIG.health_check_interval / 60000} minutes`);
    console.log(`📱 Telegram test: every ${KEEP_ALIVE_CONFIG.telegram_test_interval / 60000} minutes`);
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down C2 bot gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down C2 bot gracefully');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    serverStats.errors++;
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    serverStats.errors++;
});

// Start server
const server = app.listen(PORT, () => {
    console.log('🎯 AudenFX C2 HTF Bot v3.2 - C2 Focused Scoring');
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🕐 Started: ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss WIB')}`);
    console.log(`💬 C2-focused trading quotes: ${tradingTips.length}`);
    console.log(`🔗 Base URL: ${BASE_URL}`);
    console.log('🏆 Scoring Priority: C2 Valid Sweep → CISD → Expansion → Confidence');
    
    // Set server timeouts for keep-alive
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    
    // Validate bot after startup
    setTimeout(async () => {
        const validation = await validateBotCredentials();
        console.log(`🤖 Bot validation: ${validation.valid ? '✅ VALID' : '❌ INVALID'}`);
        if (validation.valid) {
            console.log(`✅ C2 Bot ready: ${validation.bot_info.first_name}`);
            
            // Send startup notification
            const startupMessage = `🎯 AudenFX C2 Bot Started!\n\n` +
                                 `⏰ ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')} WIB\n` +
                                 `🔄 Keep-Alive: Active\n` +
                                 `🏆 C2 Scoring System: Ready\n` +
                                 `📊 Priority: C2 Sweep + CISD + Expansion\n` +
                                 `🟢 Status: Online & Monitoring`;
            
            sendToTelegram(startupMessage).then(result => {
                if (result.ok) {
                    console.log('📱 C2 startup notification sent');
                }
            });
        }
    }, 3000);
    
    // Start keep-alive services after server is ready
    setTimeout(() => {
        startKeepAliveServices();
    }, 5000);
});