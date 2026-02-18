# Zeq OS Mathematical Framework - Chrome Extension

A Chrome extension that acts as a mathematical intelligence middle layer between users and AI platforms. It processes user queries through the Zeq OS Mathematical Framework (1549 operators across 34 domains) before sending them to AI platforms.

## Features

- **Universal AI Platform Support**: Works with ChatGPT, Claude, Grok, and other AI platforms
- **Mathematical Framework Integration**: Processes all queries through 1549 operators
- **Automatic Interception**: Seamlessly intercepts input boxes and processes messages
- **Configurable**: Enable/disable per platform through extension popup
- **Non-intrusive**: Falls back to original message if framework processing fails

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension is now installed and active

## Usage

1. Navigate to any supported AI platform (ChatGPT, Claude, Grok, etc.)
2. Type your message as normal
3. When you submit (Enter or Send button), the extension automatically:
   - Captures your message
   - Processes it through the mathematical framework
   - Sends the framework-generated mathematical prompt (JSON) to the AI
4. The AI receives the structured mathematical representation instead of raw text

## Configuration

Click the extension icon to open the popup and configure:
- **Enable/Disable Framework**: Toggle the entire framework on/off
- **Platform Settings**: Enable/disable framework for specific platforms:
  - ChatGPT
  - Claude
  - Grok
  - Other AI Platforms (Perplexity, Groq, Poe, Bard, Gemini, etc.)

## How It Works

1. **Input Detection**: Extension detects input boxes on AI platforms
2. **Message Interception**: Captures user message before submission
3. **Framework Processing**: 
   - Detects domains from query
   - Selects relevant operators (1549 available)
   - Executes operators and generates mathematical state
   - Creates mathematical prompt (JSON format)
4. **Message Replacement**: Replaces input with mathematical prompt
5. **Submission**: Triggers normal submission flow

## Framework Output Format

The framework generates a JSON structure containing:
- Original query
- Detected domains
- Active operators with equations
- Master sum and master equation
- Mathematical state (information integrity, cross-domain harmony, etc.)
- Truth vector
- Transform matrix
- Seven-step wizard breakdown

## Supported Platforms

- **ChatGPT** (chat.openai.com)
- **Claude** (claude.ai)
- **Grok** (x.com/grok, twitter.com/grok)
- **DeepSeek** (chat.deepseek.com, deepseek.com)
- **Perplexity** (perplexity.ai)
- **Groq** (groq.com)
- **Poe** (poe.com)
- **Bard/Gemini** (bard.google.com, gemini.google.com)
- **Universal fallback** for other AI platforms

## Technical Details

- **Manifest Version**: 3
- **Framework Version**: 1.287 Hz
- **Content Scripts**: Platform-specific scripts for optimal compatibility
- **Background Service Worker**: Manages settings and cross-tab communication
- **Storage**: Uses Chrome sync storage for settings persistence

## Development

### File Structure
```
chrome-extension/
├── manifest.json                 # Extension configuration
├── background/
│   └── service-worker.js        # Background service worker
├── content/
│   ├── chatgpt.js              # ChatGPT-specific script
│   ├── claude.js               # Claude-specific script
│   ├── grok.js                 # Grok-specific script
│   └── universal.js            # Universal fallback script
├── lib/
│   └── zeq-mathematical-framework.js  # Framework library
├── popup/
│   ├── popup.html              # Extension popup UI
│   ├── popup.js                # Popup logic
│   └── popup.css               # Popup styles
└── icons/
    ├── icon16.png              # 16x16 icon
    ├── icon48.png              # 48x48 icon
    └── icon128.png             # 128x128 icon
```

### Testing

1. Load extension in Chrome (Developer mode)
2. Navigate to a supported AI platform
3. Open browser console (F12) to see framework processing logs
4. Type a message and submit
5. Check console for "Zeq OS: Processing message..." logs
6. Verify the AI receives the mathematical prompt JSON

## Troubleshooting

- **Extension not working**: Check browser console for errors
- **Framework not processing**: Verify extension is enabled in popup settings
- **Platform not detected**: Check if platform URL matches manifest.json host_permissions
- **Input box not found**: Platform may have changed selectors - check console for detection logs

## License

Part of the Zeq OS Mathematical Framework project.

## Version

1.287.0 - Initial release

