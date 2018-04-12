var stateRW = require('../infrastructure/StateRW');

var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

function TaSettings(params) {
    var self = this;

    if(!params.onLoad){
        throw 'expected onLoad-method';
    }

    self.movingAverages = ko.observable('200,50');

    self.internalOnChange = function() {
        if(self.onChange) {
            self.onChange(self.get());
        }
    };

    self.onChangeDebounced = _.debounce(self.internalOnChange , 500);

    self.get = function() {
        return {
            mas: self.movingAverages().split(',')
        };
    };

    self.maEnabled = ko.observable(false);
    self.maEnabled.subscribe(self.internalOnChange);
    self.movingAverages.subscribe(self.onChangeDebounced);

    if(params.onLoad) {
        params.onLoad(this);
    }
}

ko.components.register('taSettings', {
    viewModel: TaSettings,
    template: require('../templates/taSettings.html')
});

