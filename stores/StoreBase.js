var CHANGE_EVENT = 'change';

module.exports = {

    init: function () {
        this._cache = [];
        return this;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    /**
     * @param {function} callback
     */
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    setData: function (data) {
        this._cache = data;
        this.emitChange();
    },

    getData: function () {
        return this._cache;
    }
};