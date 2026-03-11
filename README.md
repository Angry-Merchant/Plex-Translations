# 🌐 Translate Addon — Discord Bot

A Discord bot addon that auto-translates messages to your preferred language using slash commands.

## Features

- `/translate message` — Translates the previous message in the channel
- `/translate set` — Set your preferred output language (per user)
- `/translate config` — View your current translation settings
- Supports **20 languages** with auto-detection of the source language

## Supported Languages

English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese (Simplified), Arabic, Hindi, Dutch, Polish, Turkish, Swedish, Vietnamese, Thai, Greek, Czech

## Installation

1. Copy the `translate` folder into your bot's `addons/` directory:
   ```
   your-bot/
   └── addons/
       └── translate/
           ├── index.js
           └── package.json
   ```

2. Install dependencies inside the `translate` folder:
   ```bash
   cd addons/translate
   npm install
   ```

3. Make sure your bot loads addons from the `addons/` directory.

## Usage

| Command | Description |
|---|---|
| `/translate message` | Translates the last message in the channel |
| `/translate set language:French` | Sets your output language to French |
| `/translate config` | Shows your current language settings |

## Dependencies

- [discord.js](https://discord.js.org/) v14+
- [translate-google](https://www.npmjs.com/package/translate-google)
