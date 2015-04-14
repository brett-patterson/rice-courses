import React from 'react';
import {Alert} from 'reactBootstrap';


export default {
    getInitialState() {
        return {
            alerts: []
        };
    },

    addAlert(html, style, timeout=3000) {
        this.setState(React.addons.update(this.state, {
            alerts: {
                $push: [{ html, style, timeout }]
            }
        }));
    },

    handleAlertDismissFactory(message) {
        return event => {
            const index = this.state.alerts.indexOf(message);

            if (index > -1)
                this.setState(React.addons.update(this.state, {
                    alerts: {
                        $splice: [[index, 1]]
                    }
                }));
        };
    },

    renderAlerts() {
        return this.state.alerts.map((message, index) => {
            return (
                <Alert key={index}
                       bsStyle={message.style}
                       dismissAfter={message.timeout}
                       onDismiss={this.handleAlertDismissFactory(message)}>
                    <span dangerouslySetInnerHTML={{ __html: message.html }} />
                </Alert>
            );
        });
    }
};
