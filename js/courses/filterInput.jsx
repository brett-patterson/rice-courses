import React from 'react';
import jQuery from 'jquery';

export default React.createClass({
    getInitialState() {
        return {
            value: ''
        };
    },

    remove() {
        this.props.delegate.removeFilter(this.props.filter);
    },

    inputKeyDown(event) {
        console.log(event);
        if (event.keyCode === 13) {
            React.findDOMNode(this.props.delegate.refs.input).focus();
        } else if (event.keyCode === 8 && this.state.value === '') {
            this.remove();
            React.findDOMNode(this.props.delegate.refs.input).focus();
        }
    },

    inputChanged(event) {
        this.setState({
            value: event.target.value
        }, () => {
            this.props.delegate.updateFilter(this.props.filter,
                this.state.value);
        });
    },

    onInputClick(event) {
        // Prevent the event from bubbling down to the FilterWidget, which
        // takes focus on click
        event.stopPropagation();
    },

    render() {
        let virtual = jQuery('<span/>', {
            text: this.state.value
        }).hide().appendTo(document.body);

        const filter = this.props.filter;
        const style = {
            marginLeft: 5,
            width: virtual.width() + 10
        };

        virtual.remove();

        return (
            <div className='filter-view'>
                <span className='filter-view-name'>
                    {`${filter.getName()}`}
                </span>

                <input ref='input' className='filter-view-input' style={style}
                       onKeyDown={this.inputKeyDown}
                       onChange={this.inputChanged}
                       value={this.state.value}
                       onClick={this.onInputClick} />

                <a onClick={this.remove}>
                    <span className='glyphicon glyphicon-remove' />
                </a>
            </div>
        );
    }
});
