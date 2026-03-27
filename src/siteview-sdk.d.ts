export interface ErrorType {
  error: string;
}

export interface AuthOptions {
  accessCode?: string;
  apiToken?: string;
}

export interface BimEntry {
  bim: number;
  model?: number;
}

export declare const OPERATION_TYPE: {
  // System
  readonly HEADLESS_VIEWER_API_START: 'HEADLESS_VIEWER_API_START';
  readonly HEADLESS_VIEWER_API_STOP: 'HEADLESS_VIEWER_API_STOP';

  // Document
  readonly GET_DOCUMENT: 'GET_DOCUMENT';
  readonly GET_SITEVIEW: 'GET_SITEVIEW';
  readonly GET_ACTIVE_LEVEL: 'GET_ACTIVE_LEVEL';
  readonly GET_ACTIVE_CAPTURE: 'GET_ACTIVE_CAPTURE';
  readonly IS_DOCUMENT_LOADED: 'IS_DOCUMENT_LOADED';

  // Viewer Mode
  readonly CHANGE_VIEWER_MODE: 'CHANGE_VIEWER_MODE';
  readonly CHANGE_PANO_VIEW_MODE: 'CHANGE_PANO_VIEW_MODE';
  readonly CHANGE_ACTIVE_VIEW: 'CHANGE_ACTIVE_VIEW';
  readonly CHANGE_PANO_VISIBILITY_MODE: 'CHANGE_PANO_VISIBILITY_MODE';

  // Camera
  readonly GET_CAMERA_PARAMETERS: 'GET_CAMERA_PARAMETERS';
  readonly SET_CAMERA_ROTATE: 'SET_CAMERA_ROTATE';
  readonly SET_CAMERA_LOOKAT: 'SET_CAMERA_LOOKAT';
  readonly SET_CAMERA_PARAMETERS: 'SET_CAMERA_PARAMETERS';
  readonly SET_CAMERA_FIRST_PERSON: 'SET_CAMERA_FIRST_PERSON';
  readonly SET_CAMERA_MOVE: 'SET_CAMERA_MOVE';
  readonly SET_CAMERA_FOV: 'SET_CAMERA_FOV';
  readonly RESET_VIEW: 'RESET_VIEW';

  // Navigation
  readonly CHANGE_LEVEL_CAPTURE: 'CHANGE_LEVEL_CAPTURE';
  readonly CHANGE_PANO: 'CHANGE_PANO';
  readonly CHANGE_BIM: 'CHANGE_BIM';

  // Annotation
  readonly ADD_ANNOTATION_FORM: 'ADD_ANNOTATION_FORM';
  readonly SET_ACTIVE_ANNOTATION: 'SET_ACTIVE_ANNOTATION';
  readonly RESET_ACTIVE_ANNOTATION: 'RESET_ACTIVE_ANNOTATION';
  readonly SET_FILTER: 'SET_FILTER';
  readonly SET_ANNOTATION_GROUP_ALL_VISIBILITY: 'SET_ANNOTATION_GROUP_ALL_VISIBILITY';
  readonly SET_ANNOTATION_GROUP_VISIBILITY: 'SET_ANNOTATION_GROUP_VISIBILITY';
  readonly LOAD_ANNOTATION: 'LOAD_ANNOTATION';
  readonly LOAD_ANNOTATIONS: 'LOAD_ANNOTATIONS';
  readonly LOAD_ANNOTATION_GROUP: 'LOAD_ANNOTATION_GROUP';
  readonly UNLOAD_ANNOTATIONS: 'UNLOAD_ANNOTATIONS';

  // Omninote
  readonly LOAD_OMNINOTES: 'LOAD_OMNINOTES';
  readonly UNLOAD_OMNINOTES: 'UNLOAD_OMNINOTES';

  // Refplan
  readonly ENABLE_REFPLAN: 'ENABLE_REFPLAN';
  readonly GET_REFPLANS_OF_LEVEL: 'GET_REFPLANS_OF_LEVEL';
  readonly SET_ACTIVE_REFPLAN: 'SET_ACTIVE_REFPLAN';

  // Display
  readonly SET_OPACITY: 'SET_OPACITY';
  readonly SET_BIM_BACKGROUND_TRANSPARENT: 'SET_BIM_BACKGROUND_TRANSPARENT';
  readonly SET_FLOAT_MAP_VISIBLE: 'SET_FLOAT_MAP_VISIBLE';
};

