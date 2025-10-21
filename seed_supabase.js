const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wwpiqtxvoobhhgywkkmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3cGlxdHh2b29iaGhneXdra215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzgxMDksImV4cCI6MjA3NjYxNDEwOX0.YzGzwnlxsQ38yYu-9NU7KGTaJMbDwSCj7uEScMnnYOg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('Seeding database...');

  const mbtiTypes = [
    { code: 'ENFP', title: 'The Champion', description: 'Enthusiastic, creative and sociable free spirits.', tips: 'Mix subjects for variety. Keep sessions fun and energetic!' },
    { code: 'INFP', title: 'The Healer', description: 'Poetic, kind and altruistic people.', tips: 'Deep focus on one subject at a time. Quality over quantity!' },
    { code: 'ENTP', title: 'The Visionary', description: 'Smart and curious thinkers.', tips: 'Challenge yourself with the hardest problems first!' },
    { code: 'INTP', title: 'The Architect', description: 'Innovative inventors with unquenchable thirst for knowledge.', tips: 'Break down complex problems systematically!' }
  ];

  const subjects = [
    { name: 'Mathematics', max_score: 800 },
    { name: 'Physics', max_score: 800 },
    { name: 'Chemistry', max_score: 800 },
    { name: 'English', max_score: 800 }
  ];

  const badges = [
    { name: 'First Steps', description: 'Complete your first quiz', icon: '🎯', requirement: 'Complete 1 quiz' },
    { name: 'Quiz Master', description: 'Complete 50 quizzes', icon: '🏆', requirement: 'Complete 50 quizzes' },
    { name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', requirement: '7 day streak' }
  ];

  const dailyQuests = [
    { description: 'Complete 5 quizzes today', xp_reward: 100, quest_type: 'quiz_count', target: 5 },
    { description: 'Score 80% or higher on 3 quizzes', xp_reward: 150, quest_type: 'accuracy', target: 3 },
    { description: 'Practice for 30 minutes', xp_reward: 75, quest_type: 'time', target: 30 }
  ];

  try {
    const { error: mbtiError } = await supabase.from('mbti_types').insert(mbtiTypes);
    if (mbtiError && !mbtiError.message.includes('duplicate')) console.error('MBTI Error:', mbtiError);
    else console.log('✓ MBTI types seeded');

    const { data: subjectsData, error: subjectsError } = await supabase.from('exam_subjects').insert(subjects).select();
    if (subjectsError && !subjectsError.message.includes('duplicate')) console.error('Subjects Error:', subjectsError);
    else console.log('✓ Exam subjects seeded');

    if (subjectsData && subjectsData.length > 0) {
      const quizzes = [
        {
          subject_id: subjectsData[0].id,
          question: 'What is 2 + 2?',
          options: JSON.stringify(['2', '3', '4', '5']),
          correct_answer: 2,
          difficulty: 'easy',
          xp: 10
        },
        {
          subject_id: subjectsData[0].id,
          question: 'What is the square root of 144?',
          options: JSON.stringify(['10', '11', '12', '13']),
          correct_answer: 2,
          difficulty: 'medium',
          xp: 20
        }
      ];

      const { error: quizzesError } = await supabase.from('quizzes').insert(quizzes);
      if (quizzesError && !quizzesError.message.includes('duplicate')) console.error('Quizzes Error:', quizzesError);
      else console.log('✓ Quizzes seeded');
    }

    const { error: badgesError } = await supabase.from('badges').insert(badges);
    if (badgesError && !badgesError.message.includes('duplicate')) console.error('Badges Error:', badgesError);
    else console.log('✓ Badges seeded');

    const { error: questsError } = await supabase.from('daily_quests').insert(dailyQuests);
    if (questsError && !questsError.message.includes('duplicate')) console.error('Daily Quests Error:', questsError);
    else console.log('✓ Daily quests seeded');

    console.log('\n✅ Database seeding complete!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

seedDatabase();
