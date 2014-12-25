(function() {
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

            init: function () {
                var win = this.getWindow();
                nwGui.App.on('reopen', function () {
                    win.show();
                });
            },

            getWindow: function() {
                return nwGui.Window.get();
            },

            enterFullscreen: function() {
                this.getWindow().enterFullscreen();
            },

            leaveFullscreen: function() {
                this.getWindow().leaveFullscreen();
            },

            isFullscreen: function() {
                return this.getWindow().isFullscreen;
            },

            /**
             * close application window
             */
            close: function() {
                var win = this.getWindow();
                win.hide();
            },

            quit: function () {
                var win = this.getWindow();
                win.on('close', function() {
                    // Hide the window to give user the feeling of closing immediately
                    this.hide();
                    // After closing the new window, close the main window.
                    this.close(true);
                });
                win.close();
            }
        };
        Ltt.init();
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
                handler: function() {}
            }, {
                name: 'Quit',
                handler: function() {
                    Ltt.quit();
                }
            }]
        }, {
            name: 'File',
            items: [{
                name: 'Import Data',
                handler: function() {}
            }, {
                name: 'Create Note',
                handler: function() {

                }
            }]
        }]);
        var win = Ltt.getWindow();
        win.menu = menu;
    }

})();