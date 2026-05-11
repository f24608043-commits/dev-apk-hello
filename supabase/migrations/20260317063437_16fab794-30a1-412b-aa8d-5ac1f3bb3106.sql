
-- Add parent_id and banner_image_url to categories
ALTER TABLE public.categories ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL DEFAULT NULL;
ALTER TABLE public.categories ADD COLUMN banner_image_url text;

-- Remove images column from products and add image_1, image_2, image_3
ALTER TABLE public.products DROP COLUMN IF EXISTS images;
ALTER TABLE public.products ADD COLUMN image_1 text;
ALTER TABLE public.products ADD COLUMN image_2 text;
ALTER TABLE public.products ADD COLUMN image_3 text;
