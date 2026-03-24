
ALTER TABLE "opensurveillancedb-alphav1"."device_model"
	ADD COLUMN "distinguishing_features" text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE "opensurveillancedb-alphav1"."device_model"
	ADD CONSTRAINT "device_model_distinguishing_features_not_blank"
	CHECK (
		distinguishing_features IS NOT NULL
		AND cardinality(array_remove(distinguishing_features, NULL)) = cardinality(distinguishing_features)
		AND (
			cardinality(distinguishing_features) = 0
			OR array_to_string(distinguishing_features, ',', '') !~ '(^|,)\s*(,|$)'
		)
	);
