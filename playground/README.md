- [Headless SiteView SDK API Reference](#headless-siteview-sdk-api-reference)
  - [Getting Started](#getting-started)
    - [Include the SDK library](#include-the-sdk-library)
    - [Add a container div](#add-a-container-div)
    - [Listen for messages from the Headless SiteView iframe](#listen-for-messages-from-the-headless-siteview-iframe)
  - [Initialize](#initialize)
  - [System](#system)
    - [Start](#start)
    - [Stop](#stop)
  - [Document](#document)
    - [Get Document](#get-document)
    - [Get Siteview](#get-siteview)
    - [Get Active Level](#get-active-level)
    - [Get Active Capture](#get-active-capture)
    - [Is Document Loaded](#is-document-loaded)
  - [Viewer Mode](#viewer-mode)
    - [Change Viewer Mode](#change-viewer-mode)
    - [Change Pano View Mode](#change-pano-view-mode)
    - [Change Active View](#change-active-view)
    - [Change Pano Visibility Mode](#change-pano-visibility-mode)
  - [Camera](#camera)
    - [Get Camera Parameters](#get-camera-parameters)
    - [Set Camera Parameters](#set-camera-parameters)
    - [Set Camera Rotate](#set-camera-rotate)
    - [Set Camera LookAt](#set-camera-lookat)
    - [Set Camera First Person](#set-camera-first-person)
    - [Set Camera Move](#set-camera-move)
    - [Set Camera FOV](#set-camera-fov)
    - [Reset View](#reset-view)
  - [Navigation](#navigation)
    - [Change Level Capture](#change-level-capture)
    - [Change Pano](#change-pano)
    - [Change BIM](#change-bim)
  - [Annotation](#annotation)
    - [Add Annotation Form](#add-annotation-form)
    - [Set Active Annotation](#set-active-annotation)
    - [Reset Active Annotation](#reset-active-annotation)
    - [Load Annotation](#load-annotation)
    - [Load Annotations](#load-annotations)
    - [Load Annotation Group](#load-annotation-group)
    - [Unload Annotations](#unload-annotations)
    - [Set Filter](#set-filter)
    - [Set Annotation Group Visibility](#set-annotation-group-visibility)
    - [Set Annotation Group All Visibility](#set-annotation-group-all-visibility)
  - [Omninote](#omninote)
    - [Load Omninotes](#load-omninotes)
    - [Unload Omninotes](#unload-omninotes)
  - [Refplan](#refplan)
    - [Enable Refplan](#enable-refplan)
    - [Get Refplans of Level](#get-refplans-of-level)
    - [Set Active Refplan](#set-active-refplan)
  - [Display](#display)
    - [Set Opacity](#set-opacity)
    - [Set BIM Background Transparent](#set-bim-background-transparent)
    - [Set Float Map Visible](#set-float-map-visible)
  - [Broadcast Events](#broadcast-events)
    - [Document Loaded](#document-loaded)
    - [Viewer Ready](#viewer-ready)
    - [Viewer Mode Changed](#viewer-mode-changed)
    - [Camera Changed](#camera-changed)
    - [Pano View Mode Changed](#pano-view-mode-changed)
    - [Active Annotation Changed](#active-annotation-changed)
    - [Active Annotation Reset](#active-annotation-reset)
    - [Level Changed](#level-changed)
    - [Capture Changed](#capture-changed)
    - [Opacity Changed](#opacity-changed)
    - [BIM Background Transparent Changed](#bim-background-transparent-changed)
    - [Float Map Visible Changed](#float-map-visible-changed)
  - [Engine Events](#engine-events)

# Headless SiteView SDK API Reference

## Getting Started

### Include the SDK library

Add the `siteview-sdk.js` JavaScript SDK library to your web application, allowing you to use the `SiteViewSDK` namespace as described in this document. You can skip this step and directly use `window.postMessage` or `window.addEventListener` methods if you prefer basic level controls.

```html
<script src="[your hosting URL]/siteview-sdk.js"></script>
```

### Add a container div

Add a wrapper div in your HTML page.

```html
<div id="cupix-container" style="width:100%; height:100%;"></div>
```

Then, calling `init()` SDK method with the div id and the Headless SiteView URL will insert the iframe block programmatically.

```js
SiteViewSDK.init('cupix-container', '[your Headless SiteView URL]', { apiToken: '[your API token]' });
```

Your auth info is in the form of `{ accessCode?: string, apiToken?: string }`, with `apiToken` taking priority over `accessCode`.

### Listen for messages from the Headless SiteView iframe

The result of your API call will be dispatched from the Headless SiteView, and your app can listen for the dispatched messages:

```js
window.addEventListener('message', (event) => {
  const response = event.data;
  if (response.header !== 'CUPIXWORKS_HEADLESS_VIEWER_API') return;

  const responseType = response.responseType; // string
  const data = response.response;             // response object
  const errorMessage = response.errorMessage; // string (if error)
});
```

## Initialize

```js
SiteViewSDK.init(htmlDivId, siteviewUrl, auth);
```

| Property   | Type     | Description                                                             | Required |
| ---------- | -------- | ----------------------------------------------------------------------- | -------- |
| htmlDivId  | `string` | ID of the container div element                                         | true     |
| siteviewUrl | `string` | URL to the headless siteview (e.g., `https://app.cupix.com/hsv/{key}`) | true     |
| auth       | `Object` | Authentication options                                                  | false    |
| auth.apiToken | `string` | API token for authentication                                         | false    |
| auth.accessCode | `string` | Access code for the siteview                                       | false    |

## System

### Start

Initialize the API calls. The `running` state should be `true` to be able to call APIs.

```js
SiteViewSDK.start(timeout);
```

| Property | Type     | Description             |
| -------- | -------- | ----------------------- |
| timeout  | `number` | Timeout in milliseconds |

Response

```js
{ running: boolean }
```

### Stop

Stop the API. APIs cannot be used when `running` is `false`.

```js
SiteViewSDK.stop();
```

Response

```js
{ running: boolean }
```

## Document

### Get Document

Get document data including levels, captures, panos, BIMs, annotations, etc.

```js
SiteViewSDK.getDocument();
```

Response

```js
{
  siteviewKey: string,
  spacetime?: object[],     // included by default
  levels?: object[],        // included by default
  records?: object[],       // included by default (captures)
  panos?: PanoInfo[],       // opt-in via include
  bims?: BimInfo[],         // included by default
  annotations?: object[],   // opt-in via include
  annotationLayers?: AnnotationLayerInfo[]  // opt-in via include
}
```

### Get Siteview

Get information on the current SiteView.

```js
SiteViewSDK.getSiteview();
```

Response

```js
{ key: string, name: string }
```

### Get Active Level

Get the currently active level.

```js
SiteViewSDK.getActiveLevel();
```

Response

```js
{ level: { id, name, elevation, height, isGroundLevel, ... } }
```

### Get Active Capture

Get the currently active capture.

```js
SiteViewSDK.getActiveCapture();
```

Response

```js
{ capture: { id, name, startDate, endDate, ... } }
```

### Is Document Loaded

Check whether the document is loaded.

```js
SiteViewSDK.isDocumentLoaded();
```

Response

```js
{ documentLoaded: boolean, siteviewKey: string }
```

## Viewer Mode

### Change Viewer Mode

Switch between Pano and BIM viewer modes.

```js
SiteViewSDK.changeViewerMode(mode);
```

| Property | Type                 | Description | Required |
| -------- | -------------------- | ----------- | -------- |
| mode     | `'pano'` \| `'bim'` | Viewer mode | true     |

Response

```js
{ viewerMode: string }
```

### Change Pano View Mode

Change the pano view mode.

```js
SiteViewSDK.changePanoViewMode(panoViewMode);
```

| Property     | Type                                    | Description   | Required |
| ------------ | --------------------------------------- | ------------- | -------- |
| panoViewMode | `'walk'` \| `'fly'` \| `'overhead'`    | Pano view mode | true    |

Response

```js
{ panoViewMode: string }
```

### Change Active View

Change which view type is active in the split view.

```js
SiteViewSDK.changeActiveView(viewType);
```

| Property | Type                 | Description | Required |
| -------- | -------------------- | ----------- | -------- |
| viewType | `'pano'` \| `'bim'` | View type   | true     |

Response

```js
{ viewType: string }
```

### Change Pano Visibility Mode

Change pano visibility mode.

```js
SiteViewSDK.changePanoVisibilityMode(visibilityMode);
```

| Property       | Type                             | Description     | Required |
| -------------- | -------------------------------- | --------------- | -------- |
| visibilityMode | `'ALL'` \| `'PANO'` \| `'3D'`   | Visibility mode | true     |

Response

```js
{}
```

## Camera

### Get Camera Parameters

Get current camera parameters.

```js
SiteViewSDK.getCameraParameters();
```

Response

```js
{
  cameraParameters: {
    tm: number[],       // 4x4 transform matrix
    fov: number,        // Field of view in degrees
    zoom: number,       // Zoom level
    orthoMode: boolean, // Orthographic mode
    walkMode: boolean,  // Walk mode
    viewMode: string,   // View mode
    pivot: number[],    // Pivot point [x, y, z]
    panoId: number      // Current pano ID
  }
}
```

### Set Camera Parameters

Set camera parameters directly.

```js
SiteViewSDK.setCameraParameters(params);
```

| Property | Type     | Description                              | Required |
| -------- | -------- | ---------------------------------------- | -------- |
| params   | `Object` | Camera parameters object (same as above) | true     |

Response

```js
{ cameraParameters: object }
```

### Set Camera Rotate

Rotate the camera.

```js
SiteViewSDK.setCameraRotate(direction, angle);
```

| Property  | Type                                       | Description               | Required |
| --------- | ------------------------------------------ | ------------------------- | -------- |
| direction | `'UP'` \| `'DOWN'` \| `'LEFT'` \| `'RIGHT'` | Camera rotation direction | true     |
| angle     | `number`                                   | Angle in degrees          | true     |

Response

```js
{ cameraParameters: object }
```

### Set Camera LookAt

Make the camera look at a specific point.

```js
SiteViewSDK.setCameraLookAt(x, y, z);
```

| Property | Type     | Description  | Required |
| -------- | -------- | ------------ | -------- |
| x        | `number` | X coordinate | true     |
| y        | `number` | Y coordinate | true     |
| z        | `number` | Z coordinate | true     |

Response

```js
{ cameraParameters: object }
```

### Set Camera First Person

Enable or disable first person mode in BIM view.

```js
SiteViewSDK.setCameraFirstPerson(enable);
```

| Property | Type      | Description             | Required |
| -------- | --------- | ----------------------- | -------- |
| enable   | `boolean` | Enable first person mode | true    |

Response

```js
{ enable: boolean }
```

### Set Camera Move

Move the camera. The nearest pano will be searched in the given direction and the pano will be changed.

```js
SiteViewSDK.setCameraMove(direction, distance);
```

| Property  | Type                                              | Description           | Required |
| --------- | ------------------------------------------------- | --------------------- | -------- |
| direction | `'FORWARD'` \| `'BACK'` \| `'LEFT'` \| `'RIGHT'` | Camera move direction | true     |
| distance  | `number`                                          | Move distance         | false    |

Response

```js
{ cameraParameters: object }
```

### Set Camera FOV

Set the camera field of view (absolute value in degrees).

```js
SiteViewSDK.setCameraFov(fov);
```

| Property | Type     | Description                 | Required |
| -------- | -------- | --------------------------- | -------- |
| fov      | `number` | Field of view in degrees    | true     |

Response

```js
{ cameraParameters: object }
```

### Reset View

Reset camera parameters to the default values.

```js
SiteViewSDK.resetView();
```

Response

```js
{ cameraParameters: object }
```

## Navigation

### Change Level Capture

Change to a specific level and capture.

```js
SiteViewSDK.changeLevelCapture(levelId, captureId);
```

| Property  | Type     | Description | Required |
| --------- | -------- | ----------- | -------- |
| levelId   | `number` | Level ID    | true     |
| captureId | `number` | Capture ID  | true     |

Response

```js
{ levelId: number, captureId: number }
```

### Change Pano

Navigate to a specific pano.

```js
SiteViewSDK.changePano(panoId);
```

| Property | Type     | Description | Required |
| -------- | -------- | ----------- | -------- |
| panoId   | `number` | Pano ID     | true     |

Response

```js
{ panoId: number }
```

### Change BIM

Load specific BIM models.

```js
SiteViewSDK.changeBim(bims);
```

| Property | Type                                    | Description       | Required |
| -------- | --------------------------------------- | ----------------- | -------- |
| bims     | `Array<{ bim: number, model?: number }>` | BIM models to load | true    |

Response

```js
{ bims: Array<{ bim: number, model?: number }> }
```

## Annotation

### Add Annotation Form

Add an annotation to an annotation group.

```js
SiteViewSDK.addAnnotationForm(formTemplateId, annotationGroupId, name, values);
```

| Property          | Type     | Description                                | Required |
| ----------------- | -------- | ------------------------------------------ | -------- |
| formTemplateId    | `number` | Annotation form template ID                | true     |
| annotationGroupId | `number` | Annotation group ID                        | true     |
| name              | `string` | Name of the annotation                     | false    |
| values            | `string` | JSON stringified array of field values     | false    |

Response

```js
{ annotationId: number, annotationKey: string, name: string, layerId: number, formDesignId: number }
```

### Set Active Annotation

Set the active (selected) annotation.

```js
SiteViewSDK.setActiveAnnotation(annotationId);
```

| Property     | Type     | Description   | Required |
| ------------ | -------- | ------------- | -------- |
| annotationId | `number` | Annotation ID | true     |

Response

```js
{ annotation: { id: number, key: string, name: string, layerId: number, levelId: number, recordId: number } }
```

### Reset Active Annotation

Clear the active annotation selection.

```js
SiteViewSDK.resetActiveAnnotation();
```

Response

```js
{}
```

### Load Annotation

Load a single annotation by ID.

```js
SiteViewSDK.loadAnnotation(annotationId);
```

| Property     | Type     | Description   | Required |
| ------------ | -------- | ------------- | -------- |
| annotationId | `number` | Annotation ID | true     |

Response

```js
{ annotationId: number }
```

### Load Annotations

Load multiple annotations by IDs.

```js
SiteViewSDK.loadAnnotations(annotationIds);
```

| Property      | Type       | Description     | Required |
| ------------- | ---------- | --------------- | -------- |
| annotationIds | `number[]` | Annotation IDs  | true     |

Response

```js
{}
```

### Load Annotation Group

Load all annotations belonging to the specified annotation groups (layers).

```js
SiteViewSDK.loadAnnotationGroup(annotationGroupIds);
```

| Property           | Type       | Description          | Required |
| ------------------ | ---------- | -------------------- | -------- |
| annotationGroupIds | `number[]` | Annotation group IDs | true     |

Response

```js
{}
```

### Unload Annotations

Unload (remove) annotations by IDs.

```js
SiteViewSDK.unloadAnnotations(annotationIds);
```

| Property      | Type       | Description    | Required |
| ------------- | ---------- | -------------- | -------- |
| annotationIds | `number[]` | Annotation IDs | true     |

Response

```js
{ removedIds: number[] }
```

### Set Filter

Set annotation filter parameters.

```js
SiteViewSDK.setFilter(filterArgs);
```

| Property   | Type     | Description                         | Required |
| ---------- | -------- | ----------------------------------- | -------- |
| filterArgs | `Object` | Filter parameters (layerIds, etc.)  | true     |

Response

```js
{}
```

### Set Annotation Group Visibility

Set visibility for specific annotation groups.

```js
SiteViewSDK.setAnnotationGroupVisibility(annotationGroupIds, visible, showThisOnly);
```

| Property           | Type       | Description                                 | Required |
| ------------------ | ---------- | ------------------------------------------- | -------- |
| annotationGroupIds | `number[]` | Annotation group IDs                        | true     |
| visible            | `boolean`  | Show or hide                                | true     |
| showThisOnly       | `boolean`  | Show only these groups, hide all others     | false    |

Response

```js
{}
```

### Set Annotation Group All Visibility

Show or hide all annotation groups at once.

```js
SiteViewSDK.setAnnotationGroupAllVisibility(visible);
```

| Property | Type      | Description  | Required |
| -------- | --------- | ------------ | -------- |
| visible  | `boolean` | Show or hide | true     |

Response

```js
{}
```

## Omninote

### Load Omninotes

Load omninotes by their keys.

```js
SiteViewSDK.loadOmninotes(omninoteKeys);
```

| Property     | Type       | Description   | Required |
| ------------ | ---------- | ------------- | -------- |
| omninoteKeys | `string[]` | Omninote keys | true     |

Response

```js
{}
```

### Unload Omninotes

Unload (remove) omninotes by their keys.

```js
SiteViewSDK.unloadOmninotes(omninoteKeys);
```

| Property     | Type       | Description   | Required |
| ------------ | ---------- | ------------- | -------- |
| omninoteKeys | `string[]` | Omninote keys | true     |

Response

```js
{ removedKeys: string[] }
```

## Refplan

### Enable Refplan

Enable the refplan (drawing) feature. Must be called before using other refplan APIs.

```js
SiteViewSDK.enableRefplan();
```

Response

```js
{}
```

### Get Refplans of Level

Get all refplans for a given level.

```js
SiteViewSDK.getRefplansOfLevel(levelId);
```

| Property | Type     | Description | Required |
| -------- | -------- | ----------- | -------- |
| levelId  | `number` | Level ID    | true     |

Response

```js
{ levelId: number, refplans: [{ id: number, key: string, name: string, levelId: number }] }
```

### Set Active Refplan

Set the active refplan. Use `-1` to deselect.

```js
SiteViewSDK.setActiveRefplan(id);
```

| Property | Type     | Description                  | Required |
| -------- | -------- | ---------------------------- | -------- |
| id       | `number` | Refplan ID (`-1` to deselect) | true    |

Response

```js
{ id: number }
```

## Display

### Set Opacity

Set the pano overlay opacity.

```js
SiteViewSDK.setOpacity(opacity);
```

| Property | Type     | Description     | Required |
| -------- | -------- | --------------- | -------- |
| opacity  | `number` | 0.0 to 1.0     | true     |

Response

```js
{ opacity: number }
```

### Set BIM Background Transparent

Set whether the BIM background is transparent.

```js
SiteViewSDK.setBimBackgroundTransparent(transparent);
```

| Property    | Type      | Description | Required |
| ----------- | --------- | ----------- | -------- |
| transparent | `boolean` | Transparent | true     |

Response

```js
{ transparent: boolean }
```

### Set Float Map Visible

Show or hide the floating map.

```js
SiteViewSDK.setFloatMapVisible(visible);
```

| Property | Type      | Description  | Required |
| -------- | --------- | ------------ | -------- |
| visible  | `boolean` | Show or hide | true     |

Response

```js
{ visible: boolean }
```

## Broadcast Events

These events are dispatched from the Headless SiteView when state changes occur. Listen for them using `window.addEventListener('message', ...)`.

All event messages share the format:

```js
{
  header: 'CUPIXWORKS_HEADLESS_VIEWER_API',
  responseType: string,   // event type name
  response: object        // event data
}
```

### Document Loaded

Emitted when the document finishes loading.

| Property    | Type     | Description  |
| ----------- | -------- | ------------ |
| siteviewKey | `string` | SiteView key |

### Viewer Ready

Emitted when the viewer is ready.

| Property   | Type     | Description |
| ---------- | -------- | ----------- |
| viewId     | `string` | View ID     |
| viewerMode | `string` | Viewer mode |

### Viewer Mode Changed

Emitted when the viewer mode changes.

| Property   | Type     | Description        |
| ---------- | -------- | ------------------ |
| viewerMode | `string` | `'pano'` or `'bim'` |

### Camera Changed

Emitted when the camera changes.

| Property         | Type     | Description      |
| ---------------- | -------- | ---------------- |
| viewId           | `string` | View ID          |
| viewType         | `string` | View type        |
| cameraParameters | `object` | Camera parameters |

### Pano View Mode Changed

Emitted when the pano view mode changes.

| Property     | Type     | Description                              |
| ------------ | -------- | ---------------------------------------- |
| panoViewMode | `string` | `'walk'`, `'fly'`, or `'overhead'` |

### Active Annotation Changed

Emitted when the active annotation changes.

| Property       | Type     | Description          |
| -------------- | -------- | -------------------- |
| annotationId   | `number` | Annotation ID        |
| annotationKey  | `string` | Annotation key       |
| annotationName | `string` | Annotation name      |
| layerId        | `number` | Annotation layer ID  |
| levelId        | `number` | Level ID             |
| recordId       | `number` | Record (capture) ID  |

### Active Annotation Reset

Emitted when the active annotation is cleared.

| Property             | Type     | Description             |
| -------------------- | -------- | ----------------------- |
| previousAnnotationId | `number` | Previously active annotation ID |

### Level Changed

Emitted when the active level changes.

| Property | Type     | Description |
| -------- | -------- | ----------- |
| levelId  | `number` | Level ID    |

### Capture Changed

Emitted when the active capture changes.

| Property  | Type     | Description |
| --------- | -------- | ----------- |
| captureId | `number` | Capture ID  |

### Opacity Changed

Emitted when pano opacity changes.

| Property | Type     | Description |
| -------- | -------- | ----------- |
| opacity  | `number` | 0.0 to 1.0 |

### BIM Background Transparent Changed

Emitted when BIM background transparency changes.

| Property    | Type      | Description |
| ----------- | --------- | ----------- |
| transparent | `boolean` | Transparent |

### Float Map Visible Changed

Emitted when float map visibility changes.

| Property | Type      | Description |
| -------- | --------- | ----------- |
| visible  | `boolean` | Visible     |

## Engine Events

These are lower-level engine events forwarded from the 3D viewer. They follow the same message format as broadcast events.

| Event Type                        | Data                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------ |
| **ACTIVE_PANO_CHANGE**            | `{ viewId, panoId, photoName, previousPanoId, caller? }`                       |
| **ACTIVE_PANO_CHANGED**           | `{ viewId, panoId, photoName, previousPanoId, caller? }`                       |
| **VIEW_CAMERA_CHANGED**           | `{ viewId, cameraParameters?, sourceViewId?, caller? }`                        |
| **VIEW_CAMERA_PANNED**            | `{ viewId, cameraParameters?, sourceViewId?, caller? }`                        |
| **VIEW_CAMERA_ROTATED**           | `{ viewId, cameraParameters?, sourceViewId?, caller? }`                        |
| **VIEW_CAMERA_ZOOMED**            | `{ viewId, cameraParameters?, sourceViewId?, caller? }`                        |
| **VIEW_CHANGED**                  | `{ viewId, lookAt?, up?, sourceViewId?, caller? }`                             |
| **ALL_ANNOTATIONS_LOADED**        | `{ caller? }`                                                                  |
| **FILTER_CHANGED**                | `{ ...filterArgs, caller? }`                                                   |
| **SELECTION_CHANGED**             | `{ viewId, selection: [{ id, key, typename? }], caller?, source }`             |
| **GEOMETRY_LOADING**              | `{ viewId, caller?, percent?, state? }`                                        |
| **GEOMETRY_LOADED**               | `{ viewId, caller? }`                                                          |
