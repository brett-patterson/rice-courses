/**
 * Create a filter widget.
 * @constructor
 * @param {object} filterKeywords - A mapping of filter keywords to their name
 * @param {object} config - An optional config object
 */
$.fn.filterWidget = function(filterKeywords, config) {
    if (filterKeywords === undefined)
        filterKeywords = {};

    var config = $.extend({
        key: ':',
        placeholder: '',
        backgroundColor: function(field) { return null },
        textColor: function(field) { return null },
        removeColor: function(field) { return null },
        removeHoverColor: function(field) { return null },
        _filterIndex: 0
    }, config);

    var filterManagerDOM = this;
    filterManagerDOM.addClass('filter-widget');

    var filterInput = $('<input/>', {
        type: 'text',
        class: 'filter-input',
        placeholder: config.placeholder
    }).appendTo(filterManagerDOM).focus(function() {
        filterManagerDOM.css('outline', 'lightblue solid 1px');
    }).focusout(function() {
        filterManagerDOM.css('outline', 'none');
    });

    function resizeInput() {
        var fullWidth = filterManagerDOM.innerWidth();

        var filterWidth = 0;
        filterManagerDOM.find('.filter-view').each(function(i, filterView) {
            view = $(filterView);
            filterWidth += view.outerWidth(true);
        });

        var inputPadding = parseInt(filterInput.css('padding-left'));
        inputPadding += parseInt(filterInput.css('padding-right'));

        filterInput.outerWidth(fullWidth - filterWidth - inputPadding);
    }

    resizeInput();

    $(window).resize(resizeInput);

    var filterManagerObj = {
        filters: [],
        config: config
    };
    $.extend(filterManagerObj.config, config);

    filterManagerObj.inputText = function() {
        return filterInput.val();
    };

    filterManagerObj.filterForId = function(id) {
        var results = $.grep(filterManagerObj.filters, function(item) {
            return item.id == id;
        });

        if (results.length > 0)
            return results[0];
        return null;
    };

    filterManagerObj.addFilter = function(filter) {
        filter.id = filterManagerObj.config._filterIndex;
        filterManagerObj.config._filterIndex++;
        this.filters.push(filter);

        var config = filterManagerObj.config;
        var bgColor = config.backgroundColor(filter.field);
        var textColor = config.textColor(filter.field);
        var removeColor = config.removeColor(filter.field);
        var removeHoverColor = config.removeHoverColor(filter.field);

        var filterView = $('<span/>', {
            class: 'filter-view',
            id: 'filter-view-' + filter.id,
            text: filter.name + ' ',
            css: {
                backgroundColor: bgColor,
                color: textColor
            }
        }).append($('<a/>', {
            href: '#',
            onclick: 'removeFilterClicked(' + filter.id + ')',
            html: '<span class="glyphicon glyphicon-remove"></span>',
            css: {
                color: removeColor
            }
        }).hover(function() {
            $(this).css('color', removeHoverColor);
        }, function() {
            $(this).css('color', removeColor);
        })).insertBefore(filterInput).click(function() {
            filterInput.focus();
        });

        resizeInput();

        if (this.filters.length == 1)
            filterInput.attr('placeholder', '');
    };

    filterManagerObj.removeFilter = function(filter) {
        var index = this.filters.indexOf(filter);
        if (index > -1)
            this.filters.splice(index, 1);
            $('#filter-view-' + filter.id).remove();

            if (this.filters.length == 0)
                filterInput.attr('placeholder',
                                 filterManagerObj.config.placeholder);
    };

    window.removeFilterClicked = function(id) {
        var filter = filterManagerObj.filterForId(id);
        filterManagerObj.removeFilter(filter);
    };

    filterManagerObj.onTextChange = function(event) {
        var input = $(event.target);
        var text = input.val();

        var keyIndex = text.indexOf(filterManagerObj.config.key);

        if (keyIndex > -1) {
            var field = text.substring(0, keyIndex).toLowerCase();
            var value = text.substring(keyIndex + 1);
            var name = filterKeywords[field];
            if (field.length > 0 && name !== undefined) {
                filterManagerObj.addFilter({
                    field: field,
                    name: name,
                    value: value
                });

                input.val('');
            }
        }
    };

    filterManagerObj.onKeyUp = function(event) {
        var filterLength = filterManagerObj.filters.length;
        if (event.keyCode == 8 && filterLength > 0 &&
            filterManagerObj.inputText().length == 0) {
            var filter = filterManagerObj.filters[filterLength - 1];
            filterManagerObj.removeFilter(filter);
        }
    };

    filterInput.bind('input', filterManagerObj.onTextChange);
    filterInput.bind('keyup', filterManagerObj.onKeyUp);

    return filterManagerObj;
};
