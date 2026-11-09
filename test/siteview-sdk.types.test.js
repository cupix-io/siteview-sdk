// @vitest-environment node
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

describe('SiteViewSDK 공개 타입', () => {
  it('어노테이션 로드 결과의 기존 오류 접근과 성공 결과 타입을 지원한다', () => {
    const consumer = fileURLToPath(new URL('./types/load-annotations.ts', import.meta.url));
    const program = ts.createProgram([consumer], {
      strict: true,
      exactOptionalPropertyTypes: true,
      noEmit: true,
      types: [],
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);

    expect(diagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))).toEqual([]);
  });
});
