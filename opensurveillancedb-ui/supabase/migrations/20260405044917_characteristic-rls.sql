ALTER TABLE "opensurveillancedb-alphav1"."defining_characteristic"
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE "opensurveillancedb-alphav1"."device_model_defining_characteristic"
    ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  create policy "Enable read access for all users"
  on "opensurveillancedb-alphav1"."defining_characteristic"
  as permissive
  for select
  to public
using (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  create policy "Enable write access for authenticated users"
  on "opensurveillancedb-alphav1"."defining_characteristic"
  as permissive
  for all
  to authenticated
using (true)
with check (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  create policy "Enable read access for all users"
  on "opensurveillancedb-alphav1"."device_model_defining_characteristic"
  as permissive
  for select
  to public
using (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  create policy "Enable write access for authenticated users"
  on "opensurveillancedb-alphav1"."device_model_defining_characteristic"
  as permissive
  for all
  to authenticated
using (true)
with check (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;