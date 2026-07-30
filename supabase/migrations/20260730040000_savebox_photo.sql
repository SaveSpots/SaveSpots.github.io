-- New-box submissions now include a required photo of the spot.
alter table public.saveboxes
  add column if not exists photo_url text;
