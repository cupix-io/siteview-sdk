# CupixWorks Headless SiteView SDK

CupixWorks Headless SiteView SDK enables third-party developers to embed the Headless SiteView within their applications using iframe. With this SDK, developers can

- Query document data (levels, captures, panos, BIMs, annotations, etc.) after the SiteView is loaded.
- Listen to events from the Headless SiteView (camera changes, pano transitions, annotation selection, etc.).
- Execute actions and control Headless SiteView behaviors (navigation, camera, annotations, display).

# Getting Started

See [Playground README](https://github.com/cupix-io/siteview-sdk/blob/main/playground/README.md) for the full API reference.

# API Playground

Try the [live playground](https://cupix-io.github.io/siteview-sdk/) or run it locally:

```bash
npm install
npm run serve
```

Then open `http://localhost:8081` in your browser.

# Quick Start

### Include the SDK library

```html
<script src="siteview-sdk.js"></script>
```

### Add a container div

```html
<div id="cupix-container" style="width:100%; height:100%;"></div>
```

### Initialize

```js
SiteViewSDK.init('cupix-container', 'https://{team}.cupix.com/hsv/{siteviewKey}', {
  apiToken: 'YOUR_API_TOKEN'
});
```

### Listen for messages

```js
window.addEventListener('message', (event) => {
  const response = event.data;
  if (response.header !== 'CUPIXWORKS_HEADLESS_VIEWER_API') return;

  const responseType = response.responseType;
  const data = response.response;
  console.log(responseType, data);
});
```

### Call APIs

```js
// Query
const doc = await SiteViewSDK.getDocument();
const level = await SiteViewSDK.getActiveLevel();

// Navigate
SiteViewSDK.changeLevelCapture(levelId, captureId);
SiteViewSDK.changePano(panoId);

// Camera
SiteViewSDK.setCameraRotate('LEFT', 15);
SiteViewSDK.setCameraFov(60);

// Annotation
SiteViewSDK.setActiveAnnotation(annotationId);
SiteViewSDK.loadAnnotationGroup([groupId1, groupId2]);
```
