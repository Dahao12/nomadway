-- Run this in Supabase SQL Editor to enable document uploads

-- Enable storage policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to upload (for MVP - tighten in production)
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

-- Policy: Allow anyone to read documents
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

-- Policy: Allow anyone to update their uploads
CREATE POLICY "Allow public updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents');

-- Policy: Allow anyone to delete
CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents');