import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';
import CourseFilter from './courseFilter';
import {propTypeHas, wrapComponentClass} from 'util';


class FilterInput extends React.Component {
    constructor(props) {
        super(props);

        this.mouseOverSuggestions = false;
        this.state = {
            value: props.filter.getValue(),
            showSuggestions: false
        };
    }

    componentDidMount() {
        if (this.props.active) {
            jQuery(ReactDOM.findDOMNode(this.refs.input)).focus();
        }
    }

    remove() {
        this.props.delegate.removeFilter(this.props.filter);
    }

    inputKeyDown(event) {
        if (event.keyCode === 13) {
            // Enter: Focus main input
            ReactDOM.findDOMNode(this.props.delegate.refs.input).focus();
        } else if (event.keyCode === 8 && this.state.value === '') {
            // Backspace: Remove input if no text entered
            this.remove();
            ReactDOM.findDOMNode(this.props.delegate.refs.input).focus();
        } else if (event.keyCode === 40) {
            // Down arrow: Focus suggestions menu if it exists
            if (this.refs.suggestions) {
                this.mouseOverSuggestions = true;

                const suggestNode = ReactDOM.findDOMNode(this.refs.suggestions);
                jQuery('a', suggestNode).eq(0).focus();
                event.preventDefault();
            }
        }
    }

    inputChanged(event) {
        this.setValue(event.target.value);
    }

    onInputClick(event) {
        // Prevent the event from bubbling down to the FilterWidget, which
        // takes focus on click
        event.stopPropagation();
    }

    onFocus() {
        this.setState({
            showSuggestions: true
        });
    }

    onBlur() {
        if (!this.mouseOverSuggestions) {
            this.setState({
                showSuggestions: false
            });
        }
    }

    setValue(value) {
        this.setState({
            value
        }, () => {
            this.props.delegate.updateFilter(this.props.filter, this.state.value);
            this.forceUpdate();
        });
    }

    suggestionClicked(event) {
        this.acceptSuggestion(event.target.text);
    }

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
                ReactDOM.findDOMNode(this.refs.input).focus();
            } else {
                prev.find('a').focus();
            }

            event.preventDefault();
        }
    }

    acceptSuggestion(suggestion) {
        this.setValue(suggestion);

        this.setState({
            showSuggestions: false
        }, () => {
            ReactDOM.findDOMNode(this.refs.input).focus();
        });
    }

    onMouseEnter() {
        this.mouseOverSuggestions = true;
    }

    onMouseLeave() {
        this.mouseOverSuggestions = false;
    }

    renderSuggestions() {
        const applicable = this.props.filter.getApplicableSuggestions();

        if (!this.state.showSuggestions || applicable.length === 0) {
            return undefined;
        }

        const suggestionItems = applicable.map((suggestion, i) => {
            const key = `${applicable.length}.${i}`;
            return (
                <li key={key}>
                    <a tabIndex={i} onClick={this.suggestionClicked}
                       onKeyDown={this.suggestionKeyFired}>{suggestion}</a>
                </li>
            );
        });

        return (
            <div ref='suggestions' className='filter-suggestions'
                 onMouseEnter={this.onMouseEnter}
                 onMouseLeave={this.onMouseLeave}>
                <ul>{suggestionItems}</ul>
            </div>
        );
    }

    render() {
        let virtual = jQuery('<span/>', {
            text: this.state.value
        }).hide().appendTo(document.body);

        const style = {
            marginLeft: 5,
            width: virtual.width() + 10
        };

        virtual.remove();

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

               {this.renderSuggestions()}

                <a onClick={this.remove}>
                    <span className='glyphicon glyphicon-remove' />
                </a>
            </div>
        );
    }
}

FilterInput.propTypes = {
    filter: PropTypes.instanceOf(CourseFilter).isRequired,
    delegate: propTypeHas(['removeFilter', 'updateFilter']),
    active: PropTypes.bool
};

FilterInput.defaultProps = {
    active: false
};

export default wrapComponentClass(FilterInput);
