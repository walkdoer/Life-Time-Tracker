var React = require('react');
var pagePrefix = '../pages/';

var Pages = {
    Dashboard: require('../pages/Dashboard'),
    Logs: require('../pages/Logs'),
    Page404: require('../pages/Page404')
};

var PAGE_404 = 'Page404';
var _pageCache_ = {};

var PageManager = React.createClass({
    getInitialState: function () {
        return {
            current: this.props.page
        };
    },

    componentWillReceiveProps: function (nextProps) {
        this.setState({
            current: nextProps.page
        });
    },

    render: function () {
        var current = this.state.current;
        var page = this.getPage();
        if (page === null) {
            var pageName = current.toUpperCase().slice(0,1) + current.slice(1);
            //can't find page then show 404
            var Page = Pages[pageName] || Pages[PAGE_404];
            current = PAGE_404;
            page = (<Page key={current}/>);
            this.setPage(page);
        }
        return (
            <section className="ltt_c-pageManager">
                {page}
            </section>
        );
    },

    getPage: function () {
        return _pageCache_[this.state.current] || null;
    },

    setPage: function (page) {
        _pageCache_[this.state.current] = page;
    }
});

module.exports = PageManager;