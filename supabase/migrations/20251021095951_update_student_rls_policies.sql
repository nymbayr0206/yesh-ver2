/*
  # Update Student RLS Policies

  1. Changes
    - Add policy to allow public registration (insert)
    - Allow students to read their own data without authentication during profile load
  
  2. Security
    - Public users can only insert their own profile (using auth.uid())
    - Maintains existing read/update restrictions
*/

CREATE POLICY "Allow public registration"
  ON students FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own profile" ON students;

CREATE POLICY "Users can read own profile"
  ON students FOR SELECT
  TO public
  USING (auth.uid() = id);