import 'searchBar.scss';

import React, {PropTypes} from 'react';
import {Glyphicon} from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';

import {wrapComponentClass} from 'util';

class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: props.query,
            suggestions: []
        };

        this._timer = null;
    }

    onSuggestionsFetchRequested({ value }) {
        this.setState({
            suggestions: this.props.suggestions.filter(suggestion => {
                return suggestion.toLowerCase().indexOf(value.toLowerCase()) === 0;
            })
        });
    }

    onSuggestionsClearRequested() {
        this.setState({
            suggestions: []
        });
    }

    onChange(e, { newValue: text }) {
        this.setState({ text });

        if (this._timer !== null) {
            clearTimeout(this._timer);
        }

        this._timer = setTimeout(() => {
            this.props.onChange(text);
        }, this.props.updateDelay);
    }

    renderSuggestion(suggestion) {
        return <div>{suggestion}</div>;
    }

    render() {
        const {filtersOpen, toggleFilters} = this.props;
        const {text, suggestions} = this.state;

        const inputProps = {
            className: 'search-bar',
            placeholder: 'Search for courses...',
            value: text,
            onChange: this.onChange
        };

        const filterGlyph = filtersOpen ? 'triangle-right' : 'menu-hamburger';

        return <div className='search-bar-container'>
            <Autosuggest suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={s => s}
                renderSuggestion={this.renderSuggestion}
                inputProps={inputProps} />
            <a href='#' className='filter-toggle' onClick={toggleFilters}>
                <Glyphicon glyph={filterGlyph} /> Filters
            </a>
        </div>;
    }
}

SearchBar.propTypes = {
    suggestions: PropTypes.array,
    query: PropTypes.string,
    onChange: PropTypes.func,
    updateDelay: PropTypes.number,
    toggleFilters: PropTypes.func,
    filtersOpen: PropTypes.bool
};

SearchBar.defaultProps = {
    suggestions: [],
    query: '',
    onChange: () => {},
    updateDelay: 200,
    toggleFilters: () => {},
    filtersOpen: false
};

export default wrapComponentClass(SearchBar);
