define(["exports", "module"], function (exports, module) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var FilterManager = (function () {
        /**
         * Create a new filter manager.
         * @param {function} onFiltersChanged - fired when the filters change
         */

        function FilterManager() {
            var onFiltersChanged = arguments[0] === undefined ? function () {} : arguments[0];

            _classCallCheck(this, FilterManager);

            this.filters = [];
            this.onFiltersChanged = onFiltersChanged;
        }

        _createClass(FilterManager, {
            addFilter: {

                /**
                 * Add a filter.
                 * @param {CourseFilter} filter - The filter to be added
                 * @param {any} value - The value that `filter` should filter for
                 */

                value: function addFilter(filter, value) {
                    filter.setValue(value);
                    this.filters.push(filter);
                    this.onFiltersChanged();
                }
            },
            removeFilter: {

                /**
                 * Remove a filter.
                 * @param {CourseFilter} filter - The filter to be removed
                 */

                value: function removeFilter(filter) {
                    var index = this.filters.indexOf(filter);

                    if (index > -1) {
                        this.filters.splice(index, 1);
                        this.onFiltersChanged();
                    }
                }
            },
            updateFilter: {

                /**
                 * Update the value of a filter
                 * @param {CourseFilter} filter - The filter to update
                 * @param {any} value - The new value for the filter
                 */

                value: function updateFilter(filter, value) {
                    var index = this.filters.indexOf(filter);

                    if (index > -1) {
                        this.filters[index].setValue(value);
                        this.onFiltersChanged();
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
                    var result = [];

                    for (var i = 0; i < objects.length; i++) {
                        var obj = objects[i];
                        var ok = true;

                        for (var j = 0; j < this.filters.length; j++) {
                            ok = ok && this.filters[j].test(obj);
                            if (!ok) break;
                        }

                        if (ok) result.push(obj);
                    }

                    return result;
                }
            }
        });

        return FilterManager;
    })();

    module.exports = FilterManager;
});