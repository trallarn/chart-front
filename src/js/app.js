var $ = require('jquery');
var ko = require('knockout');
var _ = require('underscore');

var InstrumentTableSpec = require('./vm/InstrumentTableSpec.js');
var FavoritesAPI = require('./api/FavoritesAPI.js');
var UserAPI = require('./api/UserAPI.js');

/**
 * Applies knockout bindings.
 */
$(document).ready(function() {

    /**
     * Adds ko templates to DOM so they can be used by ko template binding.
     */
    var setupKOTemplates = function() {
        var toKOTemplate = function(name, contents) {
            return '<script type="text/html" id="' + name + '">' + contents + '</script>';
        };

        var templateContainer = $('.ko-templates-container');
        templateContainer.append(toKOTemplate('topMenu', require('./templates/topMenu.html')));
        templateContainer.append(toKOTemplate('rowTemplateFavorite', require('./templates/rowTemplateFavorite.html')));
        templateContainer.append(toKOTemplate('rowTemplateChange', require('./templates/rowTemplateChange.html')));
        templateContainer.append(toKOTemplate('rowTemplateDefault', require('./templates/rowTemplateDefault.html')));
        templateContainer.append(toKOTemplate('rowTemplateIndex', require('./templates/rowTemplateIndex.html')));
        templateContainer.append(toKOTemplate('favoritesGroup', require('./templates/favoritesGroup.html')));
        templateContainer.append(toKOTemplate('winnerLoser', require('./templates/winnerLoser.html')));
    };

    setupKOTemplates();

    var root = {
        userAPI: new UserAPI(),
        favoritesAPI: new FavoritesAPI(),
        InstrumentTableSpec: InstrumentTableSpec,
        chartedInstrument: ko.observable(),
        comparedInstruments: ko.observableArray()
    };

    ko.applyBindings(root);
});
