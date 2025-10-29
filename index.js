const { app, BrowserWindow, Menu, dialog, ipcMain, autoUpdater } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');


let devToolsOpened = false;

class GraphicsWindow {
    constructor() {
        try {
            this.window = null;

            app.on('ready', () => {
                this.createWindow().then(() => {

                })
            });
        } catch (e) { }
    }

    async createWindow() {
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            minWidth: 800,   // Set the minimum width
            minHeight: 600,  // Set the minimum height
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                spellcheck: false,
                preload: path.join(__dirname, './preload.js')
            },
        });

        // Uncomment to use icon:
        // const iconPath = path.join(__dirname, './dist/images/icon.png');
        // this.window.setIcon(iconPath);

        const menu = Menu.buildFromTemplate([]);
        Menu.setApplicationMenu(menu);

        this.window.setMenu(menu);

        this.window.loadFile('./dist/html/index.html');

        this.window.on('closed', () => {
            this.window = null;
        });
    }
}

const graphicsWindow = new GraphicsWindow();

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on("dev-refresh", () => {
    graphicsWindow.window.reload();
})

ipcMain.on("close", () => {
    graphicsWindow.window.close();
})

ipcMain.on("minimize", () => {
    graphicsWindow.window.minimize();
})

ipcMain.on("toggle-dev-tools", () => {

    // Toggle the DevTools visibility based on its current state
    if (devToolsOpened) {
        graphicsWindow.window.webContents.closeDevTools();
    } else {
        graphicsWindow.window.webContents.openDevTools();
    }
})

const cache = {};

ipcMain.on("edit-cache", (ev, data) => {
    const { key, value } = data;
    cache[key] = value;
})

ipcMain.on("get-cache", (ev, data) => {
    const { key } = data;
    graphicsWindow.window.webContents.send("get-cache", cache[key]);
})