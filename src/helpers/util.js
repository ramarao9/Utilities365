const { shell } = window.require('electron').remote;


export function openWindow(url, useNativeChrome) {
    shell.openExternal(url)
}