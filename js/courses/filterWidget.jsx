import React from 'react';

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
            placeholder: 'Add Filters...',
            keywords: {},
            text: '',
            currentFilters: []
        };
    },

    componentWillMount() {
        let keywords = {};
        for (let i = 0; i < this.props.filters.length; i++) {
            const filter = this.props.filters[i];
            const filterKeywords = filter.getKeywords();

            for (let j = 0; j < filterKeywords; j++)
                keywords[filterKeywords[j].toLowerCase()] = filter;
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
        const filters = this.props.manager.getFilters();  

        if (event.keyCode === 8 && filters.length > 0 &&
            this.state.text.length === 0) {
            this.removeFilter(this.state.currentFilters[filters.length - 1]);
        }
    },

    widgetClicked() {
        React.findDOMNode(this.refs.input).focus();
    },

    addFilter(filter, value) {
        this.props.manager.addFilter(filter, value);

        this.setState({
            currentFilters: this.props.manager.getFilters()
        }, () => {
            const index = this.props.manager.getFilters().length - 1;
            React.findDOMNode(this.refs[`filter${index}`].refs.input).focus();
        });
    },

    removeFilter(filter) {
        this.props.manager.removeFilter(filter);

        this.setState({
            currentFilters: this.props.manager.getFilters()
        });
    },

    updateFilter(filter, value) {
        this.props.manager.updateFilter(filter, value);
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

        const widgetStyle = {
            outline: this.state.outline
        };

        let filterInputs = this.state.currentFilters.map((filter, index) => {
            return <FilterInput filter={filter} key={`filter${index}`}
                                delegate={this} ref={`filter${index}`} />;
        });

        return (
            <div>
                <div className='course-filters'>
                    {filterButtons}
                </div>
                <div className='filter-widget' style={widgetStyle}
                     onClick={this.widgetClicked}>
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
