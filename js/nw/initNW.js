(function (window, global) {

    var nwGui = require('nw.gui');
    var Ltt = {

        /**
         * close application window
         */
        close: function () {
            var win = nwGui.Window.get();
            win.close();
        }
    };
    global.Ltt = Ltt;
    global.nwGui = nwGui;

})(window, global);