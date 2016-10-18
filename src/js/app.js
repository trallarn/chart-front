var $ = require('jquery');
var ko = require('knockout');
var _ = require('underscore');

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
        templateContainer.append(toKOTemplate('rowTemplateFavorite', require('./templates/rowTemplateFavorite.html')));
        templateContainer.append(toKOTemplate('rowTemplateChange', require('./templates/rowTemplateChange.html')));
        templateContainer.append(toKOTemplate('rowTemplateDefault', require('./templates/rowTemplateDefault.html')));
        templateContainer.append(toKOTemplate('favoritesGroup', require('./templates/favoritesGroup.html')));
    };

    setupKOTemplates();

    var root = {
        chartedInstrument: ko.observable(),
        comparedInstruments: ko.observableArray()
    };

    ko.applyBindings(root);
});
