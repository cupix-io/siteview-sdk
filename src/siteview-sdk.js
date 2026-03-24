/**
 * @readonly
 * @enum {string}
 */
const OPERATION_TYPE = {
  // System
  HEADLESS_VIEWER_API_START: 'HEADLESS_VIEWER_API_START',
  HEADLESS_VIEWER_API_STOP: 'HEADLESS_VIEWER_API_STOP',

  // Document
  GET_DOCUMENT: 'GET_DOCUMENT',
  GET_SITEVIEW: 'GET_SITEVIEW',
  GET_ACTIVE_LEVEL: 'GET_ACTIVE_LEVEL',
  GET_ACTIVE_CAPTURE: 'GET_ACTIVE_CAPTURE',
  IS_DOCUMENT_LOADED: 'IS_DOCUMENT_LOADED',

  // Viewer Mode
  CHANGE_VIEWER_MODE: 'CHANGE_VIEWER_MODE',
  CHANGE_PANO_VIEW_MODE: 'CHANGE_PANO_VIEW_MODE',
  CHANGE_ACTIVE_VIEW: 'CHANGE_ACTIVE_VIEW',
  CHANGE_PANO_VISIBILITY_MODE: 'CHANGE_PANO_VISIBILITY_MODE',

  // Camera
  GET_CAMERA_PARAMETERS: 'GET_CAMERA_PARAMETERS',
  SET_CAMERA_ROTATE: 'SET_CAMERA_ROTATE',
  SET_CAMERA_LOOKAT: 'SET_CAMERA_LOOKAT',
  SET_CAMERA_PARAMETERS: 'SET_CAMERA_PARAMETERS',
  SET_CAMERA_FIRST_PERSON: 'SET_CAMERA_FIRST_PERSON',
  SET_CAMERA_MOVE: 'SET_CAMERA_MOVE',
  SET_CAMERA_FOV: 'SET_CAMERA_FOV',
  RESET_VIEW: 'RESET_VIEW',

  // Navigation
  CHANGE_LEVEL_CAPTURE: 'CHANGE_LEVEL_CAPTURE',
  CHANGE_PANO: 'CHANGE_PANO',
  CHANGE_BIM: 'CHANGE_BIM',

  // Annotation
  ADD_ANNOTATION_FORM: 'ADD_ANNOTATION_FORM',
  SET_ACTIVE_ANNOTATION: 'SET_ACTIVE_ANNOTATION',
  RESET_ACTIVE_ANNOTATION: 'RESET_ACTIVE_ANNOTATION',
  SET_FILTER: 'SET_FILTER',
  SET_ANNOTATION_GROUP_ALL_VISIBILITY: 'SET_ANNOTATION_GROUP_ALL_VISIBILITY',
  SET_ANNOTATION_GROUP_VISIBILITY: 'SET_ANNOTATION_GROUP_VISIBILITY',
  LOAD_ANNOTATION: 'LOAD_ANNOTATION',
  LOAD_ANNOTATIONS: 'LOAD_ANNOTATIONS',
  LOAD_ANNOTATION_GROUP: 'LOAD_ANNOTATION_GROUP',
  UNLOAD_ANNOTATIONS: 'UNLOAD_ANNOTATIONS',

  // Omninote
  LOAD_OMNINOTES: 'LOAD_OMNINOTES',
  UNLOAD_OMNINOTES: 'UNLOAD_OMNINOTES',

  // Refplan
  ENABLE_REFPLAN: 'ENABLE_REFPLAN',
  GET_REFPLANS_OF_LEVEL: 'GET_REFPLANS_OF_LEVEL',
  SET_ACTIVE_REFPLAN: 'SET_ACTIVE_REFPLAN',

  // Display
  SET_OPACITY: 'SET_OPACITY',
  SET_BIM_BACKGROUND_TRANSPARENT: 'SET_BIM_BACKGROUND_TRANSPARENT',
  SET_FLOAT_MAP_VISIBLE: 'SET_FLOAT_MAP_VISIBLE'
};

/**
 * @typedef {Object} ApiRequestMessage
 * @property {OPERATION_TYPE} operationType
 * @property {"CUPIXWORKS_HEADLESS_VIEWER_API"} header
 * @property {string} sourceUUID
 * @property {string} uuid
 * @property {number} timestamp
 */

