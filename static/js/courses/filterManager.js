define(["exports", "module"], function (exports, module) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var FilterManager = (function () {
        function FilterManager() {
            _classCallCheck(this, FilterManager);

            this.filters = [];
        }

        _createClass(FilterManager, {
            addFilter: {

                /**
                 * Add a filter.
                 * @param {function} filter - The filter to be added
                 * @param {any} value - The value that `filter` should filter for
                 */

                value: function addFilter(filter, value) {
                    filter.setValue(value);
                    this.filters.push(filter);
                }
            },
            removeFilter: {

                /**
                 * Remove a filter.
                 * @param {function} filter - The filter to be removed
                 */

                value: function removeFilter(filter) {
                    var index = this.filters.indexOf(filter);

                    if (index > -1) {
                        this.filters.splice(index, 1);
                    }
                }
            },
            getFilters: {

                /**
                 * Get all filters.
                 * @return {array} An array of filters
                 */

                value: function getFilters() {
                    return this.filters;
                }
            },
            filter: {

                /**
                 * Filter a list of objects.
                 * @param {array} objects - An array of objects to be filtered
                 * @return {array} All objects in `objects` that pass all filters
                 */

                value: function filter(objects) {
                    var _this = this;

                    var result = [];

                    objects.forEach(function (obj) {
                        var ok = true;

                        _this.filters.forEach(function (filter) {
                            ok = ok && filter.test(obj);
                        });

                        if (ok) result.push(obj);
                    });

                    return result;
                }
            }
        });

        return FilterManager;
    })();

    module.exports = FilterManager;
});