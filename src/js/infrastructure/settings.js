var _ = require('underscore');

var env = require('../../../.env');

/**
 * Loads environment variables.
 */ 
var expectedVariables = [
    'quoteAPIBase',
    'favoritesAPI'
];

var settings = {
    withQuoteAPIBase: function(suffix) {
        return this.quoteAPIBase + suffix;
    },

    withAPIBase: function(api, suffix) {
        return this[api] + suffix;
    }
};

_.extend(settings, env);

var validationErrors = [];

_.each(expectedVariables, function(expected) {
    if(!settings[expected]) {
        validationErrors.push('Missing environment variable "' + expected + '" in .env.js in project base');
    }
});

if(validationErrors.length > 0) {
    throw validationErrors.join('\n');
}



module.exports = settings;
