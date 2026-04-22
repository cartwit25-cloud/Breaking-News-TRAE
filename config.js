module.exports = {
    SOURCES: [
        { name: 'Reuters', url: 'https://www.reutersagency.com/feed/', type: 'rss' },
        { name: 'AP', url: 'https://apnews.com/hub/international-news.rss', type: 'rss' },
        { name: 'AFP', url: 'https://www.afp.com/en/news-hub/rss', type: 'rss' },
        { name: 'Deutsche Welle', url: 'https://rss.dw.com/rdf/rss-en-all', type: 'rss' },
        { name: 'The Economist', url: 'https://www.economist.com/international/rss.xml', type: 'rss' },
        { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', type: 'rss' },
        { name: 'Bloomberg', url: 'https://www.bloomberg.com/politics/feeds/site.xml', type: 'rss' },
        { name: 'The Wall Street Journal', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', type: 'rss' },
        { name: 'Financial Times', url: 'https://www.ft.com/?format=rss', type: 'rss' },
        { name: 'The New York Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', type: 'rss' },
        { name: 'The Washington Post', url: 'https://feeds.washingtonpost.com/rss/world', type: 'rss' },
        { name: 'CNN', url: 'http://rss.cnn.com/rss/edition_world.rss', type: 'rss' },
        { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', type: 'rss' }
    ],
    CATEGORIES: {
        GEO: 'Geo / 國際政治',
        ECONOMY: 'Economy / 金融市場',
        CONFLICT: 'Conflict / 戰爭衝突',
        TECH: 'Tech / AI / 科技',
        MACRO: 'Macro / 全球趨勢'
    },
    IMPACT_LEVELS: {
        HIGH: 'High',
        MEDIUM: 'Medium',
        LOW: 'Low'
    }
};
