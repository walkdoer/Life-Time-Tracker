(function () {
    'use strict';
    var isNodeWebkit = false;
    var root = this;

    if (typeof require !== 'undefined') {
        isNodeWebkit = true;
    }

    if (isNodeWebkit === true) {
        var Menubar = require('menubar');
        var nwGui = require('nw.gui');
        var Ltt = {

            getWindow: function () {
                return nwGui.Window.get();
            },

            enterFullscreen: function () {
                this.getWindow().enterFullscreen();
            },

            leaveFullscreen: function () {
                this.getWindow().leaveFullscreen();
            },

            isFullscreen: function () {
               return this.getWindow().isFullscreen;
            },

            /**
             * close application window
             */
            close: function () {
                this.getWindow().close();
            }
        };
        root = global;
        root.Ltt = Ltt;
        root.nwGui = nwGui;
        //a series of init action to intialize components
        initMenu();
    }

    function initMenu() {
        var menu = new Menubar([{
            name: 'default',
            items: [{
                name: 'Import Data',
                handler: function () {
                }
            }, {
                name: 'Quit',
                handler: function () {
                    Ltt.close();
                }
            }]
        }, {
            name: 'File',
            items: [{
                name: 'Import Data',
                handler: function () {
                }
            }, {
                name: 'Create Note',
                handler: function () {

                }
            }]
        }]);
        var win = Ltt.getWindow();
        win.menu = menu;
    }

})();