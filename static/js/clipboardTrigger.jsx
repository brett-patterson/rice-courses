import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Overlay, Tooltip} from 'react-bootstrap';
import Clipboard from 'clipboard';

import {wrapComponentClass} from './util';


class ClipboardTrigger extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tooltip: null
        };
    }

    componentDidMount() {
        let options = {};

        if (this.props.target !== undefined) {
            options.target = () => ReactDOM.findDOMNode(this.props.target);
        }

        if (this.props.text !== undefined) {
            options.text = () => this.props.text;
        }

        var trigger = ReactDOM.findDOMNode(this.refs.trigger);

        this.clipboard = new Clipboard(trigger, options);
        this.clipboard.on('success', () => this.flashTooltip('Copied!'));
        this.clipboard.on('error', () => {
            this.flashTooltip('Press Ctrl + C to copy');
        });
    }

    flashTooltip(text) {
        this.setState({
            tooltip: text
        });

        setTimeout(() => {
            this.setState({
                tooltip: null
            });
        }, 1500);
    }

    componentWillUnmount() {
        this.clipboard.destroy();
    }

    render() {
        let showTooltip = this.state.tooltip !== null;
        let tooltipTarget = () => ReactDOM.findDOMNode(this.refs.trigger);

        return <span>
            <a ref='trigger' {...this.props}>
                {this.props.children}
            </a>
            <Overlay show={showTooltip} placement='top' target={tooltipTarget}>
                <Tooltip id='tooltip'>
                    {this.state.tooltip}
                </Tooltip>
            </Overlay>
        </span>;
    }
}

ClipboardTrigger.propTypes = {
    target: PropTypes.element,
    text: PropTypes.string
};

export default wrapComponentClass(ClipboardTrigger);
