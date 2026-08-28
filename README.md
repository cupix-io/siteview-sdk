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

For private Headless SiteView URLs, provide an auth value before connecting. Choose `API token` to append `cupix_api_token`, or `Access code` to append `access_code`. A 401 during initial load usually means the iframe was opened without a valid auth query and the browser's saved local session could not be refreshed.

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

// Cubemap rendering
SiteViewSDK.setPanoRenderingMode('CUBEMAP', 6144);
SiteViewSDK.setPanoRenderingMode('NORMAL');

// Annotation
SiteViewSDK.setActiveAnnotation(annotationId);
SiteViewSDK.loadAnnotationGroup([groupId1, groupId2]);

// Annotation User Color (local-only, not persisted)
SiteViewSDK.setAnnotationUserColor(annotationId, {
  foregroundColor: '#ffffff',
  backgroundColor: '#ff5722'
});
// Reset colors (null = reset, omit = keep current)
SiteViewSDK.setAnnotationUserColor(annotationId, {
  foregroundColor: null,
  backgroundColor: null
});
```
