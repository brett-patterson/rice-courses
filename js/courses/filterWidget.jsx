import React from 'react';

import FilterManager from 'courses/filterManager';
import FilterButton from 'courses/filterButton';
import FilterInput from 'courses/filterInput';


export default React.createClass({
    getDefaultProps() {
        return {
            key: ':'
        };
    },

    getInitialState() {
        return {
            outline: 'none',
            placeholder: 'Filter',
            keywords: {},
            text: '',
            filters: [],
            manager: new FilterManager()
        };
    },

    componentWillMount() {
        let keywords = {};
        for (let filter of this.props.filters) {
            for (let keyword of filter.getKeywords())
                keywords[keyword] = filter;
        }

        this.setState({
            keywords
        });
    },

    onFocus() {
        this.setState({
            outline: 'lightblue solid 1px'
        });
    },

    onBlur() {
        this.setState({
            outline: 'none'
        });
    },

    onChange(event) {
        const text = event.target.value;

        this.setState({text}, () => {
            const index = text.indexOf(this.props.key);

            if (index > -1) {
                const field = text.substring(0, index).toLowerCase();
                const value = text.substring(index + 1);
                const filter = this.state.keywords[field];

                if (field.length > 0 && filter !== undefined) {
                    this.setState({
                        text: ''
                    }, () => {
                        this.addFilter(filter, value);
                    });
                }
            }
        });
    },

    onKeyDown(event) {
        const filters = this.state.manager.getFilters();  

        if (event.keyCode === 8 && filters.length > 0 &&
            this.state.text.length === 0) {
            this.removeFilter(this.state.filters[filters.length - 1]);
        }
    },

    addFilter(filter, value) {
        this.state.manager.addFilter(filter, value);

        this.setState({
            filters: this.state.manager.getFilters()
        });
    },

    removeFilter(filter) {
        this.state.manager.removeFilter(filter);

        this.setState({
            filters: this.state.manager.getFilters()
        });
    },

    /**
     * Get the appropriate hue for a filter button.
     * @param {number} index - The index of the filter
     * @param {number} total - The total number of filters
     * @return {number} The hue of the filter
     */
    getFilterHue(index=0, total=1) {
        return 360 / total * index;
    },

    render() {
        let filterButtons = this.props.filters.map((filter, index) => {
            return <FilterButton filter={filter}
                         hue={this.getFilterHue(index, this.props.filters.length)}
                         key={`filterBtn${index}`}
                         delegate={this} />;
        });

        const style = {
            outline: this.state.outline
        };

        let filterInputs = this.state.filters.map((filter, index) => {
            return <FilterInput filter={filter} key={`filter${index}`}
                                delegate={this} />;
        });

        return (
            <div>
                <div className='course-filters'>
                    {filterButtons}
                </div>
                <div className='filter-widget' style={style}>
                    {filterInputs}
                    <input ref='input' type='text' className='filter-input'
                           placeholder={this.state.placeholder}
                           value={this.state.text}
                           onFocus={this.onFocus} onBlur={this.onBlur}
                           onChange={this.onChange} onKeyDown={this.onKeyDown} />
                </div>
            </div>
       );
    }
});
