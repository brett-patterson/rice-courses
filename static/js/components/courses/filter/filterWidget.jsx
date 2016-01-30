import 'filterWidget.scss';

import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

import FilterButton from './filterButton';
import FilterInput from './filterInput';
import {getHueByIndex, wrapComponentClass} from 'util';

let timerId = null;

class FilterWidget extends React.Component {
    constructor(props) {
        super(props);
        let keywords = {};
        for (let filter of props.filters) {
            for (let kw of filter.getKeywords())
                keywords[kw.toLowerCase()] = filter;
        }

        this.state = {
            outline: 'none',
            placeholder: 'Add Filters...',
            keywords,
            text: ''
        };
    }

    onFocus() {
        this.setState({
            outline: 'lightblue solid 1px'
        });
    }

    onBlur() {
        this.setState({
            outline: 'none'
        });
    }

    onChange(event) {
        const text = event.target.value;

        this.setState({text}, () => {
            const index = text.indexOf(this.props.key);

            if (index > -1) {
                const field = text.substring(0, index).toLowerCase();
                const filter = this.state.keywords[field];

                if (field.length > 0 && filter !== undefined) {
                    this.setState({
                        text: ''
                    }, () => {
                        this.addFilter(filter, '');
                    });
                }
            }
        });
    }

    onKeyDown(event) {
        const filters = this.props.filters;

        if (event.keyCode === 8 && filters.length > 0 &&
            this.state.text.length === 0) {
            this.removeFilter(filters[filters.length - 1]);
        }
    }

    widgetClicked() {
        ReactDOM.findDOMNode(this.refs.input).focus();
    }

    filtersChanged() {
        if (timerId !== null) {
            clearTimeout(timerId);
        }

        timerId = setTimeout(() => {
            this.props.filtersChanged(this.props.filters);
        }, 500);
    }

    addFilter(filter, value) {
        filter.setValue(value);
        this.props.filters.push(filter);
        this.filtersChanged();
    }

    removeFilter(filter) {
        const index = this.props.filters.indexOf(filter);

        if (index > -1) {
            this.props.filters.splice(index, 1);
            this.filtersChanged();
        }
    }

    updateFilter(filter, value) {
        filter.setValue(value);
        this.filtersChanged();
    }

    renderFilterButtons() {
        return this.props.allFilters.map((filter, index) => {
            return <FilterButton filter={filter}
                         hue={getHueByIndex(index, this.props.allFilters.length)}
                         key={`filterBtn${index}`}
                         delegate={this} />;
        });
    }

    renderFilterInputs() {
        return this.props.filters.map((filter, index) => {
            const id = `filter-${this.props.filters.length}-${index}`;
            return <FilterInput filter={filter} key={id} delegate={this} />;
        });
    }

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
}

FilterWidget.propTypes = {
    key: PropTypes.string,
    allFilters: PropTypes.array,
    filters: PropTypes.array,
    filtersChanged: PropTypes.func
};

FilterWidget.defaultProps = {
    key: ':',
    filters: []
};

export default wrapComponentClass(FilterWidget);
