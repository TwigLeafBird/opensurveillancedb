export type FilterSelectionState = {
	manufacturerIds: string[];
	shapeProfileIds: string[];
	colorCodes: string[];
};

export type ValidFilterValues = {
	manufacturerIds: Set<string>;
	shapeProfileIds: Set<string>;
	colorCodes: Set<string>;
};

export type FilterQueryKeys = {
	manufacturer: string;
	shape: string;
	color: string;
};

export const DEFAULT_FILTER_QUERY_KEYS: FilterQueryKeys = {
	manufacturer: 'manufacturer',
	shape: 'shape',
	color: 'color'
};

export function parseMultiValueParam(params: URLSearchParams, key: string): string[] {
	const repeatedValues = params.getAll(key).flatMap((value) => value.split(','));
	const trimmedValues = repeatedValues.map((value) => value.trim()).filter(Boolean);
	return [...new Set(trimmedValues)];
}

export function parseSelectionStateFromParams(
	params: URLSearchParams,
	validValues: ValidFilterValues,
	queryKeys: FilterQueryKeys = DEFAULT_FILTER_QUERY_KEYS
): FilterSelectionState {
	const manufacturerIds = parseMultiValueParam(params, queryKeys.manufacturer).filter((id) =>
		validValues.manufacturerIds.has(id)
	);
	const shapeProfileIds = parseMultiValueParam(params, queryKeys.shape).filter((id) =>
		validValues.shapeProfileIds.has(id)
	);
	const colorCodes = parseMultiValueParam(params, queryKeys.color).filter((code) =>
		validValues.colorCodes.has(code)
	);

	return { manufacturerIds, shapeProfileIds, colorCodes };
}

export function buildSelectionSearchParams(
	currentSearch: string,
	selectionState: FilterSelectionState,
	queryKeys: FilterQueryKeys = DEFAULT_FILTER_QUERY_KEYS
): URLSearchParams {
	const nextParams = new URLSearchParams(currentSearch);
	nextParams.delete(queryKeys.manufacturer);
	nextParams.delete(queryKeys.shape);
	nextParams.delete(queryKeys.color);

	for (const manufacturerId of selectionState.manufacturerIds) {
		nextParams.append(queryKeys.manufacturer, manufacturerId);
	}

	for (const shapeProfileId of selectionState.shapeProfileIds) {
		nextParams.append(queryKeys.shape, shapeProfileId);
	}

	for (const colorCode of selectionState.colorCodes) {
		nextParams.append(queryKeys.color, colorCode);
	}

	return nextParams;
}

export function buildSelectionUrl(
	pathname: string,
	currentSearch: string,
	hash: string,
	selectionState: FilterSelectionState,
	queryKeys: FilterQueryKeys = DEFAULT_FILTER_QUERY_KEYS
): string {
	const nextParams = buildSelectionSearchParams(currentSearch, selectionState, queryKeys);
	const nextSearch = nextParams.toString();
	return `${pathname}${nextSearch ? `?${nextSearch}` : ''}${hash}`;
}
