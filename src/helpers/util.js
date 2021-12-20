
const electron = window.require('electron');

export function openWindow(url, useNativeChrome) {

    electron.shell.openExternal(url);


}