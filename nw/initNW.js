(function() {
    'use strict';
    var isNodeWebkit = false;
    var root = this;
    var sdk = require('ltt-sdk');
    var path = require('path');

    if (typeof require !== 'undefined') {
        isNodeWebkit = true;
    }


    /**
     * application funtion map
     */
    var functionMap = {
        'open_addLog_window': function () {
            var fileSrc = getFileSrc('addLog.html');
            var win = gui.Window.open(fileSrc, {
                height: 200,
                width: 350,
                position: 'center'
            });
        }
    };

    function getFileSrc(fileName) {
        var fileSrc = 'file:///' + path.resolve('./' + fileName);
        return fileSrc;
    }

    if (isNodeWebkit === true) {
        var Menubar = require('ltt-nw/menubar');
        var gui = require('nw.gui');
        var Ltt = {

            init: function () {
                var win = this.getWindow();
                gui.App.on('reopen', function () {
                    win.show();
                });
            },

            getWindow: function() {
                return gui.Window.get();
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
        Ltt.sdk = sdk;
        root = global;
        root.Ltt = Ltt;
        root.nwGui = gui;
        //a series of init action to intialize components
        initMenu();
        initShortcut();
    }

    function initMenu() {
        var menu = new Menubar([{
            name: 'default',
            items: [{
                name: 'Import Data',
                handler: function() {}
            }, {
                name: 'Sync From Evernote',
                handler: function () {
                    sdk.syncEvernote()
                        .then(function (result) {
                            alert(result);
                        });
                }
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

    function initShortcut() {
        var shortcutDefinitions = [{
            key: "Ctrl+Shift+A",
            active: function() {
                console.log("Global desktop keyboard shortcut: " + this.key + " active.");
                functionMap.open_addLog_window();
            },
            failed: function(msg) {
                console.log(msg);
            }
        }];
        shortcutDefinitions.forEach(function(definition) {
            // Create a shortcut with |option|.
            var shortcut = new gui.Shortcut(definition);
            // Register global desktop shortcut, which can work without focus.
            gui.App.registerGlobalHotKey(shortcut);
        });
    }

})();