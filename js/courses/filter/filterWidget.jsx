import React from 'react';

import FilterButton from 'courses/filter/filterButton';
import FilterInput from 'courses/filter/filterInput';
import FilterManager from 'courses/filter/filterManager';
import {getHueByIndex} from 'util';

export default React.createClass({
    propTypes: {
        key: React.PropTypes.string,
        filters: React.PropTypes.array,
        manager: React.PropTypes.instanceOf(FilterManager).isRequired
    },

    getDefaultProps() {
        return {
            key: ':',
            filters: []
        };
    },

    getInitialState() {
        return {
            outline: 'none',
            placeholder: 'Add Filters...',
            keywords: {},
            text: '',
            currentFilters: this.props.manager.getFilters()
        };
    },

    componentWillMount() {
        let keywords = {};
        for (let i = 0; i < this.props.filters.length; i++) {
            const filter = this.props.filters[i];
            const filterKeywords = filter.getKeywords();

            for (let j = 0; j < filterKeywords.length; j++)
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
                        filter.setValue(value);
                        this.addFilter(filter);
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
        filter.setValue(value);
        this.props.manager.addFilter(filter);

        this.setState({
            currentFilters: this.props.manager.getFilters()
        }, () => {
            const index = this.props.manager.getFilters().length - 1;
            const id = `filter-${index+1}-${index}`;
            React.findDOMNode(this.refs[id].refs.input).focus();
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

    renderFilterButtons() {
        return this.props.filters.map((filter, index) => {
            return <FilterButton filter={filter}
                         hue={getHueByIndex(index, this.props.filters.length)}
                         key={`filterBtn${index}`}
                         delegate={this} />;
        });
    },

    renderFilterInputs() {
        return this.state.currentFilters.map((filter, index) => {
            const id = `filter-${this.state.currentFilters.length}-${index}`;
            return <FilterInput filter={filter} key={id} ref={id}
                                delegate={this} />;
        });
    },

    render() {
        const widgetStyle = {
            outline: this.state.outline
        };

        return (
            <div>
                <div className='course-filters'>
                    {this.renderFilterButtons()}
                </div>
                <div className='filter-widget' style={widgetStyle}
                     onClick={this.widgetClicked}>
                    {this.renderFilterInputs()}
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