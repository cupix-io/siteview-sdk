import { describe, it, expect, vi, beforeEach } from 'vitest';

// Provide minimal browser globals before importing the SDK
globalThis.window = globalThis;
globalThis.window.addEventListener = vi.fn();

// Import after globals are set up
const { default: SiteViewSDK } = await import('../src/siteview-sdk.js');

describe('OPERATION_TYPE', () => {
  const OPS = SiteViewSDK.OPERATION_TYPE;

  it('모든 operation type 값이 키와 동일해야 한다', () => {
    for (const [key, value] of Object.entries(OPS)) {
      expect(value).toBe(key);
    }
  });

  const expectedTypes = [
    'HEADLESS_VIEWER_API_START',
    'HEADLESS_VIEWER_API_STOP',
    'GET_DOCUMENT',
    'GET_SITEVIEW',
    'GET_ACTIVE_LEVEL',
    'GET_ACTIVE_CAPTURE',
    'IS_DOCUMENT_LOADED',
    'CHANGE_VIEWER_MODE',
    'CHANGE_PANO_VIEW_MODE',
    'CHANGE_ACTIVE_VIEW',
    'CHANGE_PANO_VISIBILITY_MODE',
    'SET_PANO_RENDERING_MODE',
    'GET_CAMERA_PARAMETERS',
    'SET_CAMERA_ROTATE',
    'SET_CAMERA_LOOKAT',
    'SET_CAMERA_PARAMETERS',
    'SET_CAMERA_FIRST_PERSON',
    'SET_CAMERA_MOVE',
    'SET_CAMERA_FOV',
    'RESET_VIEW',
    'CHANGE_LEVEL_CAPTURE',
    'CHANGE_PANO',
    'CHANGE_BIM',
    'ADD_ANNOTATION_FORM',
    'SET_ACTIVE_ANNOTATION',
    'RESET_ACTIVE_ANNOTATION',
    'SET_FILTER',
    'SET_ANNOTATION_GROUP_ALL_VISIBILITY',
    'SET_ANNOTATION_GROUP_VISIBILITY',
    'LOAD_ANNOTATION',
    'LOAD_ANNOTATIONS',
    'LOAD_ANNOTATION_GROUP',
    'UNLOAD_ANNOTATIONS',
    'SET_ANNOTATION_USER_COLOR',
    'START_ANNOTATION_RELOCATION',
    'COMPLETE_ANNOTATION_RELOCATION',
    'CANCEL_ANNOTATION_RELOCATION',
    'LOAD_OMNINOTES',
    'LOOK_AT_OMNINOTE',
    'SET_ACTIVE_OMNINOTE',
    'RESET_ACTIVE_OMNINOTE',
    'SET_OMNINOTE_TAG_VISIBILITY',
    'SET_OMNINOTE_TAG_ALL_VISIBILITY',
    'UNLOAD_OMNINOTES',
    'ENABLE_REFPLAN',
    'GET_REFPLANS_OF_LEVEL',
    'SET_ACTIVE_REFPLAN',
    'SET_OPACITY',
    'SET_BIM_BACKGROUND_TRANSPARENT',
    'SET_FLOAT_MAP_VISIBLE'
  ];

  it.each(expectedTypes)('OPERATION_TYPE에 %s가 존재해야 한다', (type) => {
    expect(OPS).toHaveProperty(type);
  });

  it('예상하지 않은 operation type이 없어야 한다', () => {
    const actual = Object.keys(OPS).sort();
    const expected = [...expectedTypes].sort();
    expect(actual).toEqual(expected);
  });
});

describe('SiteViewSDK 초기 상태', () => {
  it('uuid가 0이어야 한다', () => {
    expect(SiteViewSDK.uuid).toBe(0);
  });

  it('quiet이 false여야 한다', () => {
    expect(SiteViewSDK.quiet).toBe(false);
  });

  it('ready가 false여야 한다', () => {
    expect(SiteViewSDK.ready).toBe(false);
  });

  it('readyPromise가 존재해야 한다', () => {
    expect(SiteViewSDK.readyPromise).toBeInstanceOf(Promise);
  });
});

