// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

const electron = require('electron');
const app = electron.app;
const globalShortcut = electron.globalShortcut;

const ipc = electron.ipcMain;
var Menu = require('menu');

const BrowserWindow = require('browser-window');
const env = require('./vendor/electron_boilerplate/env_config');
const windowStateKeeper = require('./vendor/electron_boilerplate/window_state');

const shortcuts = ['MediaNextTrack', 'MediaPreviousTrack', 'MediaStop', 'MediaPlayPause'];

var mainWindow;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {

});

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        title: 'Koel',
        titleBarStyle: 'hidden-inset',
        fullscreenable: false,
        minHeight: 600,
        minWidth: 1280,
    });

    if (mainWindowState.isMaximized) {
        mainWindow.maximize();
    }

    if (env.name === 'test') {
        mainWindow.loadURL('file://' + __dirname + '/spec.html');
    } else {
        mainWindow.loadURL('file://' + __dirname + '/app.html');
    }

    var menuTemplate = [
        {
            label: 'Application',
            submenu: [
                { label: 'About Koel', click: function () { mainWindow.webContents.send('cmd', 'ShowAboutPanel'); } },
                { type: 'separator' },
                { label: 'Quit', accelerator: 'Command+Q', click: function() { app.quit(); }}
            ]
        }, {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
                { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
                { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
            ]
        }
    ];

    if (env.name !== 'production') {
        menuTemplate.push({
            label: 'Development',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function () {
                        mainWindow.webContents.reloadIgnoringCache();
                    }
                }, {
                    label: 'Toggle DevTools',
                    accelerator: 'Alt+CmdOrCtrl+I',
                    click: function () {
                        BrowserWindow.getFocusedWindow().toggleDevTools();
                    }
                }
            ]
        });

        mainWindow.openDevTools();
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

    /**
     * Register the global shortcuts.
     *
     * @param  {string} k) The shortcut key name
     */
    shortcuts.forEach(function (k) {
        globalShortcut.register(k, function () {
            mainWindow.webContents.send('shortcut', k);
        });
    });

    mainWindow.on('close', function (e) {
        // To confirm or not to confirm closing, it's a question.
        /*
        if (mainWindow.confirmClosing && !confirm('Close Koel?')) {
            e.preventDefault();

            return;
        }
        */

        mainWindowState.saveState(mainWindow);
    });
});

app.on('window-all-closed', function () {
    globalShortcut.unregisterAll();
    app.quit();
});
