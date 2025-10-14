import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# MBTI Types with descriptions and tips
MBTI_TYPES = [
    {
        "id": "mbti-1", "code": "ENFP",
        "title": "The Campaigner",
        "description": "Enthusiastic, creative, and sociable free spirits. You see life as full of possibilities.",
        "tips": "Mix subjects frequently. Use colorful notes. Study with friends. Keep sessions fun and varied!"
    },
    {
        "id": "mbti-2", "code": "INFP",
        "title": "The Mediator",
        "description": "Poetic, kind, and altruistic. You seek deeper meaning in everything.",
        "tips": "Deep focus on one subject. Connect material to personal values. Quiet study spaces work best."
    },
    {
        "id": "mbti-3", "code": "ENTP",
        "title": "The Debater",
        "description": "Smart, curious thinkers who love intellectual challenges.",
        "tips": "Debate concepts. Challenge assumptions. Solve the hardest problems first. Make it competitive!"
    },
    {
        "id": "mbti-4", "code": "INTP",
        "title": "The Logician",
        "description": "Innovative inventors with an unquenchable thirst for knowledge.",
        "tips": "Build knowledge systems. Focus on why, not just what. Dive deep into theory."
    },
    {
        "id": "mbti-5", "code": "ENFJ",
        "title": "The Protagonist",
        "description": "Charismatic and inspiring leaders who captivate others.",
        "tips": "Study groups energize you. Teach others. Lead study sessions. Social learning is your strength!"
    },
    {
        "id": "mbti-6", "code": "INFJ",
        "title": "The Advocate",
        "description": "Quiet and mystical, yet very inspiring and tireless idealists.",
        "tips": "See the big picture. Connect concepts across subjects. Trust your intuitive insights."
    },
    {
        "id": "mbti-7", "code": "ENTJ",
        "title": "The Commander",
        "description": "Bold, imaginative, and strong-willed leaders.",
        "tips": "Set ambitious goals. Time-box study blocks. Organize and conquer systematically!"
    },
    {
        "id": "mbti-8", "code": "INTJ",
        "title": "The Architect",
        "description": "Imaginative and strategic thinkers with a plan for everything.",
        "tips": "Create master plans. Strategic studying. Focus on patterns and systems."
    },
    {
        "id": "mbti-9", "code": "ESFP",
        "title": "The Entertainer",
        "description": "Spontaneous, energetic, and enthusiastic people.",
        "tips": "Make it fun! Use games, videos, flashcards. Short, energetic sessions work best!"
    },
    {
        "id": "mbti-10", "code": "ISFP",
        "title": "The Adventurer",
        "description": "Flexible and charming artists, always ready to explore.",
        "tips": "Visual learning! Draw diagrams. Use colors. Make notes beautiful and artistic."
    },
    {
        "id": "mbti-11", "code": "ESTP",
        "title": "The Entrepreneur",
        "description": "Smart, energetic, and perceptive people who truly enjoy living on the edge.",
        "tips": "Quick practice tests. Race against time. Turn studying into challenges!"
    },
    {
        "id": "mbti-12", "code": "ISTP",
        "title": "The Virtuoso",
        "description": "Bold and practical experimenters, masters of tools.",
        "tips": "Hands-on practice. Apply concepts. Experiment and build. Learn by doing!"
    },
    {
        "id": "mbti-13", "code": "ESFJ",
        "title": "The Consul",
        "description": "Caring, social, and popular people, always eager to help.",
        "tips": "Organize everything. Study schedules. Group study. Social sciences are your forte!"
    },
    {
        "id": "mbti-14", "code": "ISFJ",
        "title": "The Defender",
        "description": "Dedicated and warm protectors, always ready to defend loved ones.",
        "tips": "Detailed notes. Step-by-step review. Your recall is amazing. History is your playground!"
    },
    {
        "id": "mbti-15", "code": "ESTJ",
        "title": "The Executive",
        "description": "Excellent administrators, unsurpassed at managing things.",
        "tips": "Structured blocks. Check off topics. Efficiency is your superpower!"
    },
    {
        "id": "mbti-16", "code": "ISTJ",
        "title": "The Logistician",
        "description": "Practical and fact-minded individuals, whose reliability cannot be doubted.",
        "tips": "Follow proven methods. Deep focus. Thorough review. Discipline wins!"
    }
]