describe('SDK wrapper 함수 - sendToCupix 호출 검증', () => {
  let sendSpy;

  beforeEach(() => {
    sendSpy = vi.fn().mockResolvedValue({});
    SiteViewSDK.sendToCupix = sendSpy;
  });

  // Document
  it('getDocument()는 GET_DOCUMENT를 전송해야 한다', () => {
    SiteViewSDK.getDocument();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'GET_DOCUMENT' });
  });

  it('getSiteview()는 GET_SITEVIEW를 전송해야 한다', () => {
    SiteViewSDK.getSiteview();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'GET_SITEVIEW' });
  });

  it('isDocumentLoaded()는 IS_DOCUMENT_LOADED를 전송해야 한다', () => {
    SiteViewSDK.isDocumentLoaded();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'IS_DOCUMENT_LOADED' });
  });

  it('getActiveLevel()은 GET_ACTIVE_LEVEL을 전송해야 한다', () => {
    SiteViewSDK.getActiveLevel();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'GET_ACTIVE_LEVEL' });
  });

  it('getActiveCapture()는 GET_ACTIVE_CAPTURE를 전송해야 한다', () => {
    SiteViewSDK.getActiveCapture();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'GET_ACTIVE_CAPTURE' });
  });

  // Viewer Mode
  it('changeViewerMode("pano")는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.changeViewerMode('pano');
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'CHANGE_VIEWER_MODE',
      operationArgs: { viewerMode: 'pano' }
    });
  });

  it('changePanoViewMode("fly")는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.changePanoViewMode('fly');
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'CHANGE_PANO_VIEW_MODE',
      operationArgs: { panoViewMode: 'fly' }
    });
  });

  it('changeActiveView("bim")는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.changeActiveView('bim');
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'CHANGE_ACTIVE_VIEW',
      operationArgs: { viewType: 'bim' }
    });
  });

  it('changePanoVisibilityMode("3D")는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.changePanoVisibilityMode('3D');
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'CHANGE_PANO_VISIBILITY_MODE',
      operationArgs: { visibilityMode: '3D' }
    });
  });

  it('setPanoRenderingMode("NORMAL")은 width 없이 전송해야 한다', () => {
    SiteViewSDK.setPanoRenderingMode('NORMAL');
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_PANO_RENDERING_MODE',
      operationArgs: { renderingMode: 'NORMAL' }
    });
  });

  it('setPanoRenderingMode("CUBEMAP", 6144)는 cubemap width를 전송해야 한다', () => {
    SiteViewSDK.setPanoRenderingMode('CUBEMAP', 6144);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_PANO_RENDERING_MODE',
      operationArgs: { renderingMode: 'CUBEMAP', width: 6144 }
    });
  });

  // Camera
  it('getCameraParameters()는 GET_CAMERA_PARAMETERS를 전송해야 한다', () => {
    SiteViewSDK.getCameraParameters();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'GET_CAMERA_PARAMETERS' });
  });

  it('setCameraRotate("LEFT", 15)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setCameraRotate('LEFT', 15);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_CAMERA_ROTATE',
      operationArgs: { direction: 'LEFT', angle: 15 }
    });
  });

  it('setCameraLookAt(1, 2, 3)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setCameraLookAt(1, 2, 3);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_CAMERA_LOOKAT',
      operationArgs: { lookAtX: 1, lookAtY: 2, lookAtZ: 3 }
    });
  });

  it('setCameraParameters({fov: 90})는 params를 그대로 전달해야 한다', () => {
    SiteViewSDK.setCameraParameters({ fov: 90 });
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_CAMERA_PARAMETERS',
      operationArgs: { fov: 90 }
    });
  });

  it('setCameraFirstPerson(true)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setCameraFirstPerson(true);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_CAMERA_FIRST_PERSON',
      operationArgs: { enable: true }
    });
  });

  it('setCameraMove("FORWARD")는 direction만 전송해야 한다', () => {
    SiteViewSDK.setCameraMove('FORWARD');
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_CAMERA_MOVE',
      operationArgs: { direction: 'FORWARD' }
    });
  });

  it('setCameraMove("BACK", 5)는 distance도 포함해야 한다', () => {
    SiteViewSDK.setCameraMove('BACK', 5);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_CAMERA_MOVE',
      operationArgs: { direction: 'BACK', distance: 5 }
    });
  });

  it('setCameraFov(60)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setCameraFov(60);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_CAMERA_FOV',
      operationArgs: { fov: 60 }
    });
  });

  it('resetView()는 RESET_VIEW를 전송해야 한다', () => {
    SiteViewSDK.resetView();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'RESET_VIEW' });
  });

  // Navigation
  it('changeLevelCapture(1, 2)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.changeLevelCapture(1, 2);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'CHANGE_LEVEL_CAPTURE',
      operationArgs: { levelId: 1, captureId: 2 }
    });
  });

  it('changePano(123)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.changePano(123);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'CHANGE_PANO',
      operationArgs: { panoId: 123 }
    });
  });

  it('changeBim([{bim:1, model:2}])는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.changeBim([{ bim: 1, model: 2 }]);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'CHANGE_BIM',
      operationArgs: { bims: [{ bim: 1, model: 2 }] }
    });
  });

  // Annotation
  it('addAnnotationForm()는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.addAnnotationForm(10, 20, 'Test', { field: 'val' });
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'ADD_ANNOTATION_FORM',
      operationArgs: { formTemplateId: 10, annotationGroupId: 20, name: 'Test', values: { field: 'val' } }
    });
  });

  it('setActiveAnnotation(5)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setActiveAnnotation(5);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_ACTIVE_ANNOTATION',
      operationArgs: { annotationId: 5 }
    });
  });

  it('resetActiveAnnotation()는 RESET_ACTIVE_ANNOTATION을 전송해야 한다', () => {
    SiteViewSDK.resetActiveAnnotation();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'RESET_ACTIVE_ANNOTATION' });
  });

  it('startAnnotationRelocation(7)은 annotationId를 포함해 전송해야 한다', () => {
    SiteViewSDK.startAnnotationRelocation(7);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'START_ANNOTATION_RELOCATION',
      operationArgs: { annotationId: 7 }
    });
  });

  it('startAnnotationRelocation()은 annotationId 없이 전송해야 한다 (active annotation 대상)', () => {
    SiteViewSDK.startAnnotationRelocation();
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'START_ANNOTATION_RELOCATION',
      operationArgs: {}
    });
  });

  it('completeAnnotationRelocation(false)는 updateViewpoint를 포함해 전송해야 한다', () => {
    SiteViewSDK.completeAnnotationRelocation(false);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'COMPLETE_ANNOTATION_RELOCATION',
      operationArgs: { updateViewpoint: false }
    });
  });

  it('completeAnnotationRelocation()은 updateViewpoint 없이 전송해야 한다 (기본값은 뷰어 측 true)', () => {
    SiteViewSDK.completeAnnotationRelocation();
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'COMPLETE_ANNOTATION_RELOCATION',
      operationArgs: {}
    });
  });

  it('cancelAnnotationRelocation()은 CANCEL_ANNOTATION_RELOCATION을 전송해야 한다', () => {
    SiteViewSDK.cancelAnnotationRelocation();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'CANCEL_ANNOTATION_RELOCATION' });
  });

  it('setFilter({status: "open"})는 filterArgs를 그대로 전달해야 한다', () => {
    SiteViewSDK.setFilter({ status: 'open' });
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_FILTER',
      operationArgs: { status: 'open' }
    });
  });

  it('setAnnotationGroupAllVisibility(true)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setAnnotationGroupAllVisibility(true);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_ANNOTATION_GROUP_ALL_VISIBILITY',
      operationArgs: { visible: true }
    });
  });

  it('setAnnotationGroupVisibility([1,2], false)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setAnnotationGroupVisibility([1, 2], false);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_ANNOTATION_GROUP_VISIBILITY',
      operationArgs: { annotationGroupIds: [1, 2], visible: false }
    });
  });

  it('setAnnotationGroupVisibility에 showThisOnly를 전달할 수 있어야 한다', () => {
    SiteViewSDK.setAnnotationGroupVisibility([3], true, true);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_ANNOTATION_GROUP_VISIBILITY',
      operationArgs: { annotationGroupIds: [3], visible: true, showThisOnly: true }
    });
  });

  it('loadAnnotation(10)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.loadAnnotation(10);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'LOAD_ANNOTATION',
      operationArgs: { annotationId: 10 }
    });
  });

  it('loadAnnotations([1,2,3])는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.loadAnnotations([1, 2, 3]);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'LOAD_ANNOTATIONS',
      operationArgs: { annotationIds: [1, 2, 3] }
    });
  });

  it('loadAnnotationGroup([4,5])는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.loadAnnotationGroup([4, 5]);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'LOAD_ANNOTATION_GROUP',
      operationArgs: { annotationGroupIds: [4, 5] }
    });
  });

  it('unloadAnnotations([6,7])는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.unloadAnnotations([6, 7]);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'UNLOAD_ANNOTATIONS',
      operationArgs: { annotationIds: [6, 7] }
    });
  });

  it('setAnnotationUserColor(42, {foregroundColor, backgroundColor})는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setAnnotationUserColor(42, { foregroundColor: '#ffffff', backgroundColor: '#ff5722' });
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_ANNOTATION_USER_COLOR',
      operationArgs: { annotationId: 42, foregroundColor: '#ffffff', backgroundColor: '#ff5722' }
    });
  });

  it('setAnnotationUserColor에서 foregroundColor만 전달할 수 있어야 한다', () => {
    SiteViewSDK.setAnnotationUserColor(42, { foregroundColor: '#ffffff' });
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_ANNOTATION_USER_COLOR',
      operationArgs: { annotationId: 42, foregroundColor: '#ffffff' }
    });
  });

  it('setAnnotationUserColor에서 backgroundColor만 전달할 수 있어야 한다', () => {
    SiteViewSDK.setAnnotationUserColor(42, { backgroundColor: '#ff5722' });
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_ANNOTATION_USER_COLOR',
      operationArgs: { annotationId: 42, backgroundColor: '#ff5722' }
    });
  });

  it('setAnnotationUserColor에서 null로 색상을 리셋할 수 있어야 한다', () => {
    SiteViewSDK.setAnnotationUserColor(42, { foregroundColor: null, backgroundColor: null });
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_ANNOTATION_USER_COLOR',
      operationArgs: { annotationId: 42, foregroundColor: null, backgroundColor: null }
    });
  });

  // Omninote
  it('loadOmninotes(["key1","key2"])는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.loadOmninotes(['key1', 'key2']);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'LOAD_OMNINOTES',
      operationArgs: { omninoteKeys: ['key1', 'key2'] }
    });
  });

  it('lookAtOmninote("key1")는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.lookAtOmninote('key1');
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'LOOK_AT_OMNINOTE',
      operationArgs: { omninoteKey: 'key1' }
    });
  });

  it('setActiveOmninote("key1")는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setActiveOmninote('key1');
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_ACTIVE_OMNINOTE',
      operationArgs: { omninoteKey: 'key1' }
    });
  });

  it('resetActiveOmninote()는 RESET_ACTIVE_OMNINOTE를 전송해야 한다', () => {
    SiteViewSDK.resetActiveOmninote();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'RESET_ACTIVE_OMNINOTE' });
  });

  it('setOmninoteTagVisibility([1,2], false, true)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setOmninoteTagVisibility([1, 2], false, true);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_OMNINOTE_TAG_VISIBILITY',
      operationArgs: { omninoteTagIds: [1, 2], visible: false, showThisOnly: true }
    });
  });

  it('setOmninoteTagAllVisibility(true)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setOmninoteTagAllVisibility(true);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_OMNINOTE_TAG_ALL_VISIBILITY',
      operationArgs: { visible: true }
    });
  });

  it('unloadOmninotes(["key1"])는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.unloadOmninotes(['key1']);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'UNLOAD_OMNINOTES',
      operationArgs: { omninoteKeys: ['key1'] }
    });
  });

  // Refplan
  it('enableRefplan()는 ENABLE_REFPLAN을 전송해야 한다', () => {
    SiteViewSDK.enableRefplan();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'ENABLE_REFPLAN' });
  });

  it('getRefplansOfLevel(1)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.getRefplansOfLevel(1);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'GET_REFPLANS_OF_LEVEL',
      operationArgs: { levelId: 1 }
    });
  });

  it('setActiveRefplan(5)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setActiveRefplan(5);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_ACTIVE_REFPLAN',
      operationArgs: { id: 5 }
    });
  });

  // Display
  it('setOpacity(0.5)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setOpacity(0.5);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_OPACITY',
      operationArgs: { opacity: 0.5 }
    });
  });

  it('setBimBackgroundTransparent(true)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setBimBackgroundTransparent(true);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_BIM_BACKGROUND_TRANSPARENT',
      operationArgs: { transparent: true }
    });
  });

  it('setFloatMapVisible(false)는 올바른 operationArgs를 전송해야 한다', () => {
    SiteViewSDK.setFloatMapVisible(false);
    expect(sendSpy).toHaveBeenCalledWith({
      operationType: 'SET_FLOAT_MAP_VISIBLE',
      operationArgs: { visible: false }
    });
  });
});

describe('SiteViewSDK.start / stop', () => {
  let sendSpy;

  beforeEach(() => {
    sendSpy = vi.fn().mockResolvedValue({});
    SiteViewSDK.sendToCupix = sendSpy;
  });

  it('start()는 HEADLESS_VIEWER_API_START를 전송해야 한다', () => {
    SiteViewSDK.start();
    expect(sendSpy).toHaveBeenCalledWith(
      { operationType: 'HEADLESS_VIEWER_API_START' },
      undefined
    );
  });

  it('start(30000)는 timeout을 전달해야 한다', () => {
    SiteViewSDK.start(30000);
    expect(sendSpy).toHaveBeenCalledWith(
      { operationType: 'HEADLESS_VIEWER_API_START' },
      30000
    );
  });

  it('stop()는 HEADLESS_VIEWER_API_STOP를 전송해야 한다', () => {
    SiteViewSDK.stop();
    expect(sendSpy).toHaveBeenCalledWith({ operationType: 'HEADLESS_VIEWER_API_STOP' });
  });
});
