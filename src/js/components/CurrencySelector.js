var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');
var moment = require('moment');
var settings = require('../infrastructure/settings');

/**
 * Optionally set the onChange-method in the onLoad-call.
 */
ko.components.register('currencySelector', {
    viewModel: function(params) {

        var self = this;

        if(!params.onLoad){
            throw 'currency selector: expected onLoad-method';
        }

        self.currencies = ko.observableArray();
        self.selectedCurrency = ko.observable();
        self.inverted = ko.observable();

        self.url = settings.withQuoteAPIBase('/indexComponents/Currencies?callback=?');

        self.get = () => {
            return {
                selectedCurrency: self.selectedCurrency(),
                inverted: self.inverted()
            };
        };

        self.internalOnChange = function() {
            if(self.onChange) {
                self.onChange(self.get());
            }
        };

        self.onChangeDebounced = _.debounce(self.internalOnChange , 500);

        $.getJSON(self.url)
            .then((data) => {
                self.currencies(data);
                self.selectedCurrency.subscribe(self.onChangeDebounced);
                self.inverted.subscribe(self.onChangeDebounced);
            })
            .fail(e => console.error(e));

        params.onLoad(this);

    },

    template: require('../templates/currencySelector.html')
});




