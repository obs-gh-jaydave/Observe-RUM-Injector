# Observe RUM Chrome Extension

This Chrome extension integrates Elastic APM Real User Monitoring (RUM) with Observe, allowing you to collect and analyze frontend performance data.

## Overview

The extension injects the Elastic APM RUM client into specified web pages and forwards telemetry data to your Observe instance. It handles:
- APM script injection
- Authentication with Observe
- Performance data collection
- Automatic data forwarding

## Installation

### For Users

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

### Configuration

1. Click the extension icon in Chrome
2. Enter your Observe credentials:
   - Tenant ID: Your Observe tenant identifier
   - Bearer Token: Your Observe authentication token
3. Click "Save"

## Customizing Monitored Sites

By default, the extension monitors:
- field-staging.sockshop.biz
- ycombinator.com

To monitor different sites:

1. Open `manifest.json`
2. Update the `host_permissions` and `matches` sections:

```json
{
    "host_permissions": [
        "https://*.your-site.com/*",
        "https://*.collect.observeinc.com/*"
    ],
    "content_scripts": [
        {
            "matches": [
                "https://*.your-site.com/*"
            ],
            "js": ["content.js"],
            "run_at": "document_start"
        }
    ],
    "web_accessible_resources": [{
        "resources": [
            "elastic-apm-rum.umd.min.js",
            "apm-init.js",
            "config-setter.js"
        ],
        "matches": [
            "https://*.your-site.com/*"
        ]
    }]
}
```

3. Reload the extension in `chrome://extensions/`

## Directory Structure

```
observe-rum-extension/
├── manifest.json          # Extension configuration
├── background.js         # Service worker for background tasks
├── content.js           # Content script for injection
├── config-setter.js     # Configuration management
├── apm-init.js         # APM initialization
├── popup.html          # Extension popup UI
├── popup.js           # Popup functionality
├── options.html       # Settings page
├── options.js        # Settings functionality
└── elastic-apm-rum.umd.min.js  # Elastic APM client
```

## How It Works

1. **Initial Setup**:
   - Extension is loaded into Chrome
   - User provides Observe credentials
   - Credentials are stored securely in extension storage

2. **Page Load**:
   - Extension detects when you visit a monitored site
   - Injects necessary scripts
   - Initializes APM with your credentials

3. **Data Collection**:
   - APM client collects performance data
   - Data is sent to your Observe instance
   - Authentication is handled automatically

## Development

### Prerequisites

- Chrome browser
- Basic understanding of Chrome extensions
- Observe account with proper credentials

### Local Development

1. Clone the repository:
```bash
git clone [repository-url]
cd observe-rum-extension
```

2. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the extension directory

3. Make changes to the code
4. Reload the extension to test changes

### Building for Production

1. Update version in `manifest.json`
2. Package the extension:
   - Zip all necessary files
   - Make sure to exclude any development files

## Troubleshooting

### Common Issues

1. **Extension Not Loading**:
   - Verify Developer mode is enabled
   - Check console for errors
   - Ensure all files are present

2. **Data Not Appearing in Observe**:
   - Verify credentials are correct
   - Check Network tab for API calls
   - Look for console errors

3. **Script Injection Fails**:
   - Check site's Content Security Policy
   - Verify site patterns in manifest.json
   - Look for injection errors in console

### Debugging

1. Open Chrome DevTools
2. Check Console for extension logs
3. Monitor Network tab for requests to Observe
4. Inspect extension's background page:
   - Go to `chrome://extensions`
   - Find your extension
   - Click "service worker" link

## Security Considerations

- Credentials are stored securely in Chrome's extension storage
- Only authorized domains can access injected scripts
- HTTPS is required for all connections
- Minimal permissions are requested
