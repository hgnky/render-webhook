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

function getRandomTip() {
    const randomIndex = Math.floor(Math.random() * tradingTips.length);
    return tradingTips[randomIndex];
}

module.exports = { getRandomTip };