interface SiteViewSDK {
  uuid: number;
  quiet: boolean;
  ready: boolean;
  readyPromise: Promise<boolean>;
  OPERATION_TYPE: typeof OPERATION_TYPE;

  // System
  init(htmlDivId: string, siteviewUrl: string, auth?: AuthOptions): Promise<void>;
  start(timeout?: number): Promise<ErrorType>;
  stop(): Promise<ErrorType>;

  // Document
  getDocument(): Promise<ErrorType>;
  getSiteview(): Promise<ErrorType>;
  isDocumentLoaded(): Promise<ErrorType>;
  getActiveLevel(): Promise<ErrorType>;
  getActiveCapture(): Promise<ErrorType>;

  // Viewer Mode
  changeViewerMode(mode: 'pano' | 'bim'): Promise<ErrorType>;
  changePanoViewMode(panoViewMode: 'walk' | 'fly' | 'overhead'): Promise<ErrorType>;
  changeActiveView(viewType: 'pano' | 'bim'): Promise<ErrorType>;
  changePanoVisibilityMode(visibilityMode: 'ALL' | 'PANO' | '3D'): Promise<ErrorType>;

  // Camera
  getCameraParameters(): Promise<ErrorType>;
  setCameraRotate(direction: string, angle: number): Promise<ErrorType>;
  setCameraLookAt(x: number, y: number, z: number): Promise<ErrorType>;
  setCameraParameters(params: Record<string, unknown>): Promise<ErrorType>;
  setCameraFirstPerson(enable: boolean): Promise<ErrorType>;
  setCameraMove(direction: 'FORWARD' | 'BACK' | 'LEFT' | 'RIGHT', distance?: number): Promise<ErrorType>;
  setCameraFov(fov: number): Promise<ErrorType>;
  resetView(): Promise<ErrorType>;

  // Navigation
  changeLevelCapture(levelId: number, captureId: number): Promise<ErrorType>;
  changePano(panoId: number): Promise<ErrorType>;
  changeBim(bims: BimEntry[]): Promise<ErrorType>;

  // Annotation
  addAnnotationForm(formTemplateId: number, annotationGroupId: number, name: string, values: Record<string, unknown>): Promise<ErrorType>;
  setActiveAnnotation(annotationId: number): Promise<ErrorType>;
  resetActiveAnnotation(): Promise<ErrorType>;
  setFilter(filterArgs: Record<string, unknown>): Promise<ErrorType>;
  setAnnotationGroupAllVisibility(visible: boolean): Promise<ErrorType>;
  setAnnotationGroupVisibility(annotationGroupIds: number[], visible: boolean, showThisOnly?: boolean): Promise<ErrorType>;
  loadAnnotation(annotationId: number): Promise<ErrorType>;
  loadAnnotations(annotationIds: number[]): Promise<ErrorType>;
  loadAnnotationGroup(annotationGroupIds: number[]): Promise<ErrorType>;
  unloadAnnotations(annotationIds: number[]): Promise<ErrorType>;

  // Omninote
  loadOmninotes(omninoteKeys: string[]): Promise<ErrorType>;
  unloadOmninotes(omninoteKeys: string[]): Promise<ErrorType>;

  // Refplan
  enableRefplan(): Promise<ErrorType>;
  getRefplansOfLevel(levelId: number): Promise<ErrorType>;
  setActiveRefplan(id: number): Promise<ErrorType>;

  // Display
  setOpacity(opacity: number): Promise<ErrorType>;
  setBimBackgroundTransparent(transparent: boolean): Promise<ErrorType>;
  setFloatMapVisible(visible: boolean): Promise<ErrorType>;
}

declare const SiteViewSDK: SiteViewSDK;
export default SiteViewSDK;
