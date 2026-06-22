import { describe, it, expect } from 'vitest';
import { evaluateToken } from '../token';

describe('token — evaluateToken', () => {
  it('accepts pure lowercase tokens', () => {
    expect(evaluateToken('hello')).toBe('ACCEPTED');
    expect(evaluateToken('a')).toBe('ACCEPTED');
  });

  it('rejects empty tokens', () => {
    expect(evaluateToken('')).toBe('REJECTED');
  });

  it('rejects tokens with mixed case', () => {
    expect(evaluateToken('Hello')).toBe('REJECTED');
  });

  it('rejects tokens containing digits, symbols or whitespace', () => {
    expect(evaluateToken('a1')).toBe('REJECTED');
    expect(evaluateToken('a!')).toBe('REJECTED');
    expect(evaluateToken('a b')).toBe('REJECTED');
  });
});
