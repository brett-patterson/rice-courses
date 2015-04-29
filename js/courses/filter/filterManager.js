import CourseFilter from 'courses/filter/courseFilter';

export default class FilterManager {
    /**
     * Create a new filter manager.
     * @param {function} onFiltersChanged - fired when the filters change
     */
    constructor(onFiltersChanged = () => {}) {
        this.filters = [];
        this.onFiltersChanged = onFiltersChanged;
        this.loadFilters();
    }

    /**
     * Add a filter.
     * @param {CourseFilter} filter - The filter to be added
     */
    addFilter(filter) {
        this.filters.push(filter);
        this.saveFilters();
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
            this.saveFilters();
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
            this.saveFilters();
            this.onFiltersChanged();
        }
    }

    /**
     * Load filters from session storage.
     */
    loadFilters() {
        const filters = sessionStorage.getItem('filters');
        if (filters !== null) {
            this.filters = this.filters.concat(CourseFilter.arrayFromJSON(filters));
            this.onFiltersChanged();
        }
    }

    /**
     * Save current filters to session storage.
     */
    saveFilters() {
        const toSerialize = [];

        for (let i = 0; i < this.filters.length; i++) {
            toSerialize.push(this.filters[i].toJSON());
        }

        sessionStorage.setItem('filters', JSON.stringify(toSerialize));
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
