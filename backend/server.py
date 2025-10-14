from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from collections import defaultdict

# TODO: Uncomment when OpenAI key is provided
# from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class Student(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    passwordHash: str
    grade: int  # 11 or 12
    mbtiType: Optional[str] = None
    xp: int = 0
    level: int = 1
    streak: int = 0
    lastActive: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudentCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    grade: int

class StudentLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user: dict

class MBTIType(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str  # ENFP, ISTJ, etc.
    title: str
    description: str
    tips: str

class ExamSubject(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    maxScore: int = 800

class Quiz(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subjectId: str
    question: str
    options: List[str]
    correctAnswer: int  # index of correct option
    difficulty: str  # easy, medium, hard
    xp: int  # XP reward

class QuizAttempt(BaseModel):
    quizId: str
    selectedAnswer: int

class QuizResult(BaseModel):
    isCorrect: bool
    correctAnswer: int
    xpEarned: int
    newXp: int
    newLevel: int
    leveledUp: bool

class Badge(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str
    requirement: str

class DailyQuest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str
    xpReward: int
    questType: str  # quiz_count, streak, etc.
    target: int

class StudentDailyQuest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    studentId: str
    questId: str
    progress: int = 0
    completed: bool = False
    date: str  # YYYY-MM-DD

class AITipRequest(BaseModel):
    context: Optional[str] = None

# ============ HELPER FUNCTIONS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(student_id: str) -> str:
    payload = {
        "sub": student_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        student_id = payload.get("sub")
        if not student_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        student = await db.students.find_one({"id": student_id}, {"_id": 0})
        if not student:
            raise HTTPException(status_code=401, detail="User not found")
        
        return student
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def calculate_level_from_xp(xp: int) -> int:
    # Every 1000 XP = 1 level
    return max(1, xp // 1000 + 1)

# ============ MOCK AI RESPONSE (Replace when OpenAI key is provided) ============

MOCK_MBTI_TIPS = {
    "ENFP": "Hey ENFP! Your creative energy is amazing! Try mixing subjects today - start with English for 20 mins, then Math. Keep it fun!",
    "INFP": "INFP, your deep thinking is powerful. Focus on one subject at a time. Today, dive into literature or history. Quality over quantity!",
    "ENTP": "ENTP, challenge yourself! Tackle the hardest Math problems first. Your debate skills? Use them to argue both sides of an essay topic.",
    "INTP": "INTP logic master! Break down complex problems today. Perfect day for Science or advanced Math. Build your knowledge tree!",
    "ENFJ": "ENFJ, you inspire others! Study with a friend today. Teach what you learn - it'll stick better. Social studies is calling!",
    "INFJ": "INFJ, trust your intuition! Today's focus: connect concepts across subjects. See the big picture in your exam prep.",
    "ENTJ": "ENTJ, let's conquer! Set 3 challenging goals today. Time-box each subject. You've got this, commander!",
    "INTJ": "INTJ strategist! Today, map out your study architecture. What patterns do you see? Math and Science are your playgrounds.",
    "ESFP": "ESFP, make it fun! Use flashcards, videos, or study games. Keep sessions short and energetic. You learn by doing!",
    "ISFP": "ISFP artist! Visual learning is your strength. Draw diagrams, use colors. Make your notes beautiful and memorable.",
    "ESTP": "ESTP action hero! Quick practice tests today. Race the clock. Turn studying into a challenge. You thrive under pressure!",
    "ISTP": "ISTP problem-solver! Hands-on practice today. Build, experiment, apply. Science practicals are perfect for you!",
    "ESFJ": "ESFJ, organize your study space first! Create a schedule. Study groups energize you. Social sciences await!",
    "ISFJ": "ISFJ, your dedication shines! Detailed notes, step-by-step review. Perfect recall is your superpower. History loves you!",
    "ESTJ": "ESTJ efficiency expert! Structured study blocks. Check off each topic. Your systematic approach = success!",
    "ISTJ": "ISTJ reliability master! Follow your proven method. Deep focus, thorough review. Math and logic bow to your discipline!"
}

async def get_ai_tip(mbti_code: str, context: Optional[str] = None) -> str:
    # TODO: Replace with actual OpenAI integration when key is provided
    # openai_key = os.environ.get('OPENAI_API_KEY')
    # if openai_key:
    #     chat = LlmChat(
    #         api_key=openai_key,
    #         session_id=f"ai-teacher-{uuid.uuid4()}",
    #         system_message="You are an encouraging AI teacher for Mongolian high school students. Provide personalized, energetic study tips based on MBTI type. Keep it short, fun, and actionable."
    #     ).with_model("openai", "gpt-5")
    #     
    #     prompt = f"Give a quick study tip for an {mbti_code} student preparing for entrance exams."
    #     if context:
    #         prompt += f" Context: {context}"
    #     
    #     response = await chat.send_message(UserMessage(text=prompt))
    #     return response
    
    # Mock response until OpenAI key is added
    return MOCK_MBTI_TIPS.get(mbti_code, "Keep pushing forward! Your dedication will pay off. Try 3 quick quizzes today!")

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: StudentCreate):
    # Check if username or email exists
    existing = await db.students.find_one(
        {"$or": [{"email": data.email}, {"username": data.username}]},
        {"_id": 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Validate grade
    if data.grade not in [11, 12]:
        raise HTTPException(status_code=400, detail="Grade must be 11 or 12")
    
    # Create student
    student = Student(
        email=data.email,
        username=data.username,
        passwordHash=hash_password(data.password),
        grade=data.grade
    )
    
    student_dict = student.model_dump()
    student_dict['createdAt'] = student_dict['createdAt'].isoformat()
    student_dict['lastActive'] = student_dict['lastActive'].isoformat()
    
    await db.students.insert_one(student_dict)
    
    # Create token
    token = create_token(student.id)
    
    # Return user without password
    user_data = {k: v for k, v in student_dict.items() if k != 'passwordHash'}
    
    return TokenResponse(token=token, user=user_data)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: StudentLogin):
    # Find student by username
    student = await db.students.find_one({"username": data.username}, {"_id": 0})
    if not student or not verify_password(data.password, student['passwordHash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last active
    await db.students.update_one(
        {"id": student['id']},
        {"$set": {"lastActive": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create token
    token = create_token(student['id'])
    
    # Return user without password
    user_data = {k: v for k, v in student.items() if k != 'passwordHash'}
    
    return TokenResponse(token=token, user=user_data)

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != 'passwordHash'}

# ============ DASHBOARD ENDPOINTS ============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    student_id = current_user['id']
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Get daily quests
    daily_quests = await db.daily_quests.find({}, {"_id": 0}).to_list(100)
    
    # Get student quest progress
    student_quests = await db.student_daily_quests.find(
        {"studentId": student_id, "date": today},
        {"_id": 0}
    ).to_list(100)
    
    # Create quest map
    quest_map = {sq['questId']: sq for sq in student_quests}
    
    # Merge quests with progress
    quests_with_progress = []
    for quest in daily_quests:
        student_quest = quest_map.get(quest['id'], {
            "progress": 0,
            "completed": False
        })
        quests_with_progress.append({
            **quest,
            "progress": student_quest['progress'],
            "completed": student_quest['completed']
        })
    
    return {
        "xp": current_user.get('xp', 0),
        "level": current_user.get('level', 1),
        "streak": current_user.get('streak', 0),
        "dailyQuests": quests_with_progress[:3]  # Show only 3 quests
    }

# ============ QUIZ ENDPOINTS ============

@api_router.get("/quizzes")
async def get_quizzes(subject: Optional[str] = None, limit: int = 10):
    query = {}
    if subject:
        # Find subject ID
        subject_doc = await db.exam_subjects.find_one({"name": subject}, {"_id": 0})
        if subject_doc:
            query['subjectId'] = subject_doc['id']
    
    quizzes = await db.quizzes.find(query, {"_id": 0}).to_list(limit)
    return quizzes

@api_router.post("/quizzes/attempt", response_model=QuizResult)
async def attempt_quiz(attempt: QuizAttempt, current_user: dict = Depends(get_current_user)):
    # Get quiz
    quiz = await db.quizzes.find_one({"id": attempt.quizId}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    is_correct = attempt.selectedAnswer == quiz['correctAnswer']
    xp_earned = quiz['xp'] if is_correct else 0
    
    # Update student XP
    new_xp = current_user['xp'] + xp_earned
    new_level = calculate_level_from_xp(new_xp)
    leveled_up = new_level > current_user.get('level', 1)
    
    await db.students.update_one(
        {"id": current_user['id']},
        {"$set": {"xp": new_xp, "level": new_level}}
    )
    
    # Save attempt
    attempt_doc = {
        "id": str(uuid.uuid4()),
        "studentId": current_user['id'],
        "quizId": attempt.quizId,
        "selectedAnswer": attempt.selectedAnswer,
        "isCorrect": is_correct,
        "xpEarned": xp_earned,
        "attemptedAt": datetime.now(timezone.utc).isoformat()
    }
    await db.student_quiz_attempts.insert_one(attempt_doc)
    
    # Update daily quest progress
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    quiz_quest = await db.daily_quests.find_one({"questType": "quiz_count"}, {"_id": 0})
    if quiz_quest:
        student_quest = await db.student_daily_quests.find_one(
            {"studentId": current_user['id'], "questId": quiz_quest['id'], "date": today},
            {"_id": 0}
        )
        
        if student_quest:
            new_progress = student_quest['progress'] + 1
            completed = new_progress >= quiz_quest['target']
            await db.student_daily_quests.update_one(
                {"id": student_quest['id']},
                {"$set": {"progress": new_progress, "completed": completed}}
            )
        else:
            # Create new quest progress
            await db.student_daily_quests.insert_one({
                "id": str(uuid.uuid4()),
                "studentId": current_user['id'],
                "questId": quiz_quest['id'],
                "progress": 1,
                "completed": 1 >= quiz_quest['target'],
                "date": today
            })
    
    return QuizResult(
        isCorrect=is_correct,
        correctAnswer=quiz['correctAnswer'],
        xpEarned=xp_earned,
        newXp=new_xp,
        newLevel=new_level,
        leveledUp=leveled_up
    )

# ============ LEADERBOARD ENDPOINTS ============

@api_router.get("/leaderboard")
async def get_leaderboard(current_user: dict = Depends(get_current_user)):
    # Get top 50 students
    students = await db.students.find(
        {},
        {"_id": 0, "id": 1, "username": 1, "xp": 1, "level": 1}
    ).sort("xp", -1).limit(50).to_list(50)
    
    # Add rank
    for idx, student in enumerate(students):
        student['rank'] = idx + 1
    
    # Find current user rank
    all_students = await db.students.find(
        {},
        {"_id": 0, "id": 1, "xp": 1}
    ).sort("xp", -1).to_list(10000)
    
    my_rank = next((idx + 1 for idx, s in enumerate(all_students) if s['id'] == current_user['id']), None)
    
    return {
        "leaderboard": students,
        "myRank": my_rank
    }

# ============ MBTI ENDPOINTS ============

@api_router.get("/mbti/types")
async def get_mbti_types():
    types = await db.mbti_types.find({}, {"_id": 0}).to_list(100)
    return types

@api_router.get("/mbti/{code}")
async def get_mbti_type(code: str):
    mbti_type = await db.mbti_types.find_one({"code": code.upper()}, {"_id": 0})
    if not mbti_type:
        raise HTTPException(status_code=404, detail="MBTI type not found")
    return mbti_type

@api_router.put("/student/mbti")
async def update_student_mbti(mbti_code: str, current_user: dict = Depends(get_current_user)):
    # Verify MBTI code exists
    mbti_type = await db.mbti_types.find_one({"code": mbti_code.upper()}, {"_id": 0})
    if not mbti_type:
        raise HTTPException(status_code=404, detail="Invalid MBTI type")
    
    await db.students.update_one(
        {"id": current_user['id']},
        {"$set": {"mbtiType": mbti_code.upper()}}
    )
    
    return {"message": "MBTI type updated", "mbtiType": mbti_code.upper()}

# ============ AI TEACHER ENDPOINTS ============

@api_router.post("/ai-teacher/tip")
async def get_ai_teacher_tip(request: AITipRequest, current_user: dict = Depends(get_current_user)):
    mbti_code = current_user.get('mbtiType', 'ENFP')  # Default to ENFP
    tip = await get_ai_tip(mbti_code, request.context)
    
    return {
        "tip": tip,
        "mbtiType": mbti_code
    }

# ============ BADGES ENDPOINTS ============

@api_router.get("/badges")
async def get_badges(current_user: dict = Depends(get_current_user)):
    # Get all badges
    badges = await db.badges.find({}, {"_id": 0}).to_list(100)
    
    # Get unlocked badges
    unlocked = await db.student_badges.find(
        {"studentId": current_user['id']},
        {"_id": 0, "badgeId": 1}
    ).to_list(100)
    
    unlocked_ids = {b['badgeId'] for b in unlocked}
    
    # Mark badges as unlocked
    for badge in badges:
        badge['unlocked'] = badge['id'] in unlocked_ids
    
    return badges

# ============ PROFILE ENDPOINTS ============

@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != 'passwordHash'}

@api_router.put("/profile")
async def update_profile(username: Optional[str] = None, email: Optional[EmailStr] = None, grade: Optional[int] = None, current_user: dict = Depends(get_current_user)):
    update_data = {}
    
    if username:
        # Check username availability
        existing = await db.students.find_one({"username": username, "id": {"$ne": current_user['id']}}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        update_data['username'] = username
    
    if email:
        # Check email availability
        existing = await db.students.find_one({"email": email, "id": {"$ne": current_user['id']}}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")
        update_data['email'] = email
    
    if grade in [11, 12]:
        update_data['grade'] = grade
    
    if update_data:
        await db.students.update_one(
            {"id": current_user['id']},
            {"$set": update_data}
        )
    
    return {"message": "Profile updated", **update_data}

# ============ SUBJECTS ENDPOINT ============

@api_router.get("/subjects")
async def get_subjects():
    subjects = await db.exam_subjects.find({}, {"_id": 0}).to_list(100)
    return subjects

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
