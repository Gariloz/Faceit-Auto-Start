# Faceit Auto Start

**Faceit Auto Start** is a userscript for Tampermonkey/Greasemonkey that automatically starts a new match after the current one finishes on FACEIT platform.

## Main Features

* Automatic match completion detection using time element monitoring
* Smart status recognition with multiple language support (English/Russian)
* AFK match cancellation detection - automatically starts new match when match is cancelled due to AFK players
* State persistence across browser sessions and page reloads
* Same-tab navigation - no new windows or tabs opened
* Automatic "Find match" button click if auto-join URL doesn't start search
* Configurable redirect delay before starting new match
* Toggle button for easy enable/disable functionality
* Works on all FACEIT match pages (*.faceit.com)
* Uses comprehensive time selectors for maximum compatibility and small window support
* Real-time monitoring with minimal resource usage
* Comprehensive error handling and recovery
* Modal dialog exclusion - ignores notifications and popups
* Small window support - works correctly even with minimized browser windows

## Installation

### Option 1: Without Extension (Quick Start)

1. Open any FACEIT match page (`/match/` or `/room/`)
2. Open browser console (`F12` or `Ctrl+Shift+J` / `Cmd+Option+J` on Mac)
3. Open `Faceit-Auto-Start.user.js` file and copy all code
4. **IMPORTANT**: Delete the first 9 lines (metadata starting with `// ==UserScript==` and ending with `// ==/UserScript==`)
5. Paste the remaining code (starting from line 11 with `(function() {`) into console and press `Enter`
6. Click the green "Включить авто-матч" button to activate

⚠️ **Note**: Script stops after page reload. You'll need to run it again.

### Option 2: With Tampermonkey/Greasemonkey (Recommended)

1. Install Tampermonkey or Greasemonkey browser extension
2. Download the `Faceit-Auto-Start.user.js` file
3. Click on the userscript file to install it in Tampermonkey
4. Navigate to any FACEIT match page
5. Click the "Включить авто-матч" button that appears in the top-right corner

✅ **Advantage**: Script works automatically on every page load.

## Usage

* Click the green "Включить авто-матч" button to activate the script
* Button changes color to indicate status:
  - **Green**: Script disabled
  - **Red**: Script active and monitoring
  - **Orange**: Match finished, redirecting
* Click the eye icon (👁️) on the button to hide it - a small eye icon will appear in its place
* Click the small eye icon to show the button again
* When match finishes or is cancelled, script automatically starts new match search
* Script remembers state across page reloads

## Changes in Version

* **Automatic match completion detection** - Monitors time element for finish status
* **Multi-language support** - Recognizes "finished", "завершен", "закончен", "окончен", "cancelled", "отменен", "отменён"
* **AFK cancellation detection** - Automatically detects and handles matches cancelled due to AFK players
* **State persistence** - Remembers enabled/disabled state across sessions using localStorage
* **Same-tab navigation** - Redirects in current tab, no popups
* **Auto-click Find match** - Automatically clicks "Find match" button if search doesn't start automatically
* **Search status monitoring** - Checks if match search is active and clicks button if needed
* **Comprehensive selectors** - 30+ time selectors for maximum compatibility
* **Small window support** - Works correctly with minimized browser windows
* **Modal exclusion** - Ignores notifications and popup dialogs to prevent false positives
* **Enhanced error handling** - Better recovery from various error states
* **Optimized performance** - Minimal CPU and memory usage
* **Multi-level element search** - Searches elements at different DOM levels for reliability

## GitHub

https://github.com/Gariloz/Faceit-Auto-Start

---

**Author:** Gariloz