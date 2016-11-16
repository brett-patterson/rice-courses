import 'searchBar.scss';

import React, {PropTypes} from 'react';
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
        const inputProps = {
            className: 'search-bar',
            placeholder: 'Search for courses...',
            value: this.state.text,
            onChange: this.onChange
        };

        return <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={s => s}
            renderSuggestion={this.renderSuggestion}
            inputProps={inputProps} />;
    }
}

SearchBar.propTypes = {
    suggestions: PropTypes.array,
    query: PropTypes.string,
    onChange: PropTypes.func,
    updateDelay: PropTypes.number
};

SearchBar.defaultProps = {
    suggestions: [],
    query: '',
    onChange: () => {},
    updateDelay: 200
};

export default wrapComponentClass(SearchBar);
