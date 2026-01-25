const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  info: () => "Electron connected"
});
