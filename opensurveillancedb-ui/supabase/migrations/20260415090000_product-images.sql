ALTER TABLE "opensurveillancedb-alphav1"."device_model"
	ADD COLUMN IF NOT EXISTS "product_images" text[] NOT NULL DEFAULT '{}'::text[];

DO $$ BEGIN
  ALTER TABLE "opensurveillancedb-alphav1"."device_model"
	ADD CONSTRAINT "device_model_product_images_not_blank"
	CHECK (
		product_images IS NOT NULL
		AND cardinality(array_remove(product_images, NULL)) = cardinality(product_images)
		AND (
			cardinality(product_images) = 0
			OR array_to_string(product_images, ',', '') !~ '(^|,)\s*(,|$)'
		)
	);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public reads from product_images"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((bucket_id = 'product_images'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated uploads to product_images"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK ((bucket_id = 'product_images'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated updates in product_images"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((bucket_id = 'product_images'::text))
  WITH CHECK ((bucket_id = 'product_images'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated deletes from product_images"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING ((bucket_id = 'product_images'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
