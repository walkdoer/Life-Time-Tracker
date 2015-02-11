(function() {
    'use strict';
    var isNodeWebkit = false;
    var root = this;
    var sdk = require('ltt-sdk');
    var path = require('path');
    var _ = require('lodash');

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
            win.focus();
        }
    };

    function getFileSrc(fileName) {
        var fileSrc = 'file:///' + path.resolve('./' + fileName);
        return fileSrc;
    }

    if (isNodeWebkit === true) {
        var gui = require('nw.gui');
        var Ltt = {

            init: function () {
                var win = this.getWindow();
                gui.App.on('reopen', function () {
                    win.show();
                    win.focus();
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
                win.close();
            }
        };
        sdk.startServer().then(function () {
            Ltt.init();
            Ltt.sdk = sdk;
            root = global;
            root.Ltt = Ltt;
            root.nwGui = gui;
            //a series of init action to intialize components
            initMenu();
            initShortcut();
            Ltt.getWindow().on('close', function(event) {
                // Hide the window to give user the feeling of closing immediately
                this.hide();
                if (event === 'quit') {
                    this.close(true);
                }
            });
        });
    }

    function initMenu() {
        var win = Ltt.getWindow();
        var menubar = new gui.Menu({ type: "menubar" });
        menubar.createMacBuiltin("My App");
        var menus = [{
            label: 'Data',
            items: [{
                label: 'Import Data',
                click: function() {}
            }, {
                label: 'Sync From Evernote',
                click: function () {
                    sdk.syncEvernote()
                        .then(function (result) {
                            alert(result);
                        });
                }
            }]
        }, {
            label: 'Server',
            items: [{
                label: 'Start Server',
                enabled: !sdk.isServerRunning(),
                key: 'S',
                click: function () {
                    console.log('start server');
                    var menu = this;
                    sdk.startServer()
                        .then(function () {
                            console.log('server started');
                            menu.enabled = false;
                        })
                        .fail(function () {
                            console.error('start server fail');
                        });
                }
            }, {
                label: 'Stop Server',
                key: 'C',
                enabled: sdk.isServerRunning(),
                click: function () {
                    console.log('stop server');
                    sdk.stopServer();
                }
            }]
        }, {
            label: 'File',
            items: [{
                label: 'Import Data',
                click: function() {

                }
            }, {
                label: 'Create Note',
                click: function() {

                }
            }]
        }];
        menus.forEach(function (menu) {
            var label = menu.label;
            var submenu = new gui.Menu();
            var items = menu.items;
            if (!_.isEmpty(items)) {
                items.forEach(function (item) {
                    submenu.append(new gui.MenuItem(item));
                });
            }
            menubar.append(new gui.MenuItem({
                label: label,
                submenu: submenu
            }));
        });
        win.menu = menubar;
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