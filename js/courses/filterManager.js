export default class FilterManager {
    constructor() {
        this.filters = [];
    }

    /**
     * Add a filter.
     * @param {CourseFilter} filter - The filter to be added
     * @param {any} value - The value that `filter` should filter for
     */
    addFilter(filter, value) {
        filter.setValue(value);
        this.filters.push(filter);
    }

    /**
     * Remove a filter.
     * @param {CourseFilter} filter - The filter to be removed
     */
    removeFilter(filter) {
        const index = this.filters.indexOf(filter);

        if (index > -1) {
            this.filters.splice(index, 1);
        }
    }

    /**
     * Update the value of a filter
     * @param {CourseFilter} filter - The filter to update
     * @param {any} value - The new value for the filter
     */
    updateFilter(filter, value) {
        const index = this.filters.indexOf(filter);

        if (index > -1) {
            this.filters[index].setValue(value);
        }
    }

    /**
     * Get all filters.
     * @return {array} An array of filters
     */
    getFilters() {
        return this.filters;
    }

    /**
     * Filter a list of objects.
     * @param {array} objects - An array of objects to be filtered
     * @return {array} All objects in `objects` that pass all filters
     */
    filter(objects) {
        let result = [];

        objects.forEach(obj => {
            let ok = true;

            this.filters.forEach(filter => {
                ok = ok && filter.test(obj);
            });

            if (ok)
                result.push(obj);
        });

        return result;
    }
}
