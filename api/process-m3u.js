const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'M3U URL is required' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch M3U playlist');
    }

    const text = await response.text();
    const lines = text.trim().split('\n');

    let origin = '';
    let referer = '';
    let userAgent = '';
    let fullTitle = '';
    let group = '';
    const groupEntries = {};

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('#EXTINF:') && trimmedLine.includes('group-title=')) {
        const groupMatch = trimmedLine.match(/group-title="([^"]+)"/);
        group = groupMatch ? groupMatch[1] : 'Unknown Group';
        fullTitle = trimmedLine.split(',', 1)[1] || 'Unknown Title';
        if (!groupEntries[group]) {
          groupEntries[group] = [];
        }
      } else if (trimmedLine.startsWith('#EXTVLCOPT:http-origin=')) {
        origin = trimmedLine.split('=', 1)[1];
      } else if (trimmedLine.startsWith('#EXTVLCOPT:http-referrer=')) {
        referer = trimmedLine.split('=', 1)[1];
      } else if (trimmedLine.startsWith('#EXTVLCOPT:http-user-agent=')) {
        userAgent = trimmedLine.split('=', 1)[1];
      } else if (trimmedLine.endsWith('.m3u8')) {
        const formattedLink = `${trimmedLine}?|Referer=${referer}&Origin=${origin}&User-Agent=${userAgent}`;
        groupEntries[group].push({ title: fullTitle, link: formattedLink });
      }
    }

    res.status(200).json(groupEntries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};