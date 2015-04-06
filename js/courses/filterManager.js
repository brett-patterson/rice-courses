export default class FilterManager {
    /**
     * Create a new filter manager.
     * @param {function} onFiltersChanged - fired when the filters change
     */
    constructor(onFiltersChanged = () => {}) {
        this.filters = [];
        this.onFiltersChanged = onFiltersChanged;
    }

    /**
     * Add a filter.
     * @param {CourseFilter} filter - The filter to be added
     * @param {any} value - The value that `filter` should filter for
     */
    addFilter(filter, value) {
        filter.setValue(value);
        this.filters.push(filter);
        this.onFiltersChanged();
    }

    /**
     * Remove a filter.
     * @param {CourseFilter} filter - The filter to be removed
     */
    removeFilter(filter) {
        const index = this.filters.indexOf(filter);

        if (index > -1) {
            this.filters.splice(index, 1);
            this.onFiltersChanged();
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
            this.onFiltersChanged();
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

        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            let ok = true;

            for (let j = 0; j < this.filters.length; j++) {
                ok = ok && this.filters[j].test(obj);
                if (!ok)
                    break;
            }

            if (ok)
                result.push(obj);
        }

        return result;
    }
}
