const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('walker', {
  chat: (messages) => ipcRenderer.invoke('chat', { messages }),
  loadSave: () => ipcRenderer.invoke('load-save'),
  saveData: (data) => ipcRenderer.invoke('save-data', data)
})