# Exam Subjects
SUBJECTS = [
    {"id": "subj-1", "name": "Mathematics", "maxScore": 800},
    {"id": "subj-2", "name": "English", "maxScore": 800},
    {"id": "subj-3", "name": "Mongolian", "maxScore": 800},
    {"id": "subj-4", "name": "Science", "maxScore": 800},
    {"id": "subj-5", "name": "Social Studies", "maxScore": 800}
]

# Sample Quizzes
QUIZZES = [
    # Math Quizzes
    {"id": "q1", "subjectId": "subj-1", "question": "What is the value of x in the equation 2x + 5 = 15?", "options": ["3", "5", "7", "10"], "correctAnswer": 1, "difficulty": "easy", "xp": 50},
    {"id": "q2", "subjectId": "subj-1", "question": "If f(x) = 3x² - 2x + 1, what is f(2)?", "options": ["9", "11", "13", "15"], "correctAnswer": 0, "difficulty": "medium", "xp": 100},
    {"id": "q3", "subjectId": "subj-1", "question": "What is the derivative of x³?", "options": ["x²", "2x²", "3x²", "3x"], "correctAnswer": 2, "difficulty": "medium", "xp": 100},
    {"id": "q4", "subjectId": "subj-1", "question": "Solve for y: 3y - 7 = 20", "options": ["7", "9", "11", "13"], "correctAnswer": 1, "difficulty": "easy", "xp": 50},
    {"id": "q5", "subjectId": "subj-1", "question": "What is the area of a circle with radius 7? (π ≈ 3.14)", "options": ["44", "154", "308", "616"], "correctAnswer": 1, "difficulty": "medium", "xp": 100},
    
    # English Quizzes
    {"id": "q6", "subjectId": "subj-2", "question": "Choose the correct word: She _____ to the store yesterday.", "options": ["go", "goes", "went", "going"], "correctAnswer": 2, "difficulty": "easy", "xp": 50},
    {"id": "q7", "subjectId": "subj-2", "question": "What is a synonym for 'beautiful'?", "options": ["ugly", "pretty", "angry", "loud"], "correctAnswer": 1, "difficulty": "easy", "xp": 50},
    {"id": "q8", "subjectId": "subj-2", "question": "Identify the verb in: 'The cat jumped over the fence.'", "options": ["cat", "jumped", "over", "fence"], "correctAnswer": 1, "difficulty": "easy", "xp": 50},
    {"id": "q9", "subjectId": "subj-2", "question": "Which sentence is grammatically correct?", "options": ["He don't like pizza", "He doesn't likes pizza", "He doesn't like pizza", "He not like pizza"], "correctAnswer": 2, "difficulty": "medium", "xp": 100},
    {"id": "q10", "subjectId": "subj-2", "question": "What is the past participle of 'break'?", "options": ["breaked", "broken", "broke", "breaking"], "correctAnswer": 1, "difficulty": "medium", "xp": 100},
    
    # Science Quizzes
    {"id": "q11", "subjectId": "subj-4", "question": "What is the chemical symbol for water?", "options": ["O2", "H2O", "CO2", "N2"], "correctAnswer": 1, "difficulty": "easy", "xp": 50},
    {"id": "q12", "subjectId": "subj-4", "question": "Which planet is closest to the sun?", "options": ["Venus", "Earth", "Mercury", "Mars"], "correctAnswer": 2, "difficulty": "easy", "xp": 50},
    {"id": "q13", "subjectId": "subj-4", "question": "What is the powerhouse of the cell?", "options": ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"], "correctAnswer": 1, "difficulty": "medium", "xp": 100},
    {"id": "q14", "subjectId": "subj-4", "question": "What force keeps us on the ground?", "options": ["Magnetism", "Friction", "Gravity", "Inertia"], "correctAnswer": 2, "difficulty": "easy", "xp": 50},
    {"id": "q15", "subjectId": "subj-4", "question": "How many bones are in the human body?", "options": ["186", "206", "226", "246"], "correctAnswer": 1, "difficulty": "medium", "xp": 100},
    
    # Mongolian Quizzes
    {"id": "q16", "subjectId": "subj-3", "question": "Монгол хэлний үгийн ангилалд хамаарах хэсэг нь юу вэ?", "options": ["Үг", "Өгүүлбэр", "Үе үсэг", "Нэр үг"], "correctAnswer": 3, "difficulty": "easy", "xp": 50},
    {"id": "q17", "subjectId": "subj-3", "question": "Чингис хаан хэдэн онд төрсөн бэ?", "options": ["1162", "1206", "1227", "1189"], "correctAnswer": 0, "difficulty": "medium", "xp": 100},
    {"id": "q18", "subjectId": "subj-3", "question": "Монгол улсын нийслэл хот аль нь вэ?", "options": ["Эрдэнэт", "Дархан", "Улаанбаатар", "Чойбалсан"], "correctAnswer": 2, "difficulty": "easy", "xp": 50},
    
    # Social Studies
    {"id": "q19", "subjectId": "subj-5", "question": "Who was the first president of the United States?", "options": ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"], "correctAnswer": 1, "difficulty": "easy", "xp": 50},
    {"id": "q20", "subjectId": "subj-5", "question": "In which year did World War II end?", "options": ["1943", "1944", "1945", "1946"], "correctAnswer": 2, "difficulty": "medium", "xp": 100},
    {"id": "q21", "subjectId": "subj-5", "question": "What is the capital of France?", "options": ["London", "Berlin", "Paris", "Rome"], "correctAnswer": 2, "difficulty": "easy", "xp": 50},
]

# Daily Quests
DAILY_QUESTS = [
    {"id": "dq-1", "description": "Complete 3 quizzes", "xpReward": 150, "questType": "quiz_count", "target": 3},
    {"id": "dq-2", "description": "Earn 200 XP today", "xpReward": 100, "questType": "xp_earned", "target": 200},
    {"id": "dq-3", "description": "Maintain your streak", "xpReward": 50, "questType": "streak", "target": 1}
]

# Badges
BADGES = [
    {"id": "badge-1", "name": "First Steps", "description": "Complete your first quiz", "icon": "🎯", "requirement": "Complete 1 quiz"},
    {"id": "badge-2", "name": "Quiz Master", "description": "Complete 10 quizzes", "icon": "🏆", "requirement": "Complete 10 quizzes"},
    {"id": "badge-3", "name": "XP Hunter", "description": "Earn 1000 XP", "icon": "⭐", "requirement": "Earn 1000 XP"},
    {"id": "badge-4", "name": "Level 5", "description": "Reach level 5", "icon": "🎖️", "requirement": "Reach level 5"},
    {"id": "badge-5", "name": "Streak Master", "description": "Maintain a 7-day streak", "icon": "🔥", "requirement": "7-day streak"},
    {"id": "badge-6", "name": "Math Genius", "description": "Complete 20 Math quizzes", "icon": "🧮", "requirement": "Complete 20 Math quizzes"},
    {"id": "badge-7", "name": "Language Pro", "description": "Complete 20 English quizzes", "icon": "📚", "requirement": "Complete 20 English quizzes"},
    {"id": "badge-8", "name": "Science Explorer", "description": "Complete 20 Science quizzes", "icon": "🔬", "requirement": "Complete 20 Science quizzes"},
    {"id": "badge-9", "name": "Century Club", "description": "Complete 100 quizzes", "icon": "💯", "requirement": "Complete 100 quizzes"},
    {"id": "badge-10", "name": "Legend", "description": "Reach level 10", "icon": "👑", "requirement": "Reach level 10"}
]

async def seed_database():
    print("🌱 Starting database seeding...")
    
    # Clear existing data
    await db.mbti_types.delete_many({})
    await db.exam_subjects.delete_many({})
    await db.quizzes.delete_many({})
    await db.daily_quests.delete_many({})
    await db.badges.delete_many({})
    
    # Insert MBTI types
    await db.mbti_types.insert_many(MBTI_TYPES)
    print(f"✅ Inserted {len(MBTI_TYPES)} MBTI types")
    
    # Insert subjects
    await db.exam_subjects.insert_many(SUBJECTS)
    print(f"✅ Inserted {len(SUBJECTS)} exam subjects")
    
    # Insert quizzes
    await db.quizzes.insert_many(QUIZZES)
    print(f"✅ Inserted {len(QUIZZES)} quizzes")
    
    # Insert daily quests
    await db.daily_quests.insert_many(DAILY_QUESTS)
    print(f"✅ Inserted {len(DAILY_QUESTS)} daily quests")
    
    # Insert badges
    await db.badges.insert_many(BADGES)
    print(f"✅ Inserted {len(BADGES)} badges")
    
    print("🎉 Database seeding completed!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
