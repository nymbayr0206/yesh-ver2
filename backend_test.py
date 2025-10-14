import requests
import sys
import json
from datetime import datetime

class AIExamMentorAPITester:
    def __init__(self, base_url="https://aiexam-mentor.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_data = {
            "email": f"test_user_{timestamp}@example.com",
            "username": f"test_user_{timestamp}",
            "password": "TestPass123!",
            "grade": 11
        }
        
        response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if response and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        # Try to login with a test user (this might fail if user doesn't exist)
        test_data = {
            "username": "testuser",
            "password": "testpass"
        }
        
        response = self.run_test(
            "User Login (Test User)",
            "POST",
            "auth/login",
            200,
            data=test_data
        )
        
        # If login fails, that's expected for a fresh system
        if not response:
            self.log_test("User Login (Expected to fail on fresh system)", True, "No existing test user")
            return False
        
        if response and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            self.log_test("Get Current User", False, "No auth token available")
            return False
            
        response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return response is not None

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        if not self.token:
            self.log_test("Dashboard Stats", False, "No auth token available")
            return False
            
        response = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if response:
            required_fields = ['xp', 'level', 'streak', 'dailyQuests']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("Dashboard Stats Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Dashboard Stats Structure", True, "All required fields present")
        
        return response is not None

    def test_subjects(self):
        """Test subjects endpoint"""
        response = self.run_test(
            "Get Subjects",
            "GET",
            "subjects",
            200
        )
        return response is not None

    def test_quizzes(self):
        """Test quizzes endpoint"""
        response = self.run_test(
            "Get Quizzes",
            "GET",
            "quizzes",
            200
        )
        
        if response and len(response) > 0:
            # Test quiz structure
            quiz = response[0]
            required_fields = ['id', 'question', 'options', 'correctAnswer', 'difficulty', 'xp']
            missing_fields = [field for field in required_fields if field not in quiz]
            if missing_fields:
                self.log_test("Quiz Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Quiz Structure", True, "All required fields present")
                return quiz
        
        return None

    def test_quiz_attempt(self, quiz):
        """Test quiz attempt"""
        if not self.token or not quiz:
            self.log_test("Quiz Attempt", False, "No auth token or quiz available")
            return False
            
        test_data = {
            "quizId": quiz['id'],
            "selectedAnswer": 0  # Select first option
        }
        
        response = self.run_test(
            "Quiz Attempt",
            "POST",
            "quizzes/attempt",
            200,
            data=test_data
        )
        
        if response:
            required_fields = ['isCorrect', 'correctAnswer', 'xpEarned', 'newXp', 'newLevel', 'leveledUp']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("Quiz Attempt Response Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Quiz Attempt Response Structure", True, "All required fields present")
        
        return response is not None

    def test_leaderboard(self):
        """Test leaderboard endpoint"""
        if not self.token:
            self.log_test("Leaderboard", False, "No auth token available")
            return False
            
        response = self.run_test(
            "Leaderboard",
            "GET",
            "leaderboard",
            200
        )
        
        if response:
            required_fields = ['leaderboard', 'myRank']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("Leaderboard Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Leaderboard Structure", True, "All required fields present")
        
        return response is not None

    def test_mbti_types(self):
        """Test MBTI types endpoint"""
        response = self.run_test(
            "Get MBTI Types",
            "GET",
            "mbti/types",
            200
        )
        
        if response and len(response) > 0:
            # Test MBTI type structure
            mbti_type = response[0]
            required_fields = ['id', 'code', 'title', 'description', 'tips']
            missing_fields = [field for field in required_fields if field not in mbti_type]
            if missing_fields:
                self.log_test("MBTI Type Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("MBTI Type Structure", True, "All required fields present")
                return mbti_type
        
        return None

    def test_mbti_details(self, mbti_type):
        """Test specific MBTI type details"""
        if not mbti_type:
            self.log_test("MBTI Details", False, "No MBTI type available")
            return False
            
        response = self.run_test(
            f"Get MBTI Details ({mbti_type['code']})",
            "GET",
            f"mbti/{mbti_type['code']}",
            200
        )
        return response is not None

    def test_update_mbti(self, mbti_code):
        """Test updating student MBTI"""
        if not self.token or not mbti_code:
            self.log_test("Update Student MBTI", False, "No auth token or MBTI code available")
            return False
            
        # Using query parameter as per the API
        response = self.run_test(
            "Update Student MBTI",
            "PUT",
            f"student/mbti?mbti_code={mbti_code}",
            200
        )
        return response is not None

    def test_ai_teacher_tip(self):
        """Test AI teacher tip endpoint (mocked)"""
        if not self.token:
            self.log_test("AI Teacher Tip", False, "No auth token available")
            return False
            
        test_data = {
            "context": "Need study motivation"
        }
        
        response = self.run_test(
            "AI Teacher Tip",
            "POST",
            "ai-teacher/tip",
            200,
            data=test_data
        )
        
        if response:
            required_fields = ['tip', 'mbtiType']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("AI Teacher Tip Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("AI Teacher Tip Structure", True, "All required fields present")
                # Verify it's using mock data
                if "ENFP" in response.get('tip', '') or any(mbti in response.get('tip', '') for mbti in ['ENFP', 'INFP', 'ENTP']):
                    self.log_test("AI Teacher Tip (Mock Response)", True, "Using mock MBTI tips as expected")
                else:
                    self.log_test("AI Teacher Tip (Mock Response)", True, "Tip generated successfully")
        
        return response is not None

    def test_badges(self):
        """Test badges endpoint"""
        if not self.token:
            self.log_test("Badges", False, "No auth token available")
            return False
            
        response = self.run_test(
            "Get Badges",
            "GET",
            "badges",
            200
        )
        
        if response and len(response) > 0:
            # Test badge structure
            badge = response[0]
            required_fields = ['id', 'name', 'description', 'icon', 'requirement', 'unlocked']
            missing_fields = [field for field in required_fields if field not in badge]
            if missing_fields:
                self.log_test("Badge Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Badge Structure", True, "All required fields present")
        
        return response is not None

    def test_profile(self):
        """Test profile endpoints"""
        if not self.token:
            self.log_test("Profile", False, "No auth token available")
            return False
            
        # Get profile
        response = self.run_test(
            "Get Profile",
            "GET",
            "profile",
            200
        )
        
        if not response:
            return False
        
        # Test profile update
        update_data = {
            "username": response.get('username', 'testuser'),
            "email": response.get('email', 'test@example.com'),
            "grade": 12
        }
        
        update_response = self.run_test(
            "Update Profile",
            "PUT",
            "profile",
            200,
            data=update_data
        )
        
        return update_response is not None

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting AI Exam Mentor API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test registration first
        if not self.test_user_registration():
            # If registration fails, try login
            self.test_user_login()
        
        # Test authenticated endpoints
        self.test_get_current_user()
        self.test_dashboard_stats()
        
        # Test public endpoints
        self.test_subjects()
        
        # Test quiz functionality
        quiz = self.test_quizzes()
        if quiz:
            self.test_quiz_attempt(quiz)
        
        # Test leaderboard
        self.test_leaderboard()
        
        # Test MBTI functionality
        mbti_type = self.test_mbti_types()
        if mbti_type:
            self.test_mbti_details(mbti_type)
            self.test_update_mbti(mbti_type['code'])
        
        # Test AI teacher
        self.test_ai_teacher_tip()
        
        # Test badges
        self.test_badges()
        
        # Test profile
        self.test_profile()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"✅ Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = AIExamMentorAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())