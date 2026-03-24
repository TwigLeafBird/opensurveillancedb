export function normalizeHexColor(value?: string | null): string | null {
	if (!value) {
		return null;
	}

	const trimmedValue = value.trim();
	if (!trimmedValue) {
		return null;
	}

	const candidate = trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`;
	return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(candidate)
		? candidate
		: null;
}
