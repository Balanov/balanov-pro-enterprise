const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('director', {
  isDesktop: true,
  research: input => ipcRenderer.invoke('director:research', { input }),
  generateHypotheses: constraints => ipcRenderer.invoke('enterprise:generate', constraints),
  getModels: () => ipcRenderer.invoke('enterprise:models'),
  setModel: model => ipcRenderer.invoke('enterprise:model', model),
  addDocuments: () => ipcRenderer.invoke('director:add-documents'),
  addFolder: () => ipcRenderer.invoke('director:add-folder'),
  forgetFolder: () => ipcRenderer.invoke('director:forget-folder'),
  advisor: payload => ipcRenderer.invoke('director:advisor', payload),
  resetSession: () => ipcRenderer.invoke('director:reset-session'),
  savePilot: opportunityId => ipcRenderer.invoke('director:save-pilot', opportunityId),
  saveProgram: scenarioId => ipcRenderer.invoke('director:save-program', scenarioId),
  openExternal: url => ipcRenderer.invoke('director:open-external', url),
  onProgress: callback => {
    const listener = (_event, progress) => callback(progress);
    ipcRenderer.on('director:progress', listener);
    return () => ipcRenderer.removeListener('director:progress', listener);
  },
});
