ALTER TABLE "opensurveillancedb-alphav1"."device_manufacturer"
	ADD COLUMN IF NOT EXISTS "icons" text[] NOT NULL DEFAULT '{}'::text[];

DO $$ BEGIN
  ALTER TABLE "opensurveillancedb-alphav1"."device_manufacturer"
	ADD CONSTRAINT "device_manufacturer_icons_not_blank"
	CHECK (
		icons IS NOT NULL
		AND cardinality(array_remove(icons, NULL)) = cardinality(icons)
		AND (
			cardinality(icons) = 0
			OR array_to_string(icons, ',', '') !~ '(^|,)\s*(,|$)'
		)
	);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public reads from brand_logos"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((bucket_id = 'brand_logos'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated uploads to brand_logos"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK ((bucket_id = 'brand_logos'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated updates in brand_logos"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((bucket_id = 'brand_logos'::text))
  WITH CHECK ((bucket_id = 'brand_logos'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated deletes from brand_logos"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING ((bucket_id = 'brand_logos'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  create policy "Allow authenticated deletes from manufacturer_icons"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
  using ((bucket_id = 'manufacturer_icons'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  create policy "Allow authenticated updates in manufacturer_icons"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
  using ((bucket_id = 'manufacturer_icons'::text))
  with check ((bucket_id = 'manufacturer_icons'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  create policy "Allow authenticated uploads to manufacturer_icons"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
  with check ((bucket_id = 'manufacturer_icons'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  create policy "Allow public reads from manufacturer_icons"
  on "storage"."objects"
  as permissive
  for select
  to public
  using ((bucket_id = 'manufacturer_icons'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
