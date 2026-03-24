// ── Connection ──

(function () {
  var urlInput = document.getElementById('input-url');
  var tokenInput = document.getElementById('input-token');
  var savedUrl = localStorage.getItem('playground_url');
  var savedToken = localStorage.getItem('playground_token');
  if (savedUrl) urlInput.value = savedUrl;
  if (savedToken) tokenInput.value = savedToken;
})();

// eslint-disable-next-line no-unused-vars -- called from HTML onclick
function connectViewer() {
  const url = document.getElementById('input-url').value;
  const token = document.getElementById('input-token').value;
  if (!url) return;

  localStorage.setItem('playground_url', url);
  localStorage.setItem('playground_token', token);

  const placeholder = document.getElementById('placeholder-text');
  if (placeholder) placeholder.style.display = 'none';

  const auth = {};
  if (token) auth.apiToken = token;

  SiteViewSDK.init('cupix-container', url, auth);
}

// ── Output helpers ──

function setContent(id, content) {
  const elem = document.getElementById(id);
  if (elem) elem.innerText = content;
}

function getJSONContent(json) {
  if (json == undefined) return '';
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    parsed = json;
  }
  return JSON.stringify(parsed, null, 2);
}

function timeStr() {
  return new Date().toLocaleTimeString();
}

// ── Panel updaters ──

function setRequestContent(operationType, operationArgs) {
  setContent('req-timestamp', timeStr());
  setContent('req-type', operationType || '--');
  setContent('req-content', getJSONContent(operationArgs));
}

function setResponseContent(responseType, response, errorMessage, errorArgs) {
  setContent('resp-timestamp', timeStr());
  setContent('resp-type', responseType || '--');
  setContent('resp-content', getJSONContent(response));
  setContent('resp-error-msg', errorMessage || '');
  setContent('resp-error-args', errorMessage ? getJSONContent(errorArgs) : '');
}

function setEventContent(eventType, eventData) {
  setContent('event-timestamp', timeStr());
  setContent('event-type', eventType || '--');
  setContent('event-content', getJSONContent(eventData));
}

function setCameraContent(eventType, eventData) {
  setContent('camera-timestamp', timeStr());
  setContent('camera-type', eventType || '--');
  setContent('camera-content', getJSONContent(eventData));
}

function setOutputErrorMessage(operationType, errorMessage, errorArgs) {
  setResponseContent(operationType, undefined, errorMessage, errorArgs);
}

// ── Camera event detection ──

function isCameraEvent(responseType) {
  if (!responseType) return false;
  return responseType.indexOf('CAMERA') !== -1;
}

// ── Message listener ──

window.addEventListener(
  'message',
  function (e) {
    const response = e && e.data;
    if (response == undefined) return;
    if (response.header != 'CUPIXWORKS_HEADLESS_VIEWER_API') return;

    const type = response.responseType;

    if (isCameraEvent(type)) {
      setCameraContent(type, response.response);
    } else if (response.request) {
      setResponseContent(type, response.response, response.errorMessage, response.errorArgs);
    } else {
      setEventContent(type, response.response);
    }
  },
  false
);

// ── Dialog prompt ──

const Playground = {};

const inputStyle = `
  width:100%;background:#0f172a;border:1px solid #475569;border-radius:4px;
  color:#e2e8f0;padding:6px 8px;font-size:12px;font-family:'SF Mono',monospace;
  box-sizing:border-box;
`.trim();

const btnRowStyle = 'display:flex;gap:6px;margin-top:8px;justify-content:flex-end;';
const cancelBtnStyle =
  'padding:4px 12px;border:1px solid #475569;border-radius:4px;background:#1e293b;color:#94a3b8;font-size:11px;cursor:pointer;';
const okBtnStyle =
  'padding:4px 12px;border:none;border-radius:4px;background:#38bdf8;color:#0f172a;font-size:11px;font-weight:600;cursor:pointer;';
const dialogStyle = 'background:#1e293b;border:1px solid #334155;border-radius:8px;color:#e2e8f0;padding:16px;margin:auto;';
const labelStyle = 'font-size:11px;color:#94a3b8;margin-bottom:2px;';

// Inject backdrop style once
(function () {
  const style = document.createElement('style');
  style.textContent = 'dialog::backdrop { background: rgba(0,0,0,0.5); }';
  document.head.appendChild(style);
})();

