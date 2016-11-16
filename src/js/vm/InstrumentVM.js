var _ = require('underscore');
var ko = require('knockout');

module.exports = InstrumentVM;

function InstrumentVM(instrument) {
    _.extendOwn(this, instrument);

    this.active = ko.observable();
    this.compared = ko.observable();
}

InstrumentVM.toModels = function(instruments) {
    return _.map(instruments, function(el) {
        return new InstrumentVM(el);
    });
};
