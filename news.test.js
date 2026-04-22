const { 
    calculateSimilarity, 
    deduplicateNews, 
    extractCategory,
    extractImpact,
    generateSummary,
    generateWhyItMatters,
    processNews,
    extractTrends
} = require('../api/news_logic_for_test');

describe('Deduplication Logic', () => {
    test('calculateSimilarity should return 1 for identical strings', () => {
        const similarity = calculateSimilarity('hello world', 'hello world');
        expect(similarity).toBe(1);
    });

    test('calculateSimilarity should return 0 for completely different strings', () => {
        const similarity = calculateSimilarity('hello', 'goodbye');
        expect(similarity).toBe(0);
    });

    test('calculateSimilarity should detect partial similarity', () => {
        const similarity = calculateSimilarity(
            'Middle East conflict intensifies as tensions rise',
            'Conflict in Middle East intensifies as tensions increase'
        );
        expect(similarity).toBeGreaterThan(0.3);
    });

    test('deduplicateNews should remove similar items', () => {
        const items = [
            { title: 'Breaking: New AI model released', pubDate: new Date('2026-04-21T10:00:00') },
            { title: 'Breaking! New AI model has been released', pubDate: new Date('2026-04-21T10:01:00') },
            { title: 'Stock market hits record high', pubDate: new Date('2026-04-21T09:00:00') }
        ];
        const result = deduplicateNews(items);
        expect(result.length).toBe(2);
    });

    test('deduplicateNews should keep newest items first', () => {
        const items = [
            { title: 'Old news about economy', pubDate: new Date('2026-04-20T10:00:00') },
            { title: 'Economy news today', pubDate: new Date('2026-04-21T10:00:00') }
        ];
        const result = deduplicateNews(items);
        expect(result[0].title).toBe('Economy news today');
    });
});

describe('Category Extraction', () => {
    test('should identify conflict news', () => {
        const category = extractCategory('War in Ukraine continues', 'Military troops deployed');
        expect(category).toBe('conflict');
    });

    test('should identify tech news', () => {
        const category = extractCategory('AI company releases new model', 'ChatGPT competitor launched');
        expect(category).toBe('tech');
    });

    test('should identify economy news', () => {
        const category = extractCategory('Stock market falls', 'Federal Reserve raises interest rates');
        expect(category).toBe('economy');
    });

    test('should identify geo news', () => {
        const category = extractCategory('China and Taiwan tensions', 'NATO summit discusses Asia');
        expect(category).toBe('geo');
    });

    test('should default to macro for unclear content', () => {
        const category = extractCategory('Global summit held', 'International leaders meet');
        expect(['macro', 'geo']).toContain(category);
    });
});

describe('Impact Analysis', () => {
    test('should identify high impact for war news', () => {
        const { impact, impactNote } = extractImpact('War breaks out', 'Invasion started', 'conflict');
        expect(impact).toBe('High');
        expect(impactNote).toBe('戰爭/軍事');
    });

    test('should identify medium impact for economy news', () => {
        const { impact, impactNote } = extractImpact('Market report shows growth', 'Analysis of trends', 'economy');
        expect(impact).toBe('Medium');
        expect(impactNote).toBe('產業/企業');
    });

    test('should identify low impact for general news', () => {
        const { impact, impactNote } = extractImpact('Local event held', 'Community gathering', 'macro');
        expect(impact).toBe('Low');
        expect(impactNote).toBe('一般事件');
    });
});

describe('Summary Generation', () => {
    test('should extract sentences from content', () => {
        const summary = generateSummary(
            'This is a longer piece of text that contains multiple sentences. Each sentence should be properly extracted. The summary should be concise.',
            'Test Title'
        );
        expect(summary.length).toBeGreaterThan(20);
        expect(summary.length).toBeLessThan(250);
    });

    test('should use title as fallback for empty content', () => {
        const summary = generateSummary('', 'Fallback Title');
        expect(summary).toBe('Fallback Title');
    });
});

describe('Why It Matters', () => {
    test('should return appropriate phrase for conflict', () => {
        const why = generateWhyItMatters('conflict', 'High', 'War starts');
        expect(why).toContain('區域安全');
    });

    test('should return appropriate phrase for economy', () => {
        const why = generateWhyItMatters('economy', 'Medium', 'Market drops');
        expect(why).toContain('市場');
    });
});

describe('Process News', () => {
    test('should process a list of news items', () => {
        const items = [
            {
                title: 'War in Ukraine',
                link: 'http://example.com/1',
                pubDate: new Date('2026-04-21T10:00:00'),
                source: 'Reuters',
                content: 'Military conflict continues'
            },
            {
                title: 'AI company launches new product',
                link: 'http://example.com/2',
                pubDate: new Date('2026-04-21T09:00:00'),
                source: 'BBC',
                content: 'New artificial intelligence technology'
            }
        ];

        const result = processNews(items);
        
        expect(result.news.length).toBe(2);
        expect(result.trends).toHaveProperty('sentence');
        expect(result.trends).toHaveProperty('tags');
    });
});

describe('Trends Extraction', () => {
    test('should extract trending tags', () => {
        const items = [
            { title: 'AI news', content: 'ChatGPT and artificial intelligence' },
            { title: 'War news', content: 'Ukraine conflict military' },
            { title: 'Economy news', content: 'Inflation interest rates' }
        ];
        
        const trends = extractTrends(items);
        
        expect(trends.tags).toContain('AI');
        expect(trends.tags).toContain('戰爭');
        expect(trends.sentence).toBeTruthy();
    });
});
