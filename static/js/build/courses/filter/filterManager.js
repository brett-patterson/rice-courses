define(["exports", "module", "courses/filter/courseFilter"], function (exports, module, _coursesFilterCourseFilter) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var CourseFilter = _interopRequire(_coursesFilterCourseFilter);

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
            this.loadFilters();
        }

        _createClass(FilterManager, {
            addFilter: {

                /**
                 * Add a filter.
                 * @param {CourseFilter} filter - The filter to be added
                 */

                value: function addFilter(filter) {
                    this.filters.push(filter);
                    this.saveFilters();
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
                        this.saveFilters();
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
                        this.saveFilters();
                        this.onFiltersChanged();
                    }
                }
            },
            loadFilters: {

                /**
                 * Load filters from session storage.
                 */

                value: function loadFilters() {
                    var filters = sessionStorage.getItem("filters");
                    if (filters !== null) {
                        this.filters = this.filters.concat(CourseFilter.arrayFromJSON(filters));
                        this.onFiltersChanged();
                    }
                }
            },
            saveFilters: {

                /**
                 * Save current filters to session storage.
                 */

                value: function saveFilters() {
                    var toSerialize = [];

                    for (var i = 0; i < this.filters.length; i++) {
                        toSerialize.push(this.filters[i].toJSON());
                    }

                    sessionStorage.setItem("filters", JSON.stringify(toSerialize));
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