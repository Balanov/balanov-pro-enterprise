const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');

const sessions = new Map();
const sessionFor = event => sessions.get(event.sender.id) || { modelPreference: null };

async function analyzeFor(event, research) {
  const session = sessionFor(event);
  const { analyzeWithQwen } = await import('./qwen.mjs');
  const analysis = await analyzeWithQwen(research, {
    userDataPath: app.getPath('userData'),
    modelPreference: session.modelPreference,
    onProgress: progress => event.sender.send('director:progress', progress),
  });
  const { createEnterpriseView } = await import('../shared/enterprise-view.js');
  const result = { research, analysis, enterprise: createEnterpriseView({ research, analysis }, research.originalInput || research.requestedUrl) };
  sessions.set(event.sender.id, { ...session, result });
  return result;
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1480, height: 940, minWidth: 1080, minHeight: 720,
    backgroundColor: '#f4f6f8', title: 'Balanov.PRO Enterprise',
    autoHideMenuBar: true, show: false,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  window.once('ready-to-show', () => window.show());
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  if (process.env.VITE_DEV_SERVER_URL) window.loadURL(process.env.VITE_DEV_SERVER_URL);
  else if (app.isPackaged || process.env.BALANOV_LOAD_DIST === '1') window.loadFile(path.join(__dirname, '..', 'dist-enterprise', 'index.html'), process.env.BALANOV_DEMO === '1' ? { search: 'demo=1' } : undefined);
  else window.loadURL('http://127.0.0.1:5173');
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  ipcMain.handle('director:research', async (event, payload) => {
    const input = String(typeof payload === 'string' ? payload : payload?.input || '').trim().slice(0, 500);
    if (!input) throw new Error('Укажите организацию или сайт');
    const { researchEntity } = await import('./research.mjs');
    const research = await researchEntity(input, progress => event.sender.send('director:progress', progress));
    return analyzeFor(event, research);
  });
  ipcMain.handle('enterprise:generate', async (event, constraints = {}) => {
    const session = sessionFor(event);
    if (!session.result) throw new Error('Сначала выполните проверку организации');
    const safe = {
      goal: String(constraints.goal || '').trim().slice(0, 500),
      budget: String(constraints.budget || '').trim().slice(0, 100),
      timeframe: String(constraints.timeframe || '').trim().slice(0, 100),
      deployment: ['local', 'private-cloud', 'any'].includes(constraints.deployment) ? constraints.deployment : 'local',
    };
    if (!safe.goal) throw new Error('Опишите цель новой гипотезы');
    const research = { ...session.result.research, constraints: safe };
    return analyzeFor(event, research);
  });
  ipcMain.handle('enterprise:models', async event => {
    const { listOllamaModels } = await import('./qwen.mjs');
    const models = await listOllamaModels();
    return { models, selected: sessionFor(event).modelPreference, embeddedAvailable: true };
  });
  ipcMain.handle('enterprise:model', async (event, model) => {
    const value = String(model || '').trim();
    const { listOllamaModels } = await import('./qwen.mjs');
    const models = await listOllamaModels();
    if (value !== 'embedded' && !models.some(item => item.name === value)) throw new Error('Выбранная модель недоступна');
    sessions.set(event.sender.id, { ...sessionFor(event), modelPreference: value === 'embedded' ? null : value });
    return { selected: value || null };
  });
  ipcMain.handle('director:add-documents', async event => {
    const session = sessionFor(event);
    const current = session.result;
    if (!current) throw new Error('Сначала выполните проверку организации');
    const picked = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Документы', extensions: ['txt', 'md', 'csv', 'json', 'pdf', 'docx'] }] });
    if (picked.canceled || !picked.filePaths.length) return { status: 'canceled' };
    const { readLocalDocuments } = await import('./files.mjs');
    const documents = await readLocalDocuments(picked.filePaths);
    if (!documents.length) throw new Error('Не удалось извлечь текст из выбранных документов');
    const existing = new Set(current.research.sources.map(source => source.url));
    const additions = documents.filter(document => !existing.has(document.url));
    if (!additions.length) return { status: 'completed', result: current, addedCount: 0 };
    const firstId = current.research.sources.filter(source => source.kind === 'local-document').length + 1;
    const research = { ...current.research, sources: [...current.research.sources, ...additions.map((document, index) => ({ ...document, id: `local-${firstId + index}` }))] };
    const result = await analyzeFor(event, research);
    return { status: 'completed', result, addedCount: additions.length };
  });
  ipcMain.handle('director:add-folder', async event => {
    const session = sessionFor(event);
    const current = session.result;
    if (!current) throw new Error('Сначала выполните проверку организации');
    const picked = await dialog.showOpenDialog({ title: 'Выберите рабочую папку', buttonLabel: 'Проверить папку', properties: ['openDirectory'] });
    if (picked.canceled || !picked.filePaths.length) return { status: 'canceled' };
    event.sender.send('director:progress', { stage: 'pages', message: 'Считаю документы только в выбранной папке' });
    const { scanLocalFolder, readLocalDocuments } = await import('./files.mjs');
    const scan = await scanLocalFolder(picked.filePaths[0]);
    if (!scan.filePaths.length) throw new Error('В выбранной папке нет поддерживаемых документов размером до 8 МБ');
    const confirmation = await dialog.showMessageBox({
      type: 'question', title: 'Разрешить чтение документов?',
      message: `Найдено документов: ${scan.totalSupported}`,
      detail: `${scan.root}\n\nПрограмма прочитает до ${scan.filePaths.length} самых свежих файлов. Только эта папка, только чтение, без отправки документов в облачную модель.`,
      buttons: ['Отмена', 'Разрешить и изучить'], defaultId: 0, cancelId: 0, noLink: true,
    });
    if (confirmation.response !== 1) return { status: 'canceled' };
    const documents = await readLocalDocuments(scan.filePaths);
    if (!documents.length) throw new Error('Не удалось извлечь текст из выбранных документов');
    const research = { ...current.research, sources: [...current.research.sources.filter(source => source.kind !== 'local-document'), ...documents.map((document, index) => ({ ...document, id: `local-${index + 1}` }))] };
    const result = await analyzeFor(event, research);
    return { status: 'completed', result, addedCount: documents.length };
  });
  ipcMain.handle('director:forget-folder', async event => {
    const current = sessionFor(event).result;
    if (!current) throw new Error('Нет данных исследования');
    const sources = current.research.sources.filter(source => source.kind !== 'local-document');
    const removedCount = current.research.sources.length - sources.length;
    if (!removedCount) return { status: 'completed', result: current, removedCount: 0 };
    const result = await analyzeFor(event, { ...current.research, sources });
    return { status: 'completed', result, removedCount };
  });
  ipcMain.handle('director:advisor', async (event, payload = {}) => {
    const session = sessionFor(event);
    const current = session.result;
    if (!current) throw new Error('Сначала выполните проверку организации');
    const question = String(payload.question || '').trim().slice(0, 1600);
    if (!question) throw new Error('Напишите вопрос советнику');
    const history = (Array.isArray(payload.history) ? payload.history : []).slice(-8).map(message => ({ role: message.role === 'user' ? 'user' : 'advisor', text: String(message.text || message.answer || '').slice(0, 1400) }));
    const opportunity = current.analysis.opportunities.find(item => item.id === payload.opportunityId) || current.analysis.opportunities[0];
    const { chatWithQwen } = await import('./qwen.mjs');
    return chatWithQwen({ question, history, research: current.research, analysis: current.analysis, opportunity, userDataPath: app.getPath('userData'), modelPreference: session.modelPreference });
  });
  ipcMain.handle('director:reset-session', event => {
    sessions.delete(event.sender.id);
    return { status: 'completed' };
  });
  ipcMain.handle('director:save-pilot', async (event, opportunityId) => {
    const current = sessionFor(event).result;
    if (!current) throw new Error('Нет данных исследования');
    const opportunity = current.enterprise.hypotheses.find(item => item.id === opportunityId);
    if (!opportunity) throw new Error('Выбранная гипотеза больше недоступна');
    const { buildEnterpriseBrief } = await import('../shared/enterprise-brief.js');
    const content = buildEnterpriseBrief(current.enterprise, opportunity);
    const picked = await dialog.showSaveDialog({ title: 'Сохранить управленческий бриф', defaultPath: 'Balanov-PRO-Enterprise-brief.md', filters: [{ name: 'Markdown', extensions: ['md'] }] });
    if (picked.canceled || !picked.filePath) return { status: 'canceled', saved: false };
    await fs.writeFile(picked.filePath, content, 'utf8');
    return { status: 'completed', saved: true, path: picked.filePath };
  });
  ipcMain.handle('director:open-external', async (_event, url) => {
    const value = String(url || '');
    const allowedMail = /^mailto:office@balanov\.pro\?/i.test(value);
    if (!/^https:\/\//.test(value) && !allowedMail) throw new Error('Разрешены только HTTPS-ссылки и обращение в Balanov.PRO');
    await shell.openExternal(value);
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
