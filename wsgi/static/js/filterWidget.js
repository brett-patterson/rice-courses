/**
 * An input that grows as you type.
 * Adapted from:
 * http://stackoverflow.com/questions/931207/is-there-a-jquery-autogrow-plugin-for-text-fields
 * @constructor
 * @param {object} options - An optional options object
 */
$.fn.autoGrowInput = function(options) {
    options = $.extend({
        maxWidth: 1000,
        minWidth: 0,
        comfortZone: 70,
        changeCallback: function() {}
    }, options);

    this.filter('input:text').each(function() {
        var minWidth = options.minWidth || $(this).width(),
            val = '',
            input = $(this),
            testSubject = $('<div/>').css({
                position: 'absolute',
                top: -9999,
                left: -9999,
                width: 'auto',
                fontSize: input.css('fontSize'),
                fontFamily: input.css('fontFamily'),
                fontWeight: input.css('fontWeight'),
                letterSpacing: input.css('letterSpacing'),
                whiteSpace: 'nowrap'
            }),
            check = function() {

                if (val === (val = input.val())) {return;}

                // Enter new content into testSubject
                var escaped = val.replace(/&/g, '&amp;')
                                 .replace(/\s/g, '&nbsp;')
                                 .replace(/</g, '&lt;')
                                 .replace(/>/g, '&gt;');
                testSubject.html(escaped);

                // Calculate new width + whether to change
                var testerWidth = testSubject.width();
                var newWidth;
                if (testerWidth + options.comfortZone >= minWidth)
                    newWidth = testerWidth + options.comfortZone;
                else
                    newWidth = minWidth;

                var currentWidth = input.width();
                var validChange = (newWidth < currentWidth &&
                                       newWidth >= minWidth) ||
                                  (newWidth > minWidth &&
                                       newWidth < options.maxWidth);

                // Animate width
                if (validChange) {
                    input.width(newWidth);
                    options.changeCallback();
                }

            };

        testSubject.insertAfter(input);

        $(this).bind('keyup keydown blur update', check);
        check();
    });

    return this;

};

/**
 * Create a filter widget.
 * @constructor
 * @param {object} config - An optional config object
 */
$.fn.filterWidget = function(config) {
    var config = $.extend({
        key: ':',
        placeholder: '',
        filterKeywords: {},
        filtersChanged: function(filters) {},
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
        filter.id = this.config._filterIndex;
        this.config._filterIndex++;
        this.filters.push(filter);

        var bgColor = this.config.backgroundColor(filter.field);
        var textColor = this.config.textColor(filter.field);
        var removeColor = this.config.removeColor(filter.field);
        var removeHoverColor = this.config.removeHoverColor(filter.field);

        var filterView = $('<span/>', {
            class: 'filter-view',
            id: 'filter-view-' + filter.id,
            text: filter.name + ': ',
            css: {
                backgroundColor: bgColor,
                color: textColor
            }
        }).append($('<input/>', {
            id: 'filter-view-input-' + filter.id,
            class: 'filter-view-input',
            width: 10,
            css: {
                backgroundColor: bgColor,
                color: textColor
            }
        })).append($('<a/>', {
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
            $('#filter-view-input-' + filter.id).focus();
        });

        $('#filter-view-input-' + filter.id).focus().on('keydown', function(e) {
            if (e.keyCode == 13)
                filterInput.focus();
            else if (e.keyCode == 8 && $(e.target).val() == '') {
                filterManagerObj.removeFilter(filter);
                filterInput.focus();
            }
        }).autoGrowInput({
            comfortZone: 10,
            changeCallback: resizeInput
        }).bind('input', function(event) {
            filter.value = $(event.target).val();
            var index = filterManagerObj.filters.indexOf(filter);
            filterManagerObj.filters.splice(index, 1, filter);
            filterManagerObj.config.filtersChanged(filterManagerObj.filters);
        });

        resizeInput();

        if (this.filters.length == 1)
            filterInput.attr('placeholder', '');

        this.config.filtersChanged(this.filters);
    };

    filterManagerObj.removeFilter = function(filter) {
        var index = this.filters.indexOf(filter);
        if (index > -1)
            this.filters.splice(index, 1);
            $('#filter-view-' + filter.id).remove();

            if (this.filters.length == 0)
                filterInput.attr('placeholder',
                                 filterManagerObj.config.placeholder);

            this.config.filtersChanged(this.filters);
    };

    window.removeFilterClicked = function(id) {
        var filter = filterManagerObj.filterForId(id);
        filterManagerObj.removeFilter(filter);
    };

    filterManagerObj.onTextChange = function(event) {
        var input = $(event.target);
        var text = input.val();
        var config = filterManagerObj.config;

        var keyIndex = text.indexOf(config.key);

        if (keyIndex > -1) {
            var field = text.substring(0, keyIndex).toLowerCase();
            var value = text.substring(keyIndex + 1);
            var name = config.filterKeywords[field].cleanName;
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

    filterManagerObj.onKeyDown = function(event) {
        var filterLength = filterManagerObj.filters.length;
        if (event.keyCode == 8 && filterLength > 0 &&
            filterManagerObj.inputText().length == 0) {
            var filter = filterManagerObj.filters[filterLength - 1];
            filterManagerObj.removeFilter(filter);
        }
    };

    filterInput.bind('input', filterManagerObj.onTextChange);
    filterInput.bind('keydown', filterManagerObj.onKeyDown);

    return filterManagerObj;
};
