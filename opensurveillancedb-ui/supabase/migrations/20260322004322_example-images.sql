ALTER TABLE "opensurveillancedb-alphav1"."device_model"
	ADD COLUMN IF NOT EXISTS "example_images" text[] NOT NULL DEFAULT '{}'::text[];

DO $$ BEGIN
  ALTER TABLE "opensurveillancedb-alphav1"."device_model"
	ADD CONSTRAINT "device_model_example_images_not_blank"
	CHECK (
		example_images IS NOT NULL
		AND cardinality(array_remove(example_images, NULL)) = cardinality(example_images)
		AND (
			cardinality(example_images) = 0
			OR array_to_string(example_images, ',', '') !~ '(^|,)\s*(,|$)'
		)
	);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public reads from model_example_images"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((bucket_id = 'model_example_images'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated uploads to model_example_images"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK ((bucket_id = 'model_example_images'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated updates in model_example_images"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((bucket_id = 'model_example_images'::text))
  WITH CHECK ((bucket_id = 'model_example_images'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated deletes from model_example_images"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING ((bucket_id = 'model_example_images'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
