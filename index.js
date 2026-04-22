const { handleNews } = require('./news');

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        return handleNews(req, res);
    }
    res.status(405).json({ error: 'Method not allowed' });
};
