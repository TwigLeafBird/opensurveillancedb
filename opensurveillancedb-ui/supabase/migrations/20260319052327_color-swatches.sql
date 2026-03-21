ALTER TABLE "opensurveillancedb-alphav1"."color"
	ADD COLUMN "hex_code" text,
	ADD COLUMN "swatch_icon" text;

ALTER TABLE "opensurveillancedb-alphav1"."color"
	ADD CONSTRAINT "color_swatch_icon_not_blank"
	CHECK (swatch_icon IS NULL OR length(btrim(swatch_icon)) > 0)
	NOT VALID;

ALTER TABLE "opensurveillancedb-alphav1"."device_shape_profile"
	ADD CONSTRAINT "device_shape_profile_icon_not_blank"
	CHECK (icon IS NULL OR length(btrim(icon)) > 0)
	NOT VALID;

CREATE POLICY "Allow public reads from color_swatches"
ON "storage"."objects"
AS PERMISSIVE
FOR SELECT
TO public
USING ((bucket_id = 'color_swatches'::text));

CREATE POLICY "Allow authenticated uploads to color_swatches"
ON "storage"."objects"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK ((bucket_id = 'color_swatches'::text));

CREATE POLICY "Allow authenticated updates in color_swatches"
ON "storage"."objects"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((bucket_id = 'color_swatches'::text))
WITH CHECK ((bucket_id = 'color_swatches'::text));

CREATE POLICY "Allow authenticated deletes from color_swatches"
ON "storage"."objects"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((bucket_id = 'color_swatches'::text));
