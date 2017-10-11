
module.exports = {
    quoteAPIBase: 'http://localhost:3000',
    realQuoteAPIBase: 'http://localhost:5000',

    withQuoteAPIBase: function(suffix) {
        return this.quoteAPIBase + suffix;
    },
    withRealQuoteAPIBase: function(suffix) {
        return this.realQuoteAPIBase + suffix;
    },

};
