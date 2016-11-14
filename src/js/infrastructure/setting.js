module.exports = {
    quoteAPIBase: 'http://localhost:3000',

    withQuoteAPIBase: function(suffix) {
        return this.quoteAPIBase + suffix;
    }
};
