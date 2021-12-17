const { app,contextBridge, ipcRenderer } = require('electron');
const fs = require("fs")
const store = require('electron-store')

//window.require = require;

// contextBridge.exposeInMainWorld('electronAPI', {
//     getCacheLocation: () => {
//         console.log("App is Empty" + (app==null));

//         const userDataPath =app!=null? app.getPath('userData'): "";
//         console.log("UserDatapath is " + userDataPath);
//         return `${userDataPath}\\cache.json`;
//     },

//     fileExists: (path) => {
//         return fs.existsSync(path)
//     },

//     readFile: (path, encoding, callback) => {
//         fs.readFile(path, callback)
//     },

//     writeFile: (path, data, callback) => {
//         fs.writeFile(path, data, callback)
//     },

//     setConfigData: (key, value) => {
//         const localUserConfigStore = new store();
//         localUserConfigStore.set(key, value);
//     },

//     getConfigData: (key) => {
//         const localUserConfigStore = new store();

//         let configData = localUserConfigStore.get(key);
//         return configData;
//     }


// })

