import React from 'react';
import {Alert} from 'reactBootstrap';
import {indexOf} from 'util';


export default {
    getInitialState() {
        return {
            alerts: []
        };
    },

    addAlert(html, style, timeout=3000) {
        this.setState(React.addons.update(this.state, {
            alerts: {
                $push: [{ html, style, timeout, id: Date.now() }]
            }
        }));
    },

    handleAlertDismissFactory(message) {
        return event => {
            const index = indexOf(this.state.alerts, message.id, message => {
                return message.id;
            });

            if (index > -1)
                this.setState(React.addons.update(this.state, {
                    alerts: {
                        $splice: [[index, 1]]
                    }
                }));
        };
    },

    renderAlerts() {
        const alerts = this.state.alerts.map((message, index) => {
            return (
                    <Alert key={message.id}
                           bsStyle={message.style}
                           dismissAfter={message.timeout}
                           onDismiss={this.handleAlertDismissFactory(message)}>
                        <span dangerouslySetInnerHTML={{ __html: message.html }} />
                    </Alert>
            );
        });

        return <div className='alert-container'>{alerts}</div>;
    }
};
