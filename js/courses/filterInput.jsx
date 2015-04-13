import React from 'react';


export default React.createClass({
    getInitialState() {
        this.mouseOverSuggestions = false;

        return {
            value: this.props.filter.getValue(),
            showSuggestions: false
        };
    },

    remove() {
        this.props.delegate.removeFilter(this.props.filter);
    },

    inputKeyDown(event) {
        if (event.keyCode === 13) {
            React.findDOMNode(this.props.delegate.refs.input).focus();
        } else if (event.keyCode === 8 && this.state.value === '') {
            this.remove();
            React.findDOMNode(this.props.delegate.refs.input).focus();
        }
    },

    inputChanged(event) {
        this.setValue(event.target.value);
    },

    onInputClick(event) {
        // Prevent the event from bubbling down to the FilterWidget, which
        // takes focus on click
        event.stopPropagation();
    },

    onFocus(event) {
        this.setState({
            showSuggestions: true
        });
    },

    onBlur(event) {
        if (!this.mouseOverSuggestions) {
            this.setState({
                showSuggestions: false
            });
        }
    },

    setValue(value) {
        this.props.delegate.updateFilter(this.props.filter, value);

        this.setState({
            value
        });
    },

    suggestionClicked(event) {
        this.setValue(event.target.text);
        this.setState({
            showSuggestions: false
        });
    },

    onMouseEnter(event) {
        this.mouseOverSuggestions = true;
    },

    onMouseLeave(event) {
        this.mouseOverSuggestions = false;
    },

    render() {
        let virtual = jQuery('<span/>', {
            text: this.state.value
        }).hide().appendTo(document.body);

        const style = {
            marginLeft: 5,
            width: virtual.width() + 10
        };

        virtual.remove();

        const applicable = this.props.filter.getApplicableSuggestions();
        const suggestionItems = applicable.map((suggestion, i) => {
            const key = `${applicable.length}.${i}`;
            return (
                <li key={key}>
                    <a onClick={this.suggestionClicked}>{suggestion}</a>
                </li>
            );
        });

        let suggestions;

        if (this.state.showSuggestions && suggestionItems.length > 0) {
            suggestions = (
                <div className='filter-suggestions'
                     onMouseEnter={this.onMouseEnter}
                     onMouseLeave={this.onMouseLeave}>
                    <ul>{suggestionItems}</ul>
                </div>
            );
        }

        return (
            <div className='filter-view'>
                <span className='filter-view-name'>
                    {`${this.props.filter.getName()}`}
                </span>

                <input ref='input' className='filter-view-input' style={style}
                       onKeyDown={this.inputKeyDown}
                       onChange={this.inputChanged}
                       value={this.state.value}
                       onClick={this.onInputClick}
                       onFocus={this.onFocus}
                       onBlur={this.onBlur} />

               {suggestions}

                <a onClick={this.remove}>
                    <span className='glyphicon glyphicon-remove' />
                </a>
            </div>
        );
    }
});