function createDialog(contentHTML) {
  const dialog = document.createElement('dialog');
  dialog.style.cssText = dialogStyle;
  dialog.innerHTML = `
    <form method="dialog" style="min-width:260px;">
      ${contentHTML}
      <div style="${btnRowStyle}">
        <button type="button" class="prompt-cancel" style="${cancelBtnStyle}">Cancel</button>
        <button type="submit" style="${okBtnStyle}">OK</button>
      </div>
    </form>
  `;
  document.body.appendChild(dialog);
  return dialog;
}

function openDialog(dialog, collectFn) {
  return new Promise(function (resolve) {
    const cancelBtn = dialog.querySelector('.prompt-cancel');

    function cleanup() {
      cancelBtn.removeEventListener('click', onCancel);
      dialog.removeEventListener('close', onClose);
      dialog.close();
      dialog.remove();
    }

    function onCancel() {
      cleanup();
      resolve(null);
    }

    function onClose() {
      const values = collectFn(dialog);
      cleanup();
      resolve(values);
    }

    cancelBtn.addEventListener('click', onCancel);
    dialog.addEventListener('close', onClose);

    dialog.showModal();
    const first = dialog.querySelector('input');
    if (first) {
      first.focus();
      first.select();
    }
  });
}

// Single-field prompt: returns string value or null on cancel
function showPrompt(label, defaultValue) {
  const html = `
    <div style="${labelStyle}">${label}</div>
    <input class="prompt-value" type="text" value="${(defaultValue || '').replace(/"/g, '&quot;')}" style="${inputStyle}" />
  `;
  const dialog = createDialog(html);
  return openDialog(dialog, function (d) {
    return d.querySelector('.prompt-value').value;
  });
}

