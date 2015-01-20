module.exports = function (Store) {
    return {
        componentDidMount: function () {
            Store.addChangeListener(this._onChange);
        },

        componentWillUnmount: function () {
            Store.removeChangeListener(this._onChange);
        },

        _onChange: function () {
            this.setState(this.getStateFromStores());
        }
    };
};