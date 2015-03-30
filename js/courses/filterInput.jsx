import React from 'react';
import jQuery from 'jquery';

export default React.createClass({
    removeClicked() {
        this.props.delegate.removeFilter(this.props.filter);
    },

    inputKeyDown(event) {
        if (event.keyCode === 13) {
            React.findDOMNode(this.props.delegate.refs.input).focus();
        } else if (event.keyCode === 8 &&
                   React.findDOMNode(this.refs.input).value === '') {
            this.props.delegate.removeFilter(this.props.filter);
            React.findDOMNode(this.props.delegate.refs.input).focus();
        }
    },

    render() {
        const filter = this.props.filter;

        return (
            <span className='filter-view'>
                {`${filter.getName()}: `}
                <input ref='input' className='filter-view-input'
                       onKeyDown={this.inputKeyDown} />
                <a onClick={this.removeClicked}>
                    <span className='glyphicon glyphicon-remove' />
                </a>
            </span>
        );
    }
});
