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
            // Enter: Focus main input
            React.findDOMNode(this.props.delegate.refs.input).focus();
        } else if (event.keyCode === 8 && this.state.value === '') {
            // Backspace: Remove input if no text entered
            this.remove();
            React.findDOMNode(this.props.delegate.refs.input).focus();
        } else if (event.keyCode === 40) {
            // Down arrow: Focus suggestions menu if it exists
            if (this.refs.suggestions) {
                this.mouseOverSuggestions = true;

                const suggestNode = React.findDOMNode(this.refs.suggestions);
                jQuery('a', suggestNode).eq(0).focus();
                event.preventDefault();
            }
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
        this.acceptSuggestion(event.target.text);
    },

    suggestionKeyFired(event) {
        if (event.keyCode === 13) {
            // Enter: accept the suggestion
            this.acceptSuggestion(event.target.text);
        } else if (event.keyCode === 40) {
            // Down arrow: focus the next suggestion
            jQuery(event.target).parent().next().find('a').focus();
            event.preventDefault();
        } else if (event.keyCode === 38) {
            // Up arrow: focus the previous suggestion or focus the input if
            // at the top of the list of suggestions
            const prev = jQuery(event.target).parent().prev();

            if (prev.length === 0) {
                React.findDOMNode(this.refs.input).focus();
            } else {
                prev.find('a').focus();
            }

            event.preventDefault();
        }
    },

    acceptSuggestion(suggestion) {
        this.setValue(suggestion);
        
        this.setState({
            showSuggestions: false
        }, () => {
            React.findDOMNode(this.refs.input).focus();
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
                    <a tabIndex={i} onClick={this.suggestionClicked}
                       onKeyDown={this.suggestionKeyFired}>{suggestion}</a>
                </li>
            );
        });

        let suggestions;

        if (this.state.showSuggestions && suggestionItems.length > 0) {
            suggestions = (
                <div ref='suggestions' className='filter-suggestions'
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
