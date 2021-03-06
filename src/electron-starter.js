// Modules to control application life and create native browser window
const { app, BrowserWindow , Menu} = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");





// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {

  


  // Create the browser window.
  if (isDev) {

  
    //the below will show some security errors but since this is just local development it should be fine.
    mainWindow = new BrowserWindow({
      webPreferences: { webSecurity: false, nodeIntegration: true },
      width: 1100,
      height: 768,
      allowRunningInsecureContent: true
    });

    mainWindow.loadURL("http://localhost:3000");


    mainWindow.webContents.on("will-redirect", (event, newUrl) => {
      console.log("will-redirect" + newUrl);
    });
  
    mainWindow.webContents.on("did-redirect-navigation", (event, newUrl) => {
      console.log("did-redirect-navigation" + newUrl);
    });
  
    mainWindow.webContents.on("did-navigate", (event, newUrl) => {
      console.log("did-navigate" + newUrl);
    });
  
    mainWindow.webContents.on("did-navigate-in-page", (event, newUrl) => {
      console.log("did-navigate-in-page" + newUrl);
    });
  
    // Open the DevTools.
     mainWindow.webContents.openDevTools()
  } else {

    Menu.setApplicationMenu(null);

    mainWindow = new BrowserWindow({
      width: 1100,
      height: 768,
      webPreferences: { nodeIntegration: true },
      icon: path.join(__dirname, '../build/u365.ico')
    });

    let filePath = path.join(__dirname, '../build/index.html')
    mainWindow.loadFile(filePath);

   
  }




  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});


app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)

    console.log(parsedUrl);
    // if (parsedUrl.origin !== 'https://example.com') {
    //   event.preventDefault()
    // }
  })
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
