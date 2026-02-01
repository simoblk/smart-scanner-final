const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

function extractCode(text) {
    const pattern = /\b([A-Z]{3,}[0-9]+|[0-9]{2,}[A-Z]{2,}|[A-Z0-9]{5,})\b/g;
    const matches = text.toUpperCase().match(pattern);
    return matches ? matches[0] : "PROMO2026";
}

app.get('/api/search', async (req, res) => {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: "Query required" });

    try {
        const config = { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': 'https://www.jumia.ma/'
            },
            timeout: 10000
        };

        const [jumiaRes, rssRes] = await Promise.allSettled([
            axios.get(`https://www.jumia.ma/catalog/?q=${encodeURIComponent(q)}`, config),
            axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://slickdeals.net/newsearch.php?q='+q+'&rss=1')}`)
        ]);

        let price = "N/A";
        if (jumiaRes.status === 'fulfilled') {
            const html = jumiaRes.value.data;
            const p1 = html.match(/class="prc">([0-9\s,.]+)\s*(?:DH|MAD)/i);
            if (p1) price = p1[1].trim().replace(/\s/g, '');
        }

        let coupons = [];
        if (rssRes.status === 'fulfilled' && rssRes.value.data.items) {
            coupons = rssRes.value.data.items.slice(0, 4).map(item => ({
                title: item.title.substring(0, 50),
                code: extractCode(item.title + item.content),
                link: item.link
            }));
        }

        res.json({
            store: "Jumia Morocco",
            price: price, 
            coupons: coupons.length > 0 ? coupons : [{title: "Check Live Coupons", code: "SAVE20", link: `https://www.jumia.ma/catalog/?q=${q}`}]
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Port 7860 darouri l-Hugging Face
const PORT = process.env.PORT || 7860;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));