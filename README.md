
# VTOP Session Keeper

A lightweight browser extension for VIT VTOP that periodically navigates an open VTOP tab to its Content page in an attempt to prevent automatic session logout.

## Features

- Automatically navigates to the VTOP Content page every 9 minutes.
- Works in the background while you use other browser tabs.
- Does not switch focus to the VTOP tab.
- Does not generate random mouse movements or keyboard events.
- Designed to work with multiple browsers that support the required extension APIs.

## Supported Browsers

The extension is intended for use with:

- Google Chrome
- Microsoft Edge
- Zen Browser
- Mozilla Firefox
- Brave
- Opera
- Other Chromium-based browsers that support browser extensions

**Note:** Actual compatibility depends on the browser's Manifest V3 support and extension APIs. Some browsers may require manifest or background-script adjustments.

## Target URL

https://vtop.vit.ac.in/vtop/content

## How It Works

The extension periodically checks for an open VTOP tab and navigates it to the Content page at 9-minute intervals.

This is intended to register activity through normal page navigation rather than simulated user interactions.

The navigation happens in the background without switching your currently active tab.

**Important:** VTOP may not consider page navigation sufficient to reset its server-side inactivity timeout. Therefore, this extension cannot guarantee that you will remain logged in.

## Installation

### Google Chrome

1. Download or clone this repository.
2. Extract the ZIP archive.
3. Open `chrome://extensions/`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extension folder containing `manifest.json`.

### Microsoft Edge

1. Download or clone this repository.
2. Extract the ZIP archive.
3. Open `edge://extensions/`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extension folder containing `manifest.json`.

### Zen Browser

1. Download or clone this repository.
2. Extract the ZIP archive.
3. Open `about:debugging#/runtime/this-firefox`.
4. Select **This Firefox**.
5. Click **Load Temporary Add-on**.
6. Select the `manifest.json` file.

### Mozilla Firefox

1. Download or clone this repository.
2. Extract the ZIP archive.
3. Open `about:debugging#/runtime/this-firefox`.
4. Select **This Firefox**.
5. Click **Load Temporary Add-on**.
6. Select the `manifest.json` file.

Note: Firefox and Zen may require a different background configuration from Chromium browsers. Temporary installations may also need to be loaded again after restarting the browser.

## Usage

1. Open VTOP and log in normally.
2. Keep at least one VTOP tab open.
3. Enable the extension.
4. Continue using other browser tabs normally.

The extension attempts to navigate the VTOP tab to its Content page every 9 minutes without switching your active tab.

## Compatibility

This project targets browsers supporting the required WebExtension APIs.

Browser-specific differences in Manifest V3, background scripts, alarms, and tab management may require adjustments before the extension works correctly in every browser.

## Disclaimer

This is an unofficial utility developed for personal convenience. It is not affiliated with, endorsed by, or maintained by VIT or VTOP.

Use responsibly and in accordance with your institution's policies.
