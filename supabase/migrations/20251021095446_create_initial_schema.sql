/*
  # Create Exam Prep Platform Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `username` (text, unique, not null)
      - `password_hash` (text, not null)
      - `grade` (int, 11 or 12)
      - `mbti_type` (text, nullable)
      - `xp` (int, default 0)
      - `level` (int, default 1)
      - `streak` (int, default 0)
      - `last_active` (timestamptz)
      - `created_at` (timestamptz)

    - `mbti_types`
      - `id` (uuid, primary key)
      - `code` (text, unique, not null)
      - `title` (text, not null)
      - `description` (text, not null)
      - `tips` (text, not null)

    - `exam_subjects`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `max_score` (int, default 800)

    - `quizzes`
      - `id` (uuid, primary key)
      - `subject_id` (uuid, foreign key)
      - `question` (text, not null)
      - `options` (jsonb, array of strings)
      - `correct_answer` (int, not null)
      - `difficulty` (text, not null)
      - `xp` (int, not null)

    - `student_quiz_attempts`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `quiz_id` (uuid, foreign key)
      - `selected_answer` (int, not null)
      - `is_correct` (boolean, not null)
      - `xp_earned` (int, not null)
      - `attempted_at` (timestamptz)

    - `badges`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `description` (text, not null)
      - `icon` (text, not null)
      - `requirement` (text, not null)

    - `student_badges`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `badge_id` (uuid, foreign key)
      - `earned_at` (timestamptz)

    - `daily_quests`
      - `id` (uuid, primary key)
      - `description` (text, not null)
      - `xp_reward` (int, not null)
      - `quest_type` (text, not null)
      - `target` (int, not null)

    - `student_daily_quests`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `quest_id` (uuid, foreign key)
      - `progress` (int, default 0)
      - `completed` (boolean, default false)
      - `date` (text, not null)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Add policies for public read access to reference data
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  grade int NOT NULL CHECK (grade IN (11, 12)),
  mbti_type text,
  xp int DEFAULT 0,
  level int DEFAULT 1,
  streak int DEFAULT 0,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mbti_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  tips text NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  max_score int DEFAULT 800
);

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES exam_subjects(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer int NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  xp int NOT NULL
);

CREATE TABLE IF NOT EXISTS student_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  selected_answer int NOT NULL,
  is_correct boolean NOT NULL,
  xp_earned int NOT NULL,
  attempted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  requirement text NOT NULL
);

CREATE TABLE IF NOT EXISTS student_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(student_id, badge_id)
);

CREATE TABLE IF NOT EXISTS daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  xp_reward int NOT NULL,
  quest_type text NOT NULL,
  target int NOT NULL
);

CREATE TABLE IF NOT EXISTS student_daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  quest_id uuid REFERENCES daily_quests(id) ON DELETE CASCADE,
  progress int DEFAULT 0,
  completed boolean DEFAULT false,
  date text NOT NULL,
  UNIQUE(student_id, quest_id, date)
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE mbti_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_daily_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can read MBTI types"
  ON mbti_types FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read exam subjects"
  ON exam_subjects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read quizzes"
  ON quizzes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can read own quiz attempts"
  ON student_quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON student_quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Anyone can read badges"
  ON badges FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can read own badges"
  ON student_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own badges"
  ON student_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Anyone can read daily quests"
  ON daily_quests FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can read own quest progress"
  ON student_daily_quests FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own quest progress"
  ON student_daily_quests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own quest progress"
  ON student_daily_quests FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_username ON students(username);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject_id ON quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_quiz_attempts_student_id ON student_quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_daily_quests_student_date ON student_daily_quests(student_id, date);