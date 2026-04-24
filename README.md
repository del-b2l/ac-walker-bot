## Animal Crossing: Wild World Inspired Walker Chatbot 🐶

<img src="/media/preview.png" alt="Walker Bot Preview" width="400"/>

### Why?
I've been really into Animal Crossing lately. Been obsessing over this cute villager, Walker, wuh! 
Sometimes I get bored and don't have an emulator in reach or am too busy to get it all set up 
(controller and everything), so I built a little chatbot to keep me entertained during my 
work breaks + study seshs.

### Before You Start
Make sure you have these installed:
- Node.js (v18 or higher)
- A free Groq API key — sign up, go to API Keys, and create one

If you're on **Ubuntu/Linux**, run this first:
```
sudo apt-get install libatk-bridge2.0-0 libgtk-3-0 libgbm1 libnss3 libxss1 libasound2
```

### Installation
```
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ac-walker-bot.git
cd ac-walker-bot

# Install dependencies
npm install

# Start the app
npm start
```

### First Time Setup
When the app opens, you'll see a box asking for your **Groq API key**.
Paste it in - it starts with 'gsk..." - and hit the checkmark button.
Your key is saved locally on your machine only. Walker will remember it forever after that, wuh!

### Talking to Walker
- Type anything in the box at the bottom and press Enter
- Click Walker to say hi
- Use the quick chips for common things like asking for a quest or what he's up to
- Your friendship level grows the more you talk to him

### Things to Try!
| What to say | What happens |
| -------- | -------- |
| Do you have a quest for me? | Walker gives you a small in-game task |
| What are you up to today? | He'll probably mention food |
| Tell me about your house | He describes his cozy cabin interior |
| What's your favorite song? | Two Days Ago by K.K. Slider, obviously |
| Have you been to Nook's store? | Wild World conversation begins |

### Building it as a Standalone App
Don't want to run it from the terminal every time? Package it into a clickable app:
```
npm run build
```

Your app will appear in the dist/ folder as:
- .AppImage on Linux
- .exe installer on Windows

### Friendship Levels
- Strangers
- Acquaintances
- Pals
- Good Friends
- Best Friends

You can go from "somebody who just moved in" to someone he'd share his last Gyro with!

### Project Structure

```
ac-walker-bot/
├── main.js              # Electron main process + Groq API calls
├── preload.js           # Bridge between UI and Node.js
├── walker_lore.txt      # Walker's personality and Wild World context
├── renderer/
│   ├── index.html       # App window
│   ├── style.css        # Animal Crossing styling
│   └── app.js           # Chat logic and UI
└── package.json
```

---

### 🍄 Notes for Beginners
- Your save data (friendship level, API key) is stored locally in Electron's userData folder; never in the cloud
- Walker's memory resets each session, but friendship carries over ^^
- .env is not used: your key is saved securely through the app UI

> **plz never commit your API key to GitHub**

### 🎵 Credits

- !! **Walker and all Animal Crossing characters belong to Nintendo**
- This is a fan project made with love, **not for profit**
- Powered by [Groq](https://groq.com/) and [Electron](https://www.electronjs.org/)
- Villager lore sourced from [Nookipedia](https://nookipedia.com/wiki/Walker)