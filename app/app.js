const path = require("path");
global.OS = {win32: "windows", darwin: "macOS"}[process.platform] || "linux";
global.DESKTOP_PATH = require("path").join(require("os").homedir(), "Desktop");
global.HOMEDIR = require("os").homedir();
global.TMPDIR = require("os").tmpdir();
const fs = require("fs");
const config = require("./config.json");

(async()=>{
    await new Promise(resolve => fs.rm(path.join(TMPDIR, "screenshotApp"), {recursive: true}, resolve));
    fs.mkdirSync(path.join(TMPDIR, "screenshotApp"));
    const electron = require("electron");
    const {app, BrowserWindow, globalShortcut} = electron;
    global.APP_PATH = app.getPath("userData");
    const config = require("./config.json");
    const screenshotDesktop = require("screenshot-desktop");

    async function screenshot(currentWindow) {
        console.log("Taking a screenshot!");
        const options = {format: config.format};
        if (currentWindow) {
            const displays = await screenshotDesktop.listDisplays();
            options.screen = displays[displays.length - 1].id;
        }
        const imgBuffer = await screenshotDesktop(options);
        const browser = new BrowserWindow({
            show: false,
            frame: false
        });
        browser.setMenu(null);
        browser.setTitle("Screenshot");
        browser.maximize();
        const p = path.join(TMPDIR, "screenshotApp", Date.now() + ".png");
        fs.writeFileSync(p, imgBuffer);
        await browser.loadURL(`file://${path.join(__dirname, "index.html")}?path=${encodeURI(p)}`);
        browser.webContents.on("did-finish-load", () => browser.show());
        global.lastBrowser = browser;
    }

    app.whenReady().then(async () => {
        globalShortcut.register("F5", console.info);
        globalShortcut.unregister("F5");
        globalShortcut.register(config.shortcutFull, () => screenshot());
        globalShortcut.register(config.shortcutWindow, () => screenshot());
        globalShortcut.register("CommandOrControl+D", () => lastBrowser && lastBrowser.webContents.toggleDevTools());
        console.log("Screenshot app is ready!");
    });
    app.on("will-quit", ev => ev.preventDefault());
})();