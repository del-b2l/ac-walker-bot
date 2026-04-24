// conversation history (kept in memory per session)
const history = []
let isTyping = false
let save = { friendship: 0, quests: [], playerName: 'neighbor' }

// friendship tier labels
const TIERS = [
  { min: 0, max: 3, label: 'Strangers', pct: 5 },
  { min: 4, max: 8, label: 'Acquaintances', pct: 25 },
  { min: 9, max: 15, label: 'Pals', pct: 50 },
  { min: 16, max: 25, label: 'Good Friends', pct: 72 },
  { min: 26, max: 999, label: 'Best Friends!', pct: 100 }
]

function getTier(count) {
  return TIERS.find(t => count >= t.min && count <= t.max) || TIERS[0]
}

function updateFriendshipUI(count) {
  const tier = getTier(count)
  document.getElementById('friendBar').style.width = tier.pct + '%'
  document.getElementById('friendText').textContent = tier.label
}

// ── DOM helpers ──────────────────────────────────────────────

function scrollBottom() {
  const area = document.getElementById('chatArea')
  area.scrollTop = area.scrollHeight
}

function addMessage(role, text) {
  const area = document.getElementById('chatArea')
  const row = document.createElement('div')
  row.className = `msg-row ${role === 'user' ? 'you' : 'walker'}`

  const avatarClass = role === 'user' ? 'avatar you-av' : 'avatar walker-av'
  const avatarInner = ''
  const bubbleClass = role === 'user' ? 'bubble you-bubble' : 'bubble walker-bubble'

  row.innerHTML = `
    <div class="${avatarClass}">${avatarInner}</div>
    <div class="${bubbleClass}">${escHtml(text)}</div>
  `
  area.appendChild(row)
  scrollBottom()
}

function escHtml(str) {
  const safe = String(str ?? '')
  let escaped = safe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Convert Markdown **bold** to <b>bold</b>
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')

  // If the prompt forces <b> tags, convert the escaped versions back into valid HTML
  escaped = escaped.replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>')

  return escaped
}

function showTyping() {
  const area = document.getElementById('chatArea')
  const row = document.createElement('div')
  row.id = 'typingRow'
  row.className = 'msg-row walker'
  row.innerHTML = `
    <div class="avatar walker-av"></div>
    <div class="typing-bubble">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>
  `
  area.appendChild(row)
  scrollBottom()
}

function hideTyping() {
  const el = document.getElementById('typingRow')
  if (el) el.remove()
}

function setWalkerTalking(on) {
  const wrap = document.getElementById('walkerWrap')
  if (wrap) {
    if (on) wrap.classList.add('talking')
    else wrap.classList.remove('talking')
  }
}

function popSpeechBubble(text) {
  const bub = document.getElementById('speechBubble')
  if (bub) {
    bub.textContent = text
    bub.classList.remove('hidden')
    setTimeout(() => bub.classList.add('hidden'), 2200)
  }
}

// ── Send message ──────────────────────────────────────────────

async function sendMessage() {
  if (isTyping) return
  const input = document.getElementById('msgInput')
  const text = input.value.trim()
  if (!text) return

  input.value = ''
  addMessage('user', text)
  history.push({ role: 'user', content: text })

  isTyping = true
  document.getElementById('sendBtn').disabled = true
  setWalkerTalking(true)
  showTyping()

  try {
    const result = await window.walker.chat(history)

    hideTyping()

    if (result?.error) {
      addMessage('assistant', `Wuh... I couldn't answer, arf. (${result.error})`)
    } else {
      const reply = String(result?.reply || "Wuh... I got distracted, arf. Could you say that again?")
      addMessage('assistant', reply)
      history.push({ role: 'assistant', content: reply })

      // pop a short speech snippet above Walker
      const snippet = reply.split('.')[0].slice(0, 40) + (reply.length > 40 ? '...' : '')
      popSpeechBubble(snippet)

      // update friendship
      save.friendship = result?.friendship || (save.friendship + 1)
      updateFriendshipUI(save.friendship)
      await window.walker.saveData({ friendship: save.friendship })
    }
  } catch (_) {
    hideTyping()
    addMessage('assistant', "Wuh... I tripped over my thoughts, arf. Try again in a sec.")
  } finally {
    setWalkerTalking(false)
    isTyping = false
    document.getElementById('sendBtn').disabled = false
    input.focus()
  }
}

function quickSend(msg) {
  document.getElementById('msgInput').value = msg
  sendMessage()
}

// ── Enter key ────────────────────────────────────────────────

document.getElementById('msgInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage()
})

// ── Click Walker to say hi ───────────────────────────────────

const walkerWrap = document.getElementById('walkerWrap')
if (walkerWrap) {
  walkerWrap.addEventListener('click', () => {
    if (!isTyping) {
      document.getElementById('msgInput').value = 'Hey Walker!'
      sendMessage()
    }
  })
}

// ── Load save on startup ─────────────────────────────────────

; (async () => {
  save = await window.walker.loadSave()
  updateFriendshipUI(save.friendship || 0)
})()
