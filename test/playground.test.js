// @vitest-environment node
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../playground/playground.js', import.meta.url), 'utf8');

describe('Playground 인증 흐름', () => {
  let dom;
  let page;
  let sdk;
  const input = (id, value) => { page.document.getElementById(id).value = value; };
  const element = (id) => page.document.getElementById(id);
  const mode = (value) => {
    input('input-auth-type', value);
    element('input-auth-type').dispatchEvent(new page.Event('change'));
  };
  const authenticate = () => page.authenticateViewer({ preventDefault: vi.fn() });
  const credentials = () => {
    input('input-client-id', 'test-client');
    input('input-timestamp', '123');
    input('input-signature', 'test-secret');
  };

  beforeEach(() => {
    dom = new JSDOM(html, { url: 'http://localhost', runScripts: 'outside-only' });
    page = dom.window;
    sdk = { init: vi.fn().mockResolvedValue(undefined), authenticate: vi.fn() };
    page.SiteViewSDK = sdk;
    page.eval(script);
  });
  afterEach(() => dom.window.close());

  it('SDK 모드 연결 시 충돌 파라미터를 제거하고 인증 전에는 호출하지 않는다', async () => {
    mode('sdkPresigned');
    expect(element('btn-authenticate').disabled).toBe(true);
    input('input-url', 'https://viewer.test/hsv/key?presigned_mode=1&signature=secret&cupix_api_token=token&qp=keep');
    await page.connectViewer();
    const url = new URL(sdk.init.mock.calls[0][1]);
    expect(url.searchParams.toString()).toBe('qp=keep&use_sdk_auth=1');
    expect(sdk.init.mock.calls[0][2]).toEqual({});
    expect(sdk.authenticate).not.toHaveBeenCalled();
    expect(element('btn-authenticate').disabled).toBe(false);
    expect(element('token-fields').hidden).toBe(true);
  });

  it('실패 후 재시도하며 인증값을 출력하거나 저장하지 않는다', async () => {
    mode('sdkPresigned');
    await page.connectViewer();
    credentials();
    sdk.authenticate.mockResolvedValueOnce({ error: 'AUTHENTICATION_FAILED' }).mockResolvedValueOnce({ authenticated: true });
    await authenticate();
    expect(element('btn-authenticate').disabled).toBe(false);
    await authenticate();
    expect(sdk.authenticate).toHaveBeenLastCalledWith({ client_id: 'test-client', timestamp: '123', signature: 'test-secret' });
    expect(element('btn-authenticate').disabled).toBe(true);
    expect(element('input-signature').value).toBe('');
    expect(element('req-content').innerText).not.toContain('test-secret');
    expect(JSON.stringify(page.localStorage)).not.toContain('test-secret');
  });

  it('원본 인증 응답은 무시하고 일반 API 응답은 출력한다', () => {
    page.setResponseContent('AUTHENTICATE', { authenticated: true });
    const send = (responseType) => page.dispatchEvent(new page.MessageEvent('message', {
      data: {
        header: 'CUPIXWORKS_HEADLESS_VIEWER_API', responseType,
        response: { raw: 'unredacted' }, request: { uuid: '1' }
      }
    }));
    send('AUTHENTICATE_RESPONSE');
    expect(element('resp-type').innerText).toBe('AUTHENTICATE');
    expect(element('resp-content').innerText).not.toContain('unredacted');
    send('GET_DOCUMENT_RESPONSE');
    expect(element('resp-type').innerText).toBe('GET_DOCUMENT_RESPONSE');
    expect(element('resp-content').innerText).toContain('unredacted');
  });

  it('재연결 후 이전 인증 응답이 새 연결 상태를 덮어쓰지 않는다', async () => {
    mode('sdkPresigned');
    await page.connectViewer();
    credentials();
    let resolve;
    sdk.authenticate.mockReturnValue(new Promise((done) => { resolve = done; }));
    const pending = authenticate();
    expect(element('btn-authenticate').disabled).toBe(true);
    await page.connectViewer();
    resolve({ authenticated: true });
    await pending;
    expect(element('btn-authenticate').disabled).toBe(false);
    expect(element('connection-status').innerText).toBe('Waiting for authenticate()');
  });

  it('기존 access code 연결과 명령 검색 후 펼침 상태를 유지한다', async () => {
    mode('accessCode');
    input('input-token', 'test-code');
    await page.connectViewer();
    expect(sdk.init.mock.calls[0][2]).toEqual({ accessCode: 'test-code' });
    const search = element('input-command-search');
    search.value = 'setCameraFov';
    search.dispatchEvent(new page.Event('input'));
    const visible = Array.from(page.document.querySelectorAll('.command-section')).filter((group) => !group.hidden);
    expect(visible).toHaveLength(1);
    expect(visible[0].querySelector('summary').textContent).toBe('Camera');
    expect(visible[0].open).toBe(true);
    search.value = '';
    search.dispatchEvent(new page.Event('input'));
    expect(visible[0].open).toBe(false);
  });
});
