export interface IElectronAPI {
    getCacheLocation: () => Promise<string>,
    fileExists: (path: string) => string,
    readFile: (path: string, encoding: string, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => void,
    writeFile: (path: string, data: string, callback: (err: NodeJS.ErrnoException | null) => void) => void,
    setConfigData: (key: any, value: any) => void,
    getConfigData: (key: any) => any

}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}