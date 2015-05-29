(function() {
    'use strict';
    var isNodeWebkit = false;
    var root = this;
    var Ltt;
    if (typeof require !== 'undefined') {
        isNodeWebkit = true;
    }
    if (!isNodeWebkit) {
        console.log('init Ltt Api for browser invironment');
        Ltt = {
            openExternalLink: function (link) {
                window.open(link, '_blank');
            }
        };
        window.Ltt = Ltt;
        return;
    }
    var sdk = require('ltt-sdk');
    var path = require('path');
    var _ = require('lodash');
    var config = require('tracker/conf/config');



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

    function initApp() {
        Ltt.init();
        Ltt.sdk = sdk;
        root = global;
        root.Ltt = Ltt;
        window.Ltt = Ltt;
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
                            getMenu(menubar, ['Server', 'Stop Server']).enabled = true;
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
                    this.enabled = false;
                    getMenu(menubar, ['Server', 'Start Server']).enabled = true;
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

        function getMenu(parentMenu, path) {
            var menuItems = parentMenu.items;
            var lastIndex = path.length - 1;
            var target = null;
            path.forEach(function (node, index) {
                if (!menuItems) {return;}
                var menu = menuItems.filter(function (menuItem) {
                    return menuItem.label === node;
                })[0];
                if (index === lastIndex) {
                    target = menu;
                }
                if (menu && menu.submenu) {
                    menuItems = menu.submenu.items;
                }
            });
            return target;
        }
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

    if (isNodeWebkit === true) {
        var gui = require('nw.gui');
        console.log('init Ltt Api for node-webkit invironment');
        Ltt = {

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
                var that = this;
                if (this.isFullscreen()) {
                    this.leaveFullscreen();
                    setTimeout(function () {
                        that.getWindow().hide();
                    }, 1500);
                } else {
                    this.getWindow().close();
                }
            },

            quit: function () {
                var win = this.getWindow();
                win.close();
            },

            openExternalLink: function (link) {
                if (link) {
                    gui.Shell.openExternal(link);
                }
            },
        };
        global.Ltt = Ltt;
        initApp();
        setTimeout(function () {
            //use new-instanse window to start server
            var serverWin = gui.Window.open('./server.html', {"new-instance": true});
        }, 100);
    }

})();