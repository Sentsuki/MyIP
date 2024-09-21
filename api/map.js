import { get } from 'https';
import { refererCheck } from '../common/referer-check.js';

// 验证请求合法性
function isValidRequest(req) {
    const isLatitudeValid = /^-?\d+(\.\d+)?$/.test(req.query.latitude);
    const isLongitudeValid = /^-?\d+(\.\d+)?$/.test(req.query.longitude);
    const isLanguageValid = /^[a-z]{2}$/.test(req.query.language);
    const ismapTypeValid = /^(roadmap|satellite|terrain|hybrid)$/.test(req.query.mapType);

    if (!isLatitudeValid || !isLongitudeValid || !isLanguageValid || !ismapTypeValid) {
        return false;
    } else {
        return true;
    }
}

export default (req, res) => {
    // 限制只能从指定域名访问
    const referer = req.headers.referer;
    if (!refererCheck(referer)) {
        return res.status(403).json({ error: referer ? 'Access denied' : 'What are you doing?' });
    }

    // 检查请求是否合法
    if (!isValidRequest(req)) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    // 使用 req.query 获取参数
    const { latitude, longitude, language, mapType } = req.query;

    if (!latitude || !longitude || !language) {
        return res.status(400).json({ error: 'Missing latitude, longitude, or language' });
    }

    const mapSize = '800x640';
    const zoomLevel = 5;
    const markers = `${latitude},${longitude}`;
    
    const apiKeys = (process.env.GOOGLE_MAP_API_KEY || '').split(',');
    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoomLevel}&size=${mapSize}&markers=${markers}&maptype=${mapType}&key=${apiKey}&language=${language}`;

    get(url, apiRes => {
        apiRes.pipe(res);
    }).on('error', (e) => {
        res.status(500).json({ error: e.message });
    });
};
