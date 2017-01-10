var $ = require('jquery');
var _ = require('underscore');
var ko = require('knockout');

ko.components.register('extremasSettings', {
    viewModel: function(params) {

        var self = this;

        if(!params.onLoad){
            throw 'expected onLoad-method';
        }

        self.extremeWildInput = ko.observable('100');
        self.extremeAgoInput = ko.observable('5 year');

        self.internalOnChange = function() {
            self.onChange({
                extremeWildInput: self.extremeWildInput(),
                extremeAgoInput: self.extremeAgoInput()
            });
        };

        self.onChangeDebounced = _.debounce(self.internalOnChange , 500);
        
        self.extremeWildInput.subscribe(self.onChangeDebounced);
        self.extremeAgoInput.subscribe(self.onChangeDebounced);

        if(params.onLoad) {
            params.onLoad(this);

            if(!self.onChange) {
                throw 'expected onChange-method to be set';
            }
        }

    },

    template: require('../templates/extremasSettings.html')
});



