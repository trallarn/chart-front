var _ = require('underscore');

module.exports = {

    throwIfUndefined: function(val) {
        if(_.isUndefined(val)) {
            throw 'val is not defined ' + console.trace();
        }
    }

};