/**
 * @typedef {Object} ErrorType
 * @property {string} error
 */

const resolvers = {};
let readyResolve;

/**
 * @typedef {Object} SiteViewSDK
 * @property {number} uuid
 * @property {boolean} quiet
 * @property {boolean} ready
 */
const SiteViewSDK = {
  uuid: 0,
  quiet: false,
  ready: false,
  cupixWindow: null,
  readyPromise: null,
  OPERATION_TYPE
};

SiteViewSDK.readyPromise = new Promise(function (res) {
  readyResolve = res;
});

window.SiteViewSDK = SiteViewSDK;

/**
 * @param {string} htmlDivId
 * @param {string} siteviewUrl - URL to the headless siteview (e.g., https://app.cupix.com/hsv/{siteviewKey})
 * @param {Object} [auth] - Authentication options
 * @param {string} [auth.accessCode] - Access code for the siteview
 * @param {string} [auth.apiToken] - API token for authentication
 */
SiteViewSDK.init = async function (htmlDivId, siteviewUrl, auth) {
  auth = auth || {};
  var elem = document.getElementById(htmlDivId);
  if (!elem) return;

  if (auth.apiToken) siteviewUrl += (siteviewUrl.indexOf('?') === -1 ? '?' : '&') + 'cupix_api_token=' + auth.apiToken;
  else if (auth.accessCode) siteviewUrl += (siteviewUrl.indexOf('?') === -1 ? '?' : '&') + 'access_code=' + auth.accessCode;

  // Reset state for re-init
  SiteViewSDK.ready = false;
  SiteViewSDK.uuid = 0;
  SiteViewSDK.cupixWindow = null;
  SiteViewSDK.readyPromise = new Promise(function (res) {
    readyResolve = res;
  });

  // Remove existing iframe if any
  var existing = elem.querySelector('iframe');
  if (existing) elem.removeChild(existing);

  var iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.src = siteviewUrl;

  return new Promise(function (resolve) {
    iframe.onload = function () {
      SiteViewSDK.cupixWindow = iframe.contentWindow;
      resolve();
    };
    elem.appendChild(iframe);
  });
};

/**
 * @param {ApiRequestMessage} event
 * @param {number} [waitReady]
 * @return {Promise<ErrorType>}
 */
SiteViewSDK.sendToCupix = async function (event, waitReady) {
  if (!SiteViewSDK.cupixWindow) {
    console.warn('[SiteViewSDK] Not initialized. Call init() first.');
    return { error: 'not_initialized' };
  }

  event.header = 'CUPIXWORKS_HEADLESS_VIEWER_API';
  event.sourceUUID = 'siteview-sdk';
  event.uuid = SiteViewSDK.uuid.toString();
  event.timestamp = Date.now();
  var timeout = waitReady || 10000;
  var error = { error: 'timeout: ' + event.operationType + ' ' + timeout + 'ms' };

  var promise = new Promise(function (resolve) {
    var id = SiteViewSDK.uuid;
    resolvers[id] = resolve;
    setTimeout(function () {
      if (resolvers[id]) {
        resolve(error);
        resolvers[id] = null;
      }
    }, timeout);
  });

  await SiteViewSDK.readyPromise;
  SiteViewSDK.cupixWindow.postMessage(event, '*');
  if (!SiteViewSDK.quiet) console.log('sendToCupix: [' + event.operationType + ']', JSON.stringify(event));

  SiteViewSDK.uuid++;
  return promise;
};

// ── System ──

/** @param {number} [timeout] */
SiteViewSDK.start = function (timeout) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.HEADLESS_VIEWER_API_START }, timeout);
};

SiteViewSDK.stop = function () {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.HEADLESS_VIEWER_API_STOP });
};

// ── Document ──

SiteViewSDK.getDocument = function () {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.GET_DOCUMENT });
};

SiteViewSDK.getSiteview = function () {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.GET_SITEVIEW });
};

SiteViewSDK.isDocumentLoaded = function () {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.IS_DOCUMENT_LOADED });
};

SiteViewSDK.getActiveLevel = function () {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.GET_ACTIVE_LEVEL });
};

SiteViewSDK.getActiveCapture = function () {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.GET_ACTIVE_CAPTURE });
};

// ── Viewer Mode ──

