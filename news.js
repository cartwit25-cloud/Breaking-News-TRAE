const RSSParser = require('rss-parser');
const config = require('./config');
require('dotenv').config();

const { calculateSimilarity, deduplicateNews, processNews } = require('./news_logic_for_test');

const parser = new RSSParser();

async function fetchAllRSS() {
    const allItems = [];
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));

    for (const source of config.SOURCES) {
        try {
            const feed = await parser.parseURL(source.url);
            feed.items.forEach(item => {
                const pubDate = new Date(item.pubDate);
                if (pubDate >= seventyTwoHoursAgo) {
                    allItems.push({
                        title: item.title,
                        link: item.link,
                        pubDate: pubDate,
                        source: source.name,
                        content: item.contentSnippet || item.content || ''
                    });
                }
            });
        } catch (error) {
            console.error(`Error fetching ${source.name}:`, error.message);
        }
    }
    return allItems;
}

async function syncToSheet(doc, newsData) {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    
    await sheet.clear();
    await sheet.setHeaderRow(['Title', 'Summary', 'WhyItMatters', 'Category', 'Impact', 'ImpactNote', 'Source', 'Time', 'URL']);
    
    const rows = newsData.map(n => [
        n.title, n.summary, n.whyItMatters, n.category, n.impact, n.impactNote, n.source, n.time, n.url
    ]);
    
    await sheet.addRows(rows);
}

async function readFromSheet(doc) {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    return rows.map(row => ({
        title: row.Title,
        summary: row.Summary,
        whyItMatters: row.WhyItMatters,
        category: row.Category,
        impact: row.Impact,
        impactNote: row.ImpactNote,
        source: row.Source,
        time: row.Time,
        url: row.URL
    }));
}

function createDoc() {
    if (!process.env.GOOGLE_SHEET_ID) return null;
    
    const { GoogleSpreadsheet } = require('google-spreadsheet');
    const { JWT } = require('google-auth-library');
    
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    return new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
}

async function handleFullFetch(res, now, limit = 20) {
    const rawItems = await fetchAllRSS();
    const uniqueItems = deduplicateNews(rawItems);
    const topItems = uniqueItems.slice(0, limit);
    const { news: processedNews, trends } = processNews(topItems);

    const doc = createDoc();
    if (doc) {
        await syncToSheet(doc, processedNews);
    }
    
    res.json({ 
        news: processedNews, 
        lastUpdated: now, 
        lastSynced: now,
        trends: trends
    });
}

async function handleReload(res, now) {
    const doc = createDoc();
    let news = [];
    
    if (doc) {
        try {
            news = await readFromSheet(doc);
        } catch (error) {
            console.error('Error reading from sheet:', error.message);
        }
    }
    
    if (news.length === 0) {
        return await handleFullFetch(res, now);
    }
    
    res.json({ news, lastUpdated: now, lastSynced: now, trends: {} });
}

async function handleQuick(res, now) {
    return await handleFullFetch(res, now, 5);
}

async function handleNews(req, res) {
    const { type } = req.query;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    try {
        switch (type) {
            case 'reload':
                await handleReload(res, now);
                break;
            case 'full':
                await handleFullFetch(res, now);
                break;
            case 'quick':
                await handleQuick(res, now);
                break;
            default:
                await handleReload(res, now);
        }
    } catch (error) {
        console.error('Error handling news request:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { handleNews, fetchAllRSS, deduplicateNews, processNews };
