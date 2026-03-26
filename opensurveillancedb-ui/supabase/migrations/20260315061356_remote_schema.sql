drop extension if exists "pg_net";

create schema if not exists "opensurveillancedb-alphav1";


  create table if not exists "opensurveillancedb-alphav1"."color" (
    "code" text not null,
    "name" text not null
      );


alter table "opensurveillancedb-alphav1"."color" enable row level security;


  create table if not exists "opensurveillancedb-alphav1"."device_color_option" (
    "model_id" uuid not null,
    "color_id" text not null
      );


alter table "opensurveillancedb-alphav1"."device_color_option" enable row level security;


  create table if not exists "opensurveillancedb-alphav1"."device_location" (
    "code" text not null,
    "name" text not null
      );


alter table "opensurveillancedb-alphav1"."device_location" enable row level security;


  create table if not exists "opensurveillancedb-alphav1"."device_manufacturer" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "alternate_names" text[]
      );


alter table "opensurveillancedb-alphav1"."device_manufacturer" enable row level security;


  create table if not exists "opensurveillancedb-alphav1"."device_model" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "manufacturer" uuid,
    "shape_profile" uuid,
    "datasheet_url" text,
    "product_url" text
      );


alter table "opensurveillancedb-alphav1"."device_model" enable row level security;


  create table if not exists "opensurveillancedb-alphav1"."device_possible_location" (
    "model_id" uuid not null,
    "location_code" text not null
      );


alter table "opensurveillancedb-alphav1"."device_possible_location" enable row level security;


  create table if not exists "opensurveillancedb-alphav1"."device_shape_profile" (
    "id" uuid not null default gen_random_uuid(),
    "short_name" text not null,
    "icon" text
      );


alter table "opensurveillancedb-alphav1"."device_shape_profile" enable row level security;

CREATE UNIQUE INDEX IF NOT EXISTS color_pkey ON "opensurveillancedb-alphav1".color USING btree (code);

CREATE UNIQUE INDEX IF NOT EXISTS device_color_option_pkey ON "opensurveillancedb-alphav1".device_color_option USING btree (model_id, color_id);

CREATE UNIQUE INDEX IF NOT EXISTS device_location_name_key ON "opensurveillancedb-alphav1".device_location USING btree (name);

CREATE UNIQUE INDEX IF NOT EXISTS device_location_pkey ON "opensurveillancedb-alphav1".device_location USING btree (code);

CREATE UNIQUE INDEX IF NOT EXISTS device_manufacturer_name_key ON "opensurveillancedb-alphav1".device_manufacturer USING btree (name);

CREATE UNIQUE INDEX IF NOT EXISTS device_manufacturer_pkey ON "opensurveillancedb-alphav1".device_manufacturer USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS device_model_pkey ON "opensurveillancedb-alphav1".device_model USING btree (id);

CREATE UNIQUE INDEX IF NOT EXISTS device_possible_location_pkey ON "opensurveillancedb-alphav1".device_possible_location USING btree (model_id, location_code);

CREATE UNIQUE INDEX IF NOT EXISTS device_shape_profile_pkey ON "opensurveillancedb-alphav1".device_shape_profile USING btree (id);

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."color" add constraint "color_pkey" PRIMARY KEY using index "color_pkey";
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_color_option" add constraint "device_color_option_pkey" PRIMARY KEY using index "device_color_option_pkey";
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_location" add constraint "device_location_pkey" PRIMARY KEY using index "device_location_pkey";
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_manufacturer" add constraint "device_manufacturer_pkey" PRIMARY KEY using index "device_manufacturer_pkey";
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_model" add constraint "device_model_pkey" PRIMARY KEY using index "device_model_pkey";
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_possible_location" add constraint "device_possible_location_pkey" PRIMARY KEY using index "device_possible_location_pkey";
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_shape_profile" add constraint "device_shape_profile_pkey" PRIMARY KEY using index "device_shape_profile_pkey";
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_color_option" add constraint "device_color_option_color_id_fkey" FOREIGN KEY (color_id) REFERENCES "opensurveillancedb-alphav1".color(code) not valid;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

alter table "opensurveillancedb-alphav1"."device_color_option" validate constraint "device_color_option_color_id_fkey";

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_color_option" add constraint "device_color_option_model_id_fkey" FOREIGN KEY (model_id) REFERENCES "opensurveillancedb-alphav1".device_model(id) not valid;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

alter table "opensurveillancedb-alphav1"."device_color_option" validate constraint "device_color_option_model_id_fkey";

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_location" add constraint "device_location_name_key" UNIQUE using index "device_location_name_key";
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_manufacturer" add constraint "device_manufacturer_name_key" UNIQUE using index "device_manufacturer_name_key";
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_model" add constraint "device_model_manufacturer_fkey" FOREIGN KEY (manufacturer) REFERENCES "opensurveillancedb-alphav1".device_manufacturer(id) not valid;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

alter table "opensurveillancedb-alphav1"."device_model" validate constraint "device_model_manufacturer_fkey";

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_model" add constraint "device_model_shape_profile_fkey" FOREIGN KEY (shape_profile) REFERENCES "opensurveillancedb-alphav1".device_shape_profile(id) not valid;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

