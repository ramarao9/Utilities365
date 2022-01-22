const fs = window.require('fs');
const electron = window.require('electron');


const getCacheLocation = async () => {

    let userDataPath = "";
    if (electron.ipcRenderer) {
        userDataPath = await (electron.ipcRenderer).invoke('get-user-data-path');
    }

    console.log("user data path is " + userDataPath);
    return `${userDataPath}\\cache.json`;
}

const beforeCacheAccess = async (cacheContext: any) => {
    let cacheLocation = await getCacheLocation();

    return new Promise<void>(async (resolve, reject) => {
        if (fs.existsSync(cacheLocation)) {
            fs.readFile(cacheLocation, "utf-8", (err: any, data: any) => {
                if (err) {
                    reject();
                } else {
                    cacheContext.tokenCache.deserialize(data);
                    resolve();
                }
            });
        } else {
            fs.writeFile(cacheLocation, cacheContext.tokenCache.serialize(), (err: any) => {
                if (err) {
                    reject();
                }
            });
        }
    });
};

const afterCacheAccess = async (cacheContext: any) => {
    let cacheLocation = await getCacheLocation();
    if (cacheContext.cacheHasChanged) {
        await fs.writeFile(cacheLocation, cacheContext.tokenCache.serialize(), (err: any) => {
            if (err) {
                console.log(err);
            }
        });
    }
};

export const cachePlugin = {
    beforeCacheAccess,
    afterCacheAccess
}