// Multi-field prompt: fields = [{ name, label, defaultValue?, type? }]
// Returns object { name: value, ... } or null on cancel
function showPromptMultiple(fields) {
  const html = fields
    .map(function (f) {
      const val = (f.defaultValue || '').replace(/"/g, '&quot;');
      return `
      <div style="${labelStyle}">${f.label}</div>
      <input data-field="${f.name}" type="${f.type || 'text'}" value="${val}" style="${inputStyle};margin-bottom:6px;" />
    `;
    })
    .join('');
  const dialog = createDialog(html);
  return openDialog(dialog, function (d) {
    const result = {};
    fields.forEach(function (f) {
      const el = d.querySelector('[data-field="' + f.name + '"]');
      result[f.name] = el ? el.value : '';
    });
    return result;
  });
}

Playground.promptString = async function (operationType, valueName, defaultValue) {
  const stored = sessionStorage.getItem(valueName);
  const str = await showPrompt('Enter ' + valueName, stored || defaultValue || '');
  if (str == null) throw new Error('cancelled');
  if (str) sessionStorage.setItem(valueName, str);
  if (str == undefined || str.length < 1) {
    const errorMessage = 'empty ' + valueName;
    setOutputErrorMessage(operationType, errorMessage, { input: str });
    throw new Error(errorMessage);
  }
  return str;
};

Playground.promptNumber = async function (operationType, valueName, defaultValue) {
  const str = (await Playground.promptString(operationType, valueName, defaultValue)).replace(/\s/g, '');
  const x = Number(str);
  if (isNaN(x)) {
    const errorMessage = 'invalid ' + valueName;
    setOutputErrorMessage(operationType, errorMessage, { input: str });
    throw new Error(errorMessage);
  }
  return x;
};

// ── Helper: call SDK and show request ──

function callSDK(operationType, operationArgs, sdkFn) {
  setRequestContent(operationType, operationArgs);
  sdkFn();
}

// ── Document ──

Playground.getDocument = function () {
  callSDK('GET_DOCUMENT', {}, function () {
    SiteViewSDK.getDocument();
  });
};

Playground.getSiteview = function () {
  callSDK('GET_SITEVIEW', {}, function () {
    SiteViewSDK.getSiteview();
  });
};

Playground.isDocumentLoaded = function () {
  callSDK('IS_DOCUMENT_LOADED', {}, function () {
    SiteViewSDK.isDocumentLoaded();
  });
};

Playground.getActiveLevel = function () {
  callSDK('GET_ACTIVE_LEVEL', {}, function () {
    SiteViewSDK.getActiveLevel();
  });
};

Playground.getActiveCapture = function () {
  callSDK('GET_ACTIVE_CAPTURE', {}, function () {
    SiteViewSDK.getActiveCapture();
  });
};

// ── Viewer Mode (button-based) ──

Playground.changeViewerMode = function (mode) {
  callSDK('CHANGE_VIEWER_MODE', { mode: mode }, function () {
    SiteViewSDK.changeViewerMode(mode);
  });
};

Playground.changePanoViewMode = function (mode) {
  callSDK('CHANGE_PANO_VIEW_MODE', { mode: mode }, function () {
    SiteViewSDK.changePanoViewMode(mode);
  });
};

Playground.changeActiveView = function (viewType) {
  callSDK('CHANGE_ACTIVE_VIEW', { viewType: viewType }, function () {
    SiteViewSDK.changeActiveView(viewType);
  });
};

Playground.changePanoVisibilityMode = function (visibilityMode) {
  callSDK('CHANGE_PANO_VISIBILITY_MODE', { visibilityMode: visibilityMode }, function () {
    SiteViewSDK.changePanoVisibilityMode(visibilityMode);
  });
};

// ── Camera ──

Playground.getCameraParameters = function () {
  callSDK('GET_CAMERA_PARAMETERS', {}, function () {
    SiteViewSDK.getCameraParameters();
  });
};

Playground.setCameraRotate = function (direction, angle) {
  callSDK('SET_CAMERA_ROTATE', { direction: direction, angle: angle }, function () {
    SiteViewSDK.setCameraRotate(direction, angle);
  });
};

Playground.setCameraLookAtPrompt = async function () {
  const result = await showPromptMultiple([
    { name: 'x', label: 'x', defaultValue: sessionStorage.getItem('lookAt_x') || '0' },
    { name: 'y', label: 'y', defaultValue: sessionStorage.getItem('lookAt_y') || '0' },
    { name: 'z', label: 'z', defaultValue: sessionStorage.getItem('lookAt_z') || '0' }
  ]);
  if (!result) return;
  const x = Number(result.x);
  const y = Number(result.y);
  const z = Number(result.z);
  if (isNaN(x) || isNaN(y) || isNaN(z)) {
    setOutputErrorMessage('SET_CAMERA_LOOKAT', 'invalid coordinates', result);
    return;
  }
  sessionStorage.setItem('lookAt_x', result.x);
  sessionStorage.setItem('lookAt_y', result.y);
  sessionStorage.setItem('lookAt_z', result.z);
  callSDK('SET_CAMERA_LOOKAT', { x, y, z }, function () {
    SiteViewSDK.setCameraLookAt(x, y, z);
  });
};

Playground.setCameraParametersPrompt = async function () {
  try {
    const json = await Playground.promptString('SET_CAMERA_PARAMETERS', 'camera parameters (JSON)');
    const params = JSON.parse(json);
    callSDK('SET_CAMERA_PARAMETERS', params, function () {
      SiteViewSDK.setCameraParameters(params);
    });
  } catch (e) {
    if (e.message !== 'cancelled') console.warn(e);
  }
};

Playground.setCameraFirstPerson = function (enable) {
  callSDK('SET_CAMERA_FIRST_PERSON', { enable: enable }, function () {
    SiteViewSDK.setCameraFirstPerson(enable);
  });
};

Playground.setCameraMove = function (direction) {
  callSDK('SET_CAMERA_MOVE', { direction: direction }, function () {
    SiteViewSDK.setCameraMove(direction);
  });
};

Playground.setCameraFov = function (fov) {
  callSDK('SET_CAMERA_FOV', { fov: fov }, function () {
    SiteViewSDK.setCameraFov(fov);
  });
};

Playground.resetView = function () {
  callSDK('RESET_VIEW', {}, function () {
    SiteViewSDK.resetView();
  });
};

// ── Navigation (prompt-based) ──

Playground.changeLevelCapturePrompt = async function () {
  const result = await showPromptMultiple([
    { name: 'levelId', label: 'Level ID', defaultValue: sessionStorage.getItem('levelId') || '' },
    { name: 'captureId', label: 'Capture ID', defaultValue: sessionStorage.getItem('captureId') || '' }
  ]);
  if (!result) return;
  const levelId = Number(result.levelId);
  const captureId = Number(result.captureId);
  if (isNaN(levelId) || isNaN(captureId)) {
    setOutputErrorMessage('CHANGE_LEVEL_CAPTURE', 'invalid input', result);
    return;
  }
  sessionStorage.setItem('levelId', result.levelId);
  sessionStorage.setItem('captureId', result.captureId);
  callSDK('CHANGE_LEVEL_CAPTURE', { levelId, captureId }, function () {
    SiteViewSDK.changeLevelCapture(levelId, captureId);
  });
};

Playground.changePanoPrompt = async function () {
  try {
    const id = await Playground.promptNumber('CHANGE_PANO', 'pano id');
    callSDK('CHANGE_PANO', { panoId: id }, function () {
      SiteViewSDK.changePano(id);
    });
  } catch (e) {
    if (e.message !== 'cancelled') console.warn(e);
  }
};

Playground.changeBimPrompt = async function () {
  const result = await showPromptMultiple([
    { name: 'bim', label: 'BIM ID', defaultValue: sessionStorage.getItem('bimId') || '' },
    { name: 'model', label: 'Model ID (optional)', defaultValue: sessionStorage.getItem('bimModelId') || '' }
  ]);
  if (!result) return;
  const bim = Number(result.bim);
  if (isNaN(bim)) {
    setOutputErrorMessage('CHANGE_BIM', 'invalid bim id', result);
    return;
  }
  sessionStorage.setItem('bimId', result.bim);
  const bimEntry = { bim: bim };
  if (result.model.trim()) {
    const model = Number(result.model);
    if (isNaN(model)) {
      setOutputErrorMessage('CHANGE_BIM', 'invalid model id', result);
      return;
    }
    bimEntry.model = model;
    sessionStorage.setItem('bimModelId', result.model);
  }
  const bims = [bimEntry];
  callSDK('CHANGE_BIM', { bims: bims }, function () {
    SiteViewSDK.changeBim(bims);
  });
};

// ── Annotation ──

Playground.setActiveAnnotationPrompt = async function () {
  try {
    const id = await Playground.promptNumber('SET_ACTIVE_ANNOTATION', 'annotation id');
    callSDK('SET_ACTIVE_ANNOTATION', { annotationId: id }, function () {
      SiteViewSDK.setActiveAnnotation(id);
    });
  } catch (e) {
    if (e.message !== 'cancelled') console.warn(e);
  }
};

Playground.resetActiveAnnotation = function () {
  callSDK('RESET_ACTIVE_ANNOTATION', {}, function () {
    SiteViewSDK.resetActiveAnnotation();
  });
};

Playground.loadAnnotationPrompt = async function () {
  try {
    const id = await Playground.promptNumber('LOAD_ANNOTATION', 'annotation id');
    callSDK('LOAD_ANNOTATION', { annotationId: id }, function () {
      SiteViewSDK.loadAnnotation(id);
    });
  } catch (e) {
    if (e.message !== 'cancelled') console.warn(e);
  }
};

Playground.addAnnotationFormPrompt = async function () {
  const result = await showPromptMultiple([
    { name: 'formTemplateId', label: 'Form Template ID', defaultValue: sessionStorage.getItem('formTemplateId') || '' },
    { name: 'annotationGroupId', label: 'Annotation Group ID', defaultValue: sessionStorage.getItem('annotationGroupId') || '' },
    { name: 'name', label: 'Name', defaultValue: sessionStorage.getItem('annotationName') || 'New Annotation' }
  ]);
  if (!result) return;
  const formTemplateId = Number(result.formTemplateId);
  const annotationGroupId = Number(result.annotationGroupId);
  const name = result.name;
  if (isNaN(formTemplateId) || isNaN(annotationGroupId) || !name) {
    setOutputErrorMessage('ADD_ANNOTATION_FORM', 'invalid input', result);
    return;
  }
  sessionStorage.setItem('formTemplateId', result.formTemplateId);
  sessionStorage.setItem('annotationGroupId', result.annotationGroupId);
  sessionStorage.setItem('annotationName', name);
  const args = { formTemplateId, annotationGroupId, name };
  callSDK('ADD_ANNOTATION_FORM', args, function () {
    SiteViewSDK.addAnnotationForm(formTemplateId, annotationGroupId, name);
  });
};

Playground.setFilterPrompt = async function () {
  try {
    const json = await Playground.promptString('SET_FILTER', 'filter (JSON)');
    const filterArgs = JSON.parse(json);
    callSDK('SET_FILTER', filterArgs, function () {
      SiteViewSDK.setFilter(filterArgs);
    });
  } catch (e) {
    if (e.message !== 'cancelled') console.warn(e);
  }
};

Playground.setAnnotationGroupAllVisibility = function (visible) {
  callSDK('SET_ANNOTATION_GROUP_ALL_VISIBILITY', { visible: visible }, function () {
    SiteViewSDK.setAnnotationGroupAllVisibility(visible);
  });
};

Playground.setAnnotationGroupVisibilityPrompt = async function () {
  const result = await showPromptMultiple([
    { name: 'ids', label: 'Annotation Group IDs (comma-separated)', defaultValue: sessionStorage.getItem('groupVisIds') || '' },
    { name: 'visible', label: "Visible ('true' or 'false')", defaultValue: sessionStorage.getItem('groupVisVisible') || 'true' }
  ]);
  if (!result) return;
  const ids = result.ids.split(',').map(function (s) {
    return Number(s.trim());
  });
  const visible = result.visible === 'true';
  if (ids.some(isNaN) || !result.ids.trim()) {
    setOutputErrorMessage('SET_ANNOTATION_GROUP_VISIBILITY', 'invalid group ids', result);
    return;
  }
  sessionStorage.setItem('groupVisIds', result.ids);
  sessionStorage.setItem('groupVisVisible', result.visible);
  const args = { annotationGroupIds: ids, visible: visible };
  callSDK('SET_ANNOTATION_GROUP_VISIBILITY', args, function () {
    SiteViewSDK.setAnnotationGroupVisibility(ids, visible);
  });
};

Playground.loadAnnotationGroupPrompt = async function () {
  try {
    const str = await Playground.promptString('LOAD_ANNOTATION_GROUP', 'annotation group ids (comma-separated)');
    const ids = str.split(',').map(function (s) {
      return Number(s.trim());
    });
    if (ids.some(isNaN) || !str.trim()) {
      setOutputErrorMessage('LOAD_ANNOTATION_GROUP', 'invalid group ids', { input: str });
      return;
    }
    callSDK('LOAD_ANNOTATION_GROUP', { annotationGroupIds: ids }, function () {
      SiteViewSDK.loadAnnotationGroup(ids);
    });
  } catch (e) {
    if (e.message !== 'cancelled') console.warn(e);
  }
};

// ── Omninote ──

Playground.loadOmninotesPrompt = async function () {
  try {
    const str = await Playground.promptString('LOAD_OMNINOTES', 'omninote keys (comma-separated)');
    var keys = str.split(',').map(function (s) {
      return s.trim();
    }).filter(function (s) {
      return s.length > 0;
    });
    if (keys.length === 0) {
      setOutputErrorMessage('LOAD_OMNINOTES', 'empty keys', { input: str });
      return;
    }
    callSDK('LOAD_OMNINOTES', { omninoteKeys: keys }, function () {
      SiteViewSDK.loadOmninotes(keys);
    });
  } catch (e) {
    if (e.message !== 'cancelled') console.warn(e);
  }
};

Playground.unloadOmninotesPrompt = async function () {
  try {
    const str = await Playground.promptString('UNLOAD_OMNINOTES', 'omninote keys (comma-separated)');
    var keys = str.split(',').map(function (s) {
      return s.trim();
    }).filter(function (s) {
      return s.length > 0;
    });
    if (keys.length === 0) {
      setOutputErrorMessage('UNLOAD_OMNINOTES', 'empty keys', { input: str });
      return;
    }
    callSDK('UNLOAD_OMNINOTES', { omninoteKeys: keys }, function () {
      SiteViewSDK.unloadOmninotes(keys);
    });
  } catch (e) {
    if (e.message !== 'cancelled') console.warn(e);
  }
};

// ── Refplan ──

Playground.enableRefplan = function () {
  callSDK('ENABLE_REFPLAN', {}, function () {
    SiteViewSDK.enableRefplan();
  });
};

Playground.getRefplansOfLevelPrompt = async function () {
  try {
    const id = await Playground.promptNumber('GET_REFPLANS_OF_LEVEL', 'level id');
    callSDK('GET_REFPLANS_OF_LEVEL', { levelId: id }, function () {
      SiteViewSDK.getRefplansOfLevel(id);
    });
  } catch (e) {
    if (e.message !== 'cancelled') console.warn(e);
  }
};

Playground.setActiveRefplanPrompt = async function () {
  try {
    const id = await Playground.promptNumber('SET_ACTIVE_REFPLAN', 'refplan id (-1 to deselect)');
    callSDK('SET_ACTIVE_REFPLAN', { id: id }, function () {
      SiteViewSDK.setActiveRefplan(id);
    });
  } catch (e) {
    if (e.message !== 'cancelled') console.warn(e);
  }
};

// ── Display (button-based) ──

Playground.setOpacity = function (opacity) {
  callSDK('SET_OPACITY', { opacity: opacity }, function () {
    SiteViewSDK.setOpacity(opacity);
  });
};

Playground.setBimBackgroundTransparent = function (transparent) {
  callSDK('SET_BIM_BACKGROUND_TRANSPARENT', { transparent: transparent }, function () {
    SiteViewSDK.setBimBackgroundTransparent(transparent);
  });
};

Playground.setFloatMapVisible = function (visible) {
  callSDK('SET_FLOAT_MAP_VISIBLE', { visible: visible }, function () {
    SiteViewSDK.setFloatMapVisible(visible);
  });
};