alter table "opensurveillancedb-alphav1"."device_model" validate constraint "device_model_shape_profile_fkey";

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_possible_location" add constraint "device_possible_location_location_code_fkey" FOREIGN KEY (location_code) REFERENCES "opensurveillancedb-alphav1".device_location(code) not valid;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

alter table "opensurveillancedb-alphav1"."device_possible_location" validate constraint "device_possible_location_location_code_fkey";

DO $$ BEGIN
  alter table "opensurveillancedb-alphav1"."device_possible_location" add constraint "device_possible_location_model_id_fkey" FOREIGN KEY (model_id) REFERENCES "opensurveillancedb-alphav1".device_model(id) not valid;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

alter table "opensurveillancedb-alphav1"."device_possible_location" validate constraint "device_possible_location_model_id_fkey";

grant select on table "opensurveillancedb-alphav1"."color" to "anon";

grant select, insert, update, delete on table "opensurveillancedb-alphav1"."color" to "authenticated";

grant select, insert, update, delete, references, trigger, truncate on table "opensurveillancedb-alphav1"."color" to "service_role";

grant select on table "opensurveillancedb-alphav1"."device_color_option" to "anon";

grant select, insert, update, delete on table "opensurveillancedb-alphav1"."device_color_option" to "authenticated";

grant select, insert, update, delete, references, trigger, truncate on table "opensurveillancedb-alphav1"."device_color_option" to "service_role";

grant select on table "opensurveillancedb-alphav1"."device_location" to "anon";

grant select, insert, update, delete on table "opensurveillancedb-alphav1"."device_location" to "authenticated";

grant select, insert, update, delete, references, trigger, truncate on table "opensurveillancedb-alphav1"."device_location" to "service_role";

grant select on table "opensurveillancedb-alphav1"."device_manufacturer" to "anon";

grant select, insert, update, delete on table "opensurveillancedb-alphav1"."device_manufacturer" to "authenticated";

grant select, insert, update, delete, references, trigger, truncate on table "opensurveillancedb-alphav1"."device_manufacturer" to "service_role";

grant select on table "opensurveillancedb-alphav1"."device_model" to "anon";

grant select, insert, update, delete on table "opensurveillancedb-alphav1"."device_model" to "authenticated";

grant select, insert, update, delete, references, trigger, truncate on table "opensurveillancedb-alphav1"."device_model" to "service_role";

grant select on table "opensurveillancedb-alphav1"."device_possible_location" to "anon";

grant select, insert, update, delete on table "opensurveillancedb-alphav1"."device_possible_location" to "authenticated";

grant select, insert, update, delete, references, trigger, truncate on table "opensurveillancedb-alphav1"."device_possible_location" to "service_role";

grant select on table "opensurveillancedb-alphav1"."device_shape_profile" to "anon";

grant select, insert, update, delete on table "opensurveillancedb-alphav1"."device_shape_profile" to "authenticated";

grant select, insert, update, delete, references, trigger, truncate on table "opensurveillancedb-alphav1"."device_shape_profile" to "service_role";


DO $$ BEGIN
  create policy "Enable read access for all users"
  on "opensurveillancedb-alphav1"."color"
  as permissive
  for select
  to public
using (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable write access for authenticated users"
  on "opensurveillancedb-alphav1"."color"
  as permissive
  for all
  to authenticated
using (true)
with check (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable read access for all users"
  on "opensurveillancedb-alphav1"."device_color_option"
  as permissive
  for select
  to public
using (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable write access for authenticated users"
  on "opensurveillancedb-alphav1"."device_color_option"
  as permissive
  for all
  to authenticated
using (true)
with check (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable read access for all users"
  on "opensurveillancedb-alphav1"."device_location"
  as permissive
  for select
  to public
using (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable write access for authenticated users"
  on "opensurveillancedb-alphav1"."device_location"
  as permissive
  for all
  to authenticated
using (true)
with check (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable read access for all users"
  on "opensurveillancedb-alphav1"."device_manufacturer"
  as permissive
  for select
  to public
using (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable write access for authenticated users"
  on "opensurveillancedb-alphav1"."device_manufacturer"
  as permissive
  for all
  to authenticated
using (true)
with check (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable read access for all users"
  on "opensurveillancedb-alphav1"."device_model"
  as permissive
  for select
  to public
using (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable write access for authenticated users"
  on "opensurveillancedb-alphav1"."device_model"
  as permissive
  for all
  to authenticated
using (true)
with check (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable read access for all users"
  on "opensurveillancedb-alphav1"."device_possible_location"
  as permissive
  for select
  to public
using (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable write access for authenticated users"
  on "opensurveillancedb-alphav1"."device_possible_location"
  as permissive
  for all
  to authenticated
using (true)
with check (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable read access for all users"
  on "opensurveillancedb-alphav1"."device_shape_profile"
  as permissive
  for select
  to public
using (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Enable write access for authenticated users"
  on "opensurveillancedb-alphav1"."device_shape_profile"
  as permissive
  for all
  to authenticated
using (true)
with check (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "List All 15awc08_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'shape_profiles'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Allow authenticated uploads to shape_profiles"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'shape_profiles'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Allow authenticated updates in shape_profiles"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'shape_profiles'::text))
with check ((bucket_id = 'shape_profiles'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
  create policy "Allow authenticated deletes from shape_profiles"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'shape_profiles'::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



