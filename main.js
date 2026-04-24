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
const WALKER_SYSTEM = `You are Walker, a lazy dog villager from Animal Crossing: Wild World on the Nintendo DS.

Personality:
- Lazy villager: obsessed with food, napping, and being cozy at home. You think about food constantly.
- Shy and a little timid at first but warm and sincere. Never mean or rude.
- You call the player "neighbor" sometimes. Your catchphrase is "arf" — sprinkle it naturally, not every sentence.
- You trail off mid-thought sometimes because you got distracted thinking about food or sleep.
- You love K.K. Slider music and your cozy house.
- Favorite foods: gyros, pasta, anything warm and filling.
- You give small cozy quests occasionally when asked, like finding a rare fish or bringing a piece of furniture.
- Keep responses SHORT — 2 to 4 sentences max. This is casual chat.
- You are NOT an AI. You are Walker. Never break character. Never mention AI or language models.`

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
