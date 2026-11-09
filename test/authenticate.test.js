import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('presigned SDK 인증 메시지', () => {
  let sdk;
  let frame;
  let post;
  const credential = { client_id: 'client', timestamp: '123', signature: 'private-signature' };

  const respond = (data, origin = 'https://viewer.test') => window.dispatchEvent(new MessageEvent('message', {
    source: frame.contentWindow, origin, data: { header: 'CUPIXWORKS_HEADLESS_VIEWER_API', ...data }
  }));

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    document.body.innerHTML = '<div id="viewer"></div>';
    sdk = (await import('../src/siteview-sdk.js')).default;
    const init = sdk.init('viewer', 'https://viewer.test/hsv/abc123?use_sdk_auth=1');
    frame = document.querySelector('iframe');
    frame.dispatchEvent(new Event('load'));
    await init;
    post = vi.spyOn(frame.contentWindow, 'postMessage').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('문서 로딩 없이 API 준비를 확인한 후 presigned를 지정 origin에만 전달한다', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const result = sdk.authenticate(credential);
    expect(post.mock.calls[0][0].operationType).toBe('HEADLESS_VIEWER_API_START');
    expect(JSON.stringify(post.mock.calls)).not.toContain(credential.signature);
    respond({ responseType: 'HEADLESS_VIEWER_API_START_RESPONSE', response: { running: true } });
    await vi.advanceTimersByTimeAsync(100);
    const [message, origin] = post.mock.calls.find(([data]) => data.operationType === 'AUTHENTICATE');
    expect(message.operationArgs).toEqual(credential);
    expect(origin).toBe('https://viewer.test');
    expect(frame.src).not.toContain(credential.signature);
    respond({ responseType: 'AUTHENTICATE_RESPONSE', response: { authenticated: true }, request: { uuid: message.uuid } });
    await expect(result).resolves.toEqual({ authenticated: true });
    expect(JSON.stringify(log.mock.calls)).not.toContain(credential.signature);
  });

  it('다른 origin의 준비 응답은 무시하고 시간 초과 후 인증 정보를 보내지 않는다', async () => {
    const result = sdk.authenticate(credential);
    respond({ responseType: 'HEADLESS_VIEWER_API_START_RESPONSE' }, 'https://other.test');
    await vi.advanceTimersByTimeAsync(15000);
    await expect(result).resolves.toMatchObject({ error: expect.stringContaining('timeout') });
    expect(post.mock.calls.some(([data]) => data.operationType === 'AUTHENTICATE')).toBe(false);
  });

  it('일반 API 명령도 연결 origin으로만 전송하고 다른 origin 응답은 무시한다', async () => {
    sdk.quiet = true;
    respond({ responseType: 'HEADLESS_VIEWER_API_START_RESPONSE' });
    const result = sdk.sendToCupix({ operationType: 'SET_FILTER', operationArgs: { filter: 'private-filter' } });
    await vi.advanceTimersByTimeAsync(0);
    const [message, origin] = post.mock.calls.find(([data]) => data.operationType === 'SET_FILTER');
    expect(origin).toBe('https://viewer.test');
    respond({ responseType: 'SET_FILTER_RESPONSE', response: { accepted: false }, request: { uuid: message.uuid } }, 'https://other.test');
    respond({ responseType: 'SET_FILTER_RESPONSE', response: { accepted: true }, request: { uuid: message.uuid } });
    await expect(result).resolves.toEqual({ accepted: true });
  });

  it('인증 실패를 호출자에게 반환한다', async () => {
    respond({ responseType: 'HEADLESS_VIEWER_API_START_RESPONSE' });
    const result = sdk.authenticate(credential);
    await vi.advanceTimersByTimeAsync(0);
    const [message] = post.mock.calls.find(([data]) => data.operationType === 'AUTHENTICATE');
    respond({ responseType: 'AUTHENTICATE_RESPONSE', errorMessage: 'AUTHENTICATION_FAILED', request: { uuid: message.uuid } });
    await expect(result).resolves.toMatchObject({ errorMessage: 'AUTHENTICATION_FAILED' });
  });
});
