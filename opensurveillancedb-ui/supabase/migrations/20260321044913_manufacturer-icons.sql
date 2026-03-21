ALTER TABLE "opensurveillancedb-alphav1"."device_manufacturer"
	ADD COLUMN "icons" text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE "opensurveillancedb-alphav1"."device_manufacturer"
	ADD CONSTRAINT "device_brand_logos_not_blank"
	CHECK (
		cardinality(array_remove(icons, NULL)) = cardinality(icons)
		AND array_to_string(icons, ',', '') !~ '(^|,)\s*(,|$)'
	)
	NOT VALID;

CREATE POLICY "Allow public reads from brand_logos"
ON "storage"."objects"
AS PERMISSIVE
FOR SELECT
TO public
USING ((bucket_id = 'brand_logos'::text));

CREATE POLICY "Allow authenticated uploads to brand_logos"
ON "storage"."objects"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK ((bucket_id = 'brand_logos'::text));

CREATE POLICY "Allow authenticated updates in brand_logos"
ON "storage"."objects"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((bucket_id = 'brand_logos'::text))
WITH CHECK ((bucket_id = 'brand_logos'::text));

CREATE POLICY "Allow authenticated deletes from brand_logos"
ON "storage"."objects"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((bucket_id = 'brand_logos'::text));
