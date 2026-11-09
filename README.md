# CupixWorks Headless SiteView SDK

CupixWorks Headless SiteView SDK enables third-party developers to embed the Headless SiteView within their applications using iframe. With this SDK, developers can

- Query document data (levels, captures, panos, BIMs, annotations, etc.) after the SiteView is loaded.
- Listen to events from the Headless SiteView (camera changes, pano transitions, annotation selection, etc.).
- Execute actions and control Headless SiteView behaviors (navigation, camera, annotations, display).

# Getting Started

## Presigned authentication

Open the viewer with `use_sdk_auth=1`, then authenticate without putting credentials in the iframe URL:

```javascript
await SiteViewSDK.init('viewer', 'https://TEAM.cupix.works/hsv/KEY?use_sdk_auth=1');
const result = await SiteViewSDK.authenticate({ client_id, timestamp, signature });
if (result.authenticated !== true) {
  console.error(result.errorMessage || result.error);
}
```

The viewer keeps the existing loading screen visible (without name/address until authentication succeeds) and does not load document data before validation succeeds.
Failures are returned to the host and can be retried with `authenticate()`. Success starts document loading;
listen for `DOCUMENT_LOADED` separately. Do not combine this mode with `presigned_mode=1` or presigned URL parameters.
See [the viewer authentication contract](../../dali/projects/app-headless-siteview/docs/API.md#진입-인증-옵션) for states and errors.

### Generate presigned credentials

`timestamp` is the **expiration time** as a Unix timestamp in **seconds**, passed to the SDK as a string.
The signature is a lowercase hexadecimal HMAC-SHA256 of `${reviewKey}\n${timestamp}` using the issued `client_secret` string as the key.
Use an actual newline between the review key and timestamp; do not hex-decode the secret.
The review key must match the `/hsv/{key}` URL passed to `init()`.

Generate credentials on the host application's server and return only `client_id`, `timestamp`, and `signature` to the browser:

```javascript
import { createHmac } from 'node:crypto';

function createCredential({ reviewKey, clientId, clientSecret, expiresInSeconds = 3600 }) {
  const timestamp = String(Math.floor(Date.now() / 1000) + expiresInSeconds);
  const signature = createHmac('sha256', clientSecret)
    .update(`${reviewKey}\n${timestamp}`)
    .digest('hex');

  return { client_id: clientId, timestamp, signature };
}
```

`client_id` and `client_secret` come from API Client creation or credential regeneration; an ordinary API token is not the signing secret.
A different review key or expiration time requires a new signature. Keep `client_secret` on the host server.
The backend checks expiration and signature and applies the API Client owner's permissions.

See [Playground README](https://github.com/cupix-io/siteview-sdk/blob/main/playground/README.md) for the full API reference.

# API Playground

Try the [live playground](https://cupix-io.github.io/siteview-sdk/) or run it locally:

```bash
npm install
npm run serve
```

Then open `http://localhost:8081` in your browser.

For SDK authentication, choose **Connection → SDK presigned**, click **Connect**, then enter Client ID, Timestamp, and Signature and click **Authenticate**. Connect adds `use_sdk_auth=1` and removes conflicting authentication query parameters. Credentials are not saved and authentication requests are redacted in the output panel.

API commands are grouped into collapsible sections. Search by button label or SDK method name to expand matching groups; clearing the search restores the previous expanded sections.

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
