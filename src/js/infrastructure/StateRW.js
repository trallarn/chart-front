var _ = require('underscore');

module.exports = new StateRW();

/**
 * Saves and loads state from local storage.
 */
function StateRW() {
    this.storage = window.localStorage;
};

_.extend(StateRW.prototype, {

    save: function(id, state) {
        this.storage.setItem(id, this._toString(state));
    },

    read: function(id) {
        var stateStr = this.storage.getItem(id);
        return stateStr ? this._toState(stateStr) : false;
    },

    _toString: function(state) {
        return JSON.stringify(state);
    },

    _toState: function(str) {
        return JSON.parse(str);
    }

});
