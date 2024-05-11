const baseUrl = window.CHART_FRONT_API_BASE_URL || 'http://localhost';
console.log(`Api base url: ${baseUrl}`)
const base = `${baseUrl}/screener/api`;
const pyBase = `${baseUrl}/screener/py-api`;

module.exports = {
    pyQuoteAPIBase: pyBase,
    quoteAPIBase: base,
    userAPI: base,
    instrumentsAPI: base,
    extremasAPI: base + '/seriesAnalysis/extremas',
    favoritesAPI: base
};