/** @param {'pano' | 'bim'} mode */
SiteViewSDK.changeViewerMode = function (mode) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.CHANGE_VIEWER_MODE, operationArgs: { viewerMode: mode } });
};

/** @param {'walk' | 'fly' | 'overhead'} panoViewMode */
SiteViewSDK.changePanoViewMode = function (panoViewMode) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.CHANGE_PANO_VIEW_MODE, operationArgs: { panoViewMode: panoViewMode } });
};

/** @param {'pano' | 'bim'} viewType */
SiteViewSDK.changeActiveView = function (viewType) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.CHANGE_ACTIVE_VIEW, operationArgs: { viewType: viewType } });
};

/** @param {'ALL' | 'PANO' | '3D'} visibilityMode */
SiteViewSDK.changePanoVisibilityMode = function (visibilityMode) {
  return SiteViewSDK.sendToCupix({
    operationType: OPERATION_TYPE.CHANGE_PANO_VISIBILITY_MODE,
    operationArgs: { visibilityMode: visibilityMode }
  });
};

// ── Camera ──

SiteViewSDK.getCameraParameters = function () {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.GET_CAMERA_PARAMETERS });
};

/** @param {string} direction @param {number} angle */
SiteViewSDK.setCameraRotate = function (direction, angle) {
  return SiteViewSDK.sendToCupix({
    operationType: OPERATION_TYPE.SET_CAMERA_ROTATE,
    operationArgs: { direction: direction, angle: angle }
  });
};

/** @param {number} x @param {number} y @param {number} z */
SiteViewSDK.setCameraLookAt = function (x, y, z) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.SET_CAMERA_LOOKAT, operationArgs: { x: x, y: y, z: z } });
};

/** @param {Object} params */
SiteViewSDK.setCameraParameters = function (params) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.SET_CAMERA_PARAMETERS, operationArgs: params });
};

/** @param {boolean} enable */
SiteViewSDK.setCameraFirstPerson = function (enable) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.SET_CAMERA_FIRST_PERSON, operationArgs: { enable: enable } });
};

/** @param {'FORWARD' | 'BACK' | 'LEFT' | 'RIGHT'} direction @param {number} [distance] */
SiteViewSDK.setCameraMove = function (direction, distance) {
  var args = { direction: direction };
  if (distance !== undefined) args.distance = distance;
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.SET_CAMERA_MOVE, operationArgs: args });
};

/** @param {number} fov - Field of view in degrees (absolute value) */
SiteViewSDK.setCameraFov = function (fov) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.SET_CAMERA_FOV, operationArgs: { fov: fov } });
};

SiteViewSDK.resetView = function () {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.RESET_VIEW });
};

// ── Navigation ──

/** @param {number} levelId @param {number} captureId */
SiteViewSDK.changeLevelCapture = function (levelId, captureId) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.CHANGE_LEVEL_CAPTURE, operationArgs: { levelId: levelId, captureId: captureId } });
};

/** @param {number} panoId */
SiteViewSDK.changePano = function (panoId) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.CHANGE_PANO, operationArgs: { panoId: panoId } });
};

/**
 * @param {Array<{bim: number, model?: number}>} bims - BIM models to load
 */
SiteViewSDK.changeBim = function (bims) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.CHANGE_BIM, operationArgs: { bims: bims } });
};

// ── Annotation ──

SiteViewSDK.addAnnotationForm = function (formTemplateId, annotationGroupId, name, values) {
  return SiteViewSDK.sendToCupix({
    operationType: OPERATION_TYPE.ADD_ANNOTATION_FORM,
    operationArgs: { formTemplateId: formTemplateId, annotationGroupId: annotationGroupId, name: name, values: values }
  });
};

/** @param {number} annotationId */
SiteViewSDK.setActiveAnnotation = function (annotationId) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.SET_ACTIVE_ANNOTATION, operationArgs: { annotationId: annotationId } });
};

SiteViewSDK.resetActiveAnnotation = function () {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.RESET_ACTIVE_ANNOTATION });
};

/** @param {Object} filterArgs */
SiteViewSDK.setFilter = function (filterArgs) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.SET_FILTER, operationArgs: filterArgs });
};

