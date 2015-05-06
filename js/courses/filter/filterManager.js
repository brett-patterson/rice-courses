import CourseFilter from 'courses/filter/courseFilter';

let updateTimerId = null;

export default class FilterManager {
    /**
     * Create a new filter manager.
     * @param {function} onFiltersChanged - fired when the filters change
     */
    constructor(onFiltersChanged = () => {}, filterUpdateDelay=500) {
        this.filters = [];
        this.onFiltersChanged = onFiltersChanged;
        this.filterUpdateDelay = filterUpdateDelay;
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

            clearTimeout(updateTimerId);
            updateTimerId = setTimeout(this.onFiltersChanged,
                this.filterUpdateDelay);
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
     * Get all filters to be sent server-side.
     * @return {array} An array of filters in the format of [key, value]
     */
    getFiltersForServer() {
        return this.filters.map(filter => {
            return [filter.getKey(), filter.getValue()];
        });
    }
}
