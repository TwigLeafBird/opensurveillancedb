ALTER TABLE "opensurveillancedb-alphav1"."color"
	ADD COLUMN "hex_code" text,
	ADD COLUMN "swatch_icon" text;

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
