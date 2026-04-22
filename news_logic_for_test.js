const config = require('./config');

function calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.toLowerCase().split(/\W+/));
    const words2 = new Set(str2.toLowerCase().split(/\W+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}

function deduplicateNews(items) {
    const uniqueItems = [];
    const threshold = 0.4;

    items.sort((a, b) => b.pubDate - a.pubDate);

    for (const item of items) {
        let isDuplicate = false;
        for (const uniqueItem of uniqueItems) {
            if (calculateSimilarity(item.title, uniqueItem.title) > threshold) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            uniqueItems.push(item);
        }
    }
    return uniqueItems;
}

function extractCategory(title, content) {
    const text = (title + ' ' + content).toLowerCase();
    
    const categoryKeywords = {
        'conflict': [
            'war', 'conflict', 'military', 'attack', 'troops', 'battle', 'fight',
            ' invasion', 'ceasefire', 'gaza', 'ukraine', 'israel', 'iran', 'russia',
            'missile', 'drone', 'soldier', 'warfare', 'combat', 'armed'
        ],
        'tech': [
            'ai', 'artificial intelligence', 'technology', 'tech', 'software',
            'app', 'google', 'microsoft', 'apple', 'meta', 'facebook', 'amazon',
            'nvidia', 'chip', 'semiconductor', 'cyber', 'hack', 'data', 'privacy',
            'openai', 'chatgpt', 'robot', 'automation', 'digital'
        ],
        'economy': [
            'stock', 'market', 'economy', 'inflation', 'recession', 'gdp', 'finance',
            'bank', 'federal reserve', 'interest rate', 'dollar', 'euro', 'yuan',
            'trade', 'tariff', 'sanction', 'oil', 'OPEC', 'cryptocurrency', 'bitcoin',
            'investor', 'shares', 'bonds', 'commodity', 'gold', 'silver'
        ],
        'macro': [
            'climate', 'energy', 'population', 'migration', 'refugee', 'pandemic',
            'health', 'who', 'un', 'summit', 'g20', 'g7', 'election', 'vote',
            'policy', 'government', 'parliament', 'congress', 'president', 'minister',
            'global', 'world', 'international', 'development'
        ],
        'geo': [
            'china', 'usa', 'us', 'europe', 'asia', 'africa', 'middle east', 'taiwan',
            'south china sea', 'nato', 'treaty', 'diplomacy', 'embassy', 'sanction',
            'nuclear', 'treaty', 'border', 'territory', 'sovereignty', 'ally'
        ]
    };

    const scores = {};
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        scores[category] = keywords.filter(kw => text.includes(kw)).length;
    }

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'macro';

    return Object.entries(scores).find(([_, score]) => score === maxScore)[0];
}

function extractImpact(title, content, category) {
    const text = (title + ' ' + content).toLowerCase();

    const highImpactKeywords = [
        'war', 'invasion', 'attack', 'military', 'breaking', 'emergency',
        'market crash', 'recession', 'depression', 'crisis', 'disaster',
        'earthquake', 'tsunami', 'nuclear', 'pandemic', 'outbreak',
        'assassination', 'terror', 'bomb', 'explosion', 'death', 'killed',
        'sanction', 'embargo', 'default', 'bankruptcy'
    ];

    const mediumImpactKeywords = [
        'report', 'survey', 'analysis', 'forecast', 'outlook', 'warning',
        'protest', 'demonstration', 'strike', 'layoff', 'merger', 'acquisition',
        'election', 'policy change', 'regulation', 'law', 'bill', 'vote'
    ];

    const highScore = highImpactKeywords.filter(kw => text.includes(kw)).length;
    const mediumScore = mediumImpactKeywords.filter(kw => text.includes(kw)).length;

    let impact = 'Low';
    let impactNote = '一般事件';

    if (highScore > 0 || category === 'conflict') {
        impact = 'High';
        impactNote = category === 'conflict' ? '戰爭/軍事' : '市場/政策';
    } else if (mediumScore > 0 || category === 'economy') {
        impact = 'Medium';
        impactNote = '產業/企業';
    }

    return { impact, impactNote };
}