/** @param {boolean} visible */
SiteViewSDK.setAnnotationGroupAllVisibility = function (visible) {
  return SiteViewSDK.sendToCupix({
    operationType: OPERATION_TYPE.SET_ANNOTATION_GROUP_ALL_VISIBILITY,
    operationArgs: { visible: visible }
  });
};

/** @param {number[]} annotationGroupIds @param {boolean} visible @param {boolean} [showThisOnly] */
SiteViewSDK.setAnnotationGroupVisibility = function (annotationGroupIds, visible, showThisOnly) {
  var args = { annotationGroupIds: annotationGroupIds, visible: visible };
  if (showThisOnly !== undefined) args.showThisOnly = showThisOnly;
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.SET_ANNOTATION_GROUP_VISIBILITY, operationArgs: args });
};

/** @param {number} annotationId */
SiteViewSDK.loadAnnotation = function (annotationId) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.LOAD_ANNOTATION, operationArgs: { annotationId: annotationId } });
};

/** @param {number[]} annotationIds */
SiteViewSDK.loadAnnotations = function (annotationIds) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.LOAD_ANNOTATIONS, operationArgs: { annotationIds: annotationIds } });
};

/** @param {number[]} annotationGroupIds */
SiteViewSDK.loadAnnotationGroup = function (annotationGroupIds) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.LOAD_ANNOTATION_GROUP, operationArgs: { annotationGroupIds: annotationGroupIds } });
};

/** @param {number[]} annotationIds */
SiteViewSDK.unloadAnnotations = function (annotationIds) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.UNLOAD_ANNOTATIONS, operationArgs: { annotationIds: annotationIds } });
};

// ── Omninote ──

/** @param {string[]} omninoteKeys */
SiteViewSDK.loadOmninotes = function (omninoteKeys) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.LOAD_OMNINOTES, operationArgs: { omninoteKeys: omninoteKeys } });
};

/** @param {string[]} omninoteKeys */
SiteViewSDK.unloadOmninotes = function (omninoteKeys) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.UNLOAD_OMNINOTES, operationArgs: { omninoteKeys: omninoteKeys } });
};

// ── Refplan ──

SiteViewSDK.enableRefplan = function () {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.ENABLE_REFPLAN });
};

/** @param {number} levelId */
SiteViewSDK.getRefplansOfLevel = function (levelId) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.GET_REFPLANS_OF_LEVEL, operationArgs: { levelId: levelId } });
};

/** @param {number} id - refplan id (-1 to deselect) */
SiteViewSDK.setActiveRefplan = function (id) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.SET_ACTIVE_REFPLAN, operationArgs: { id: id } });
};

// ── Display ──

/** @param {number} opacity - 0.0 to 1.0 */
SiteViewSDK.setOpacity = function (opacity) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.SET_OPACITY, operationArgs: { opacity: opacity } });
};

/** @param {boolean} transparent */
SiteViewSDK.setBimBackgroundTransparent = function (transparent) {
  return SiteViewSDK.sendToCupix({
    operationType: OPERATION_TYPE.SET_BIM_BACKGROUND_TRANSPARENT,
    operationArgs: { transparent: transparent }
  });
};

/** @param {boolean} visible */
SiteViewSDK.setFloatMapVisible = function (visible) {
  return SiteViewSDK.sendToCupix({ operationType: OPERATION_TYPE.SET_FLOAT_MAP_VISIBLE, operationArgs: { visible: visible } });
};

// ── Event listener ──

function log(msg) {
  console.log('%c' + msg, 'color: #55bada;');
}

function setReady() {
  if (!SiteViewSDK.ready) {
    SiteViewSDK.ready = true;
    if (readyResolve) readyResolve(true);
  }
}

window.addEventListener(
  'message',
  function (e) {
    if (e.source !== SiteViewSDK.cupixWindow) return;
    var response = e && e.data;
    if (response == undefined) return;
    if (response.header != 'CUPIXWORKS_HEADLESS_VIEWER_API') return;
    if (!SiteViewSDK.quiet) log('[CUPIXWORKS_HEADLESS_VIEWER_API] ' + JSON.stringify(response || {}));
    setReady();
    if (response.request && response.request.uuid && typeof resolvers[response.request.uuid] === 'function') {
      resolvers[response.request.uuid](response.response || response);
      resolvers[response.request.uuid] = null;
    }
  },
  false
);

export default SiteViewSDK;
