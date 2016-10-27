import React, {PropTypes} from 'react';
import {connect} from 'react-redux';

import {wrapComponentClass} from 'util';


class Help extends React.Component {
    renderArticles() {
        return this.props.articles.map(article => {
            return <article key={article.id}>
                <h2>{article.title}</h2>
                <span dangerouslySetInnerHTML={{__html: article.body}} />
            </article>;
        });
    }

    render() {
        return <section>
            {this.renderArticles()}
        </section>;
    }
}

Help.propTypes = {
    articles: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        body: PropTypes.string
    }))
};

function mapStateToProps(state) {
    return {
        articles: state.help.articles
    };
}

export default connect(mapStateToProps)(wrapComponentClass(Help));
