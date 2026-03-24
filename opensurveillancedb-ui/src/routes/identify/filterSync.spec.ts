import { describe, expect, it } from 'vitest';
import {
	buildSelectionSearchParams,
	buildSelectionUrl,
	parseMultiValueParam,
	parseSelectionStateFromParams
} from './filterSync';

describe('parseMultiValueParam', () => {
	it('parses repeated and comma-separated values, trims, deduplicates, and drops blanks', () => {
		const params = new URLSearchParams('color= red , blue&color=blue&color=&color=green');
		expect(parseMultiValueParam(params, 'color')).toEqual(['red', 'blue', 'green']);
	});
});

describe('parseSelectionStateFromParams', () => {
	it('returns only valid values for each filter type', () => {
		const params = new URLSearchParams(
			'manufacturer=m1,m2,invalid&shape=s1&shape=invalid&color=c1&color=bad'
		);

		const result = parseSelectionStateFromParams(params, {
			manufacturerIds: new Set(['m1', 'm2']),
			shapeProfileIds: new Set(['s1']),
			colorCodes: new Set(['c1', 'c2'])
		});

		expect(result).toEqual({
			manufacturerIds: ['m1', 'm2'],
			shapeProfileIds: ['s1'],
			colorCodes: ['c1']
		});
	});
});

describe('buildSelectionSearchParams', () => {
	it('replaces only filter params and preserves unrelated params', () => {
		const params = buildSelectionSearchParams('?foo=1&manufacturer=old&shape=old&color=old', {
			manufacturerIds: ['m1'],
			shapeProfileIds: ['s1', 's2'],
			colorCodes: ['c1']
		});

		expect(params.toString()).toBe('foo=1&manufacturer=m1&shape=s1&shape=s2&color=c1');
	});
});

describe('buildSelectionUrl', () => {
	it('builds a full URL and omits query string when all filters are empty', () => {
		const withFilters = buildSelectionUrl('/identify', '?foo=1&manufacturer=old', '#hash', {
			manufacturerIds: ['m1'],
			shapeProfileIds: ['s1'],
			colorCodes: ['c1']
		});
		expect(withFilters).toBe('/identify?foo=1&manufacturer=m1&shape=s1&color=c1#hash');

		const withoutFilters = buildSelectionUrl(
			'/identify',
			'?manufacturer=old&shape=old&color=old',
			'',
			{
				manufacturerIds: [],
				shapeProfileIds: [],
				colorCodes: []
			}
		);
		expect(withoutFilters).toBe('/identify');
	});
});
