function formatMessage(data) {
    const {
        symbol,
        current_price,
        timeframe,
        htf,
        acr_direction,
        sweep_level,
        cisd_status,
        acrx_signals,
        alert_time_wib,
        market_session,
        price_change_1h,
        random_tip
    } = data;

    // Direction emoji & arrows
    const isbullish = acr_direction === 'BULLISH';
    const directionEmoji = isbullish ? '🟢' : '🔴';
    const trendArrow = isbullish ? '📈' : '📉';
    const setupIcon = isbullish ? '🚀' : '🎯';
    
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
}

function formatTimeframe(tf) {
    const timeframes = {
        '1': 'M1', '3': 'M3', '5': 'M5', '15': 'M15', '30': 'M30',
        '60': 'H1', '240': 'H4', '1D': 'D1', '1W': 'W1', '1M': 'MN'
    };
    return timeframes[tf] || tf;
}

module.exports = { formatMessage };