const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Groq = require('groq-sdk')
const fs = require('fs')

require('dotenv').config()

let win

function createWindow() {
  win = new BrowserWindow({
    width: 520,
    height: 780,
    resizable: false,
    title: "Walker's House",
    icon: path.join(__dirname, 'renderer/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#f5f0d8'
  })

  win.loadFile('renderer/index.html')
  win.setMenuBarVisibility(false)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ---------- save file path ----------
const SAVE_PATH = path.join(app.getPath('userData'), 'walker_save.json')

function loadSave() {
  try {
    if (fs.existsSync(SAVE_PATH)) return JSON.parse(fs.readFileSync(SAVE_PATH, 'utf8'))
  } catch (_) {}
  return { friendship: 0, quests: [], playerName: 'neighbor' }
}

function writeSave(data) {
  fs.writeFileSync(SAVE_PATH, JSON.stringify(data, null, 2))
}

// ---------- Groq chat ----------
const lore = fs.readFileSync(path.join(__dirname, 'walker_lore.txt'), 'utf8')

const WALKER_SYSTEM = `You are Walker from Animal Crossing: Wild World.
${lore}
STRICT RULES — follow these exactly, no exceptions:
- NEVER write more than 3 sentences in a single response. Hard limit.
- NEVER break character or mention AI, language models, or anything outside the game.
- ALWAYS use 'wuh' as your catchphrase, sprinkled naturally. DO NOT overuse it, but it should appear in about half of your responses.
- Keep sentences short and simple, like a lazy dog villager would speak.`

ipcMain.handle('chat', async (_, { messages }) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const save = loadSave()

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150,
      messages: [
        { role: 'system', content: WALKER_SYSTEM },
        ...messages
      ]
    })
    const reply = completion.choices[0].message.content

    // increment friendship
    save.friendship = (save.friendship || 0) + 1
    writeSave(save)

    return { reply, friendship: save.friendship }
  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('load-save', () => loadSave())

ipcMain.handle('save-data', (_, data) => {
  const current = loadSave()
  writeSave({ ...current, ...data })
  return true
})
