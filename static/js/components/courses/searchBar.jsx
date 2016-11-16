import 'searchBar.scss';

import React, {PropTypes} from 'react';

import {wrapComponentClass} from 'util';

class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: props.query
        };

        this._timer = null;
    }

    onChange(e) {
        const text = e.target.value;
        this.setState({ text });

        if (this._timer !== null) {
            clearTimeout(this._timer);
        }

        this._timer = setTimeout(() => {
            this.props.onChange(text);
        }, this.props.updateDelay);
    }

    render() {
        return <input type='text' className='search-bar'
                      placeholder='Search for courses...'
                      value={this.state.text} onChange={this.onChange} />;
    }
}

SearchBar.propTypes = {
    query: PropTypes.string,
    onChange: PropTypes.func,
    updateDelay: PropTypes.number
};

SearchBar.defaultProps = {
    query: '',
    onChange: () => {},
    updateDelay: 200
};

export default wrapComponentClass(SearchBar);