function generateSummary(content, title) {
    if (!content) return title;
    
    const sentences = content.replace(/<[^>]*>/g, '').split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ').trim();
    
    return summary.length > 200 ? summary.substring(0, 200) + '...' : summary || title;
}

function generateWhyItMatters(category, impact, title) {
    const whyMatters = {
        'conflict': ['可能影響區域安全與人道局勢', '涉及軍事行動與外交緊張', '可能導致和平進程受阻'],
        'economy': ['可能影響全球金融市場走向', '對投資人與企業有重大啟示', '關乎通貨膨脹與利率走向'],
        'tech': ['可能改變產業競爭格局', '對科技發展與就業有深遠影響', '涉及數據隱私與AI治理'],
        'macro': ['反映全球治理與合作趨勢', '影響國際政策協調方向', '關乎人類共同挑戰應對'],
        'geo': ['涉及大國關係與地緣政治', '可能重塑國際秩序', '影響多邊合作機制']
    };

    const phrases = whyMatters[category] || whyMatters['macro'];
    return impact === 'High' ? phrases[0] : (impact === 'Medium' ? phrases[1] : phrases[2]);
}

function processNews(newsItems) {
    const processed = newsItems.map((item, index) => {
        const category = extractCategory(item.title, item.content);
        const { impact, impactNote } = extractImpact(item.title, item.content, category);
        const summary = generateSummary(item.content, item.title);
        const whyItMatters = generateWhyItMatters(category, impact, item.title);

        return {
            title: item.title,
            summary: summary,
            whyItMatters: whyItMatters,
            category: config.CATEGORIES[category.toUpperCase()] || config.CATEGORIES.MACRO,
            impact: impact,
            impactNote: impactNote,
            source: item.source,
            url: item.link,
            time: item.pubDate.toISOString().replace('T', ' ').substring(0, 16),
            trends: item.trends || null
        };
    });

    const trends = extractTrends(newsItems);
    
    return { news: processed, trends: trends };
}

function extractTrends(newsItems) {
    const allText = newsItems.map(n => n.title + ' ' + n.content).join(' ').toLowerCase();
    
    const tagCounts = {
        'AI': (allText.match(/ai|artificial intelligence|chatgpt|gpt|gemini|claude|openai/gi) || []).length,
        '戰爭': (allText.match(/war|conflict|ukraine|gaza|israel|military|invasion/gi) || []).length,
        '通膨': (allText.match(/inflation|物价|price|interest rate|federal reserve/gi) || []).length,
        '晶片': (allText.match(/chip|semiconductor|nvidia|tsmc|technology/gi) || []).length,
        '氣候': (allText.match(/climate|energy|carbon|emission|renewable/gi) || []).length,
        '選舉': (allText.match(/election|vote|parliament|congress|president/gi) || []).length,
        '貿易': (allText.match(/trade|tariff|sanction|opec|oil/gi) || []).length
    };

    const topTags = Object.entries(tagCounts)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);

    const conflictCount = tagCounts['戰爭'];
    const aiCount = tagCounts['AI'];
    const economyCount = tagCounts['通膨'];

    let sentence = '本週國際大局穩中有變，';
    if (conflictCount > aiCount && conflictCount > economyCount) {
        sentence += '地緣衝突持續牽動全球神經，各方外交努力備受關注。';
    } else if (aiCount > economyCount) {
        sentence += '人工智慧議題持續發燒，相關監管與應用成為焦點。';
    } else if (economyCount > 0) {
        sentence += '通膨與利率走向牽動市場神經，央行政策備受矚目。';
    } else {
        sentence += '多元議題交織，全球局勢維持動態平衡。';
    }

    return { sentence, tags: topTags };
}

module.exports = { 
    calculateSimilarity, 
    deduplicateNews, 
    processNews,
    extractCategory,
    extractImpact,
    generateSummary,
    generateWhyItMatters,
    extractTrends
};
