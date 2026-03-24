import { describe, expect, it } from 'vitest';
import { normalizeHexColor } from './color';

describe('normalizeHexColor', () => {
	it('returns null for empty or missing values', () => {
		expect(normalizeHexColor()).toBeNull();
		expect(normalizeHexColor(null)).toBeNull();
		expect(normalizeHexColor('')).toBeNull();
		expect(normalizeHexColor('   ')).toBeNull();
	});

	it('normalizes valid values with and without a leading hash', () => {
		expect(normalizeHexColor('fff')).toBe('#fff');
		expect(normalizeHexColor('  #00ff88  ')).toBe('#00ff88');
		expect(normalizeHexColor('ABCDEF')).toBe('#ABCDEF');
		expect(normalizeHexColor('#abcd')).toBe('#abcd');
		expect(normalizeHexColor('11223344')).toBe('#11223344');
	});

	it('rejects invalid hex formats', () => {
		expect(normalizeHexColor('#12')).toBeNull();
		expect(normalizeHexColor('#12345')).toBeNull();
		expect(normalizeHexColor('#1234567')).toBeNull();
		expect(normalizeHexColor('#ggg')).toBeNull();
		expect(normalizeHexColor('not-a-color')).toBeNull();
	});
});