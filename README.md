# Timetable Management System (TMS)

A comprehensive web-based timetable management system for educational institutions that streamlines course scheduling, resource allocation, and conflict resolution.

## 📋 Overview

The Timetable Management System is a full-stack application designed to help educational institutions efficiently manage and organize timetables for students, lecturers, and administrators. The system provides role-based access, intelligent scheduling features, and comprehensive management tools.

## ✨ Key Features

### For Students
- View personalized timetables
- Check course schedules and venue information
- Manage account settings and preferences
- Export schedule data
- Receive notifications about schedule changes

### For Lecturers
- Create and manage course schedules
- View assigned courses and timetables
- Manage profile information
- Access student rosters
- Manage teaching preferences and availability

### For Administrators
- Complete system management and configuration
- User management (create, edit, delete users)
- Course and room management
- Timetable generation and optimization
- Conflict resolution and scheduling adjustments
- System analytics and reporting
- Data export functionality

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **UI Library:** shadcn/ui components
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm
- **Key Libraries:**
  - React Router for navigation
  - Lucide React for icons
  - Custom hooks for API communication and authentication

### Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB with Motor (async driver)
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Pydantic
- **Server:** Uvicorn
- **Password Hashing:** passlib with pbkdf2_sha256

### Infrastructure
- **Frontend Port:** 8080 (default)
- **Backend Port:** 8000 (default)
- **Database:** MongoDB (local or cloud)

## 📁 Project Structure

```
Timetable Management System/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ...
│   │   ├── pages/                 # Page components
│   │   │   ├── Account.tsx         # Account settings page
│   │   │   ├── Login.tsx
│   │   │   ├── admin/
│   │   │   ├── lecturer/
│   │   │   └── student/
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.tsx         # Authentication context
│   │   │   ├── useApi.ts
│   │   │   └── useGoogleSignIn.ts
│   │   ├── lib/                   # Utility functions and API client
│   │   │   ├── api.ts             # API client configuration
│   │   │   ├── utils.ts
│   │   │   └── constants.ts
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                         # FastAPI backend application
│   ├── app/
│   │   ├── routes/                # API route handlers
│   │   │   ├── auth.py            # Authentication & user management
│   │   │   ├── admin.py           # Admin endpoints
│   │   │   ├── lecturer.py        # Lecturer endpoints
│   │   │   ├── student.py         # Student endpoints
│   │   │   └── timetable.py       # Timetable management
│   │   ├── models/                # Pydantic models & data schemas
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   ├── room.py
│   │   │   ├── timetable.py
│   │   │   └── ...
│   │   ├── services/              # Business logic
│   │   │   ├── optimizer.py       # Scheduling algorithms
│   │   │   ├── scheduler.py
│   │   │   ├── validator.py
│   │   │   └── timetable_optimizer.py
│   │   ├── utils/                 # Utility functions
│   │   │   ├── logger.py
│   │   │   └── ...
│   │   ├── main.py                # FastAPI app initialization
│   │   ├── config.py              # Configuration settings
│   │   ├── database.py            # Database connection
│   │   ├── security.py            # JWT token handling
│   │   └── dependencies.py        # Dependency injection
│   ├── requirements.txt            # Python dependencies
│   └── .env.example               # Example environment variables
│
├── .gitignore                      # Git ignore configuration
└── README.md                       # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and pnpm (for frontend)
- Python 3.9+ (for backend)
- MongoDB running locally or cloud instance
- Git

### Frontend Setup

```bash
cd client
pnpm install
pnpm run dev
```

The frontend will be available at `http://localhost:8080`

### Backend Setup

```bash
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with required variables
# Copy from .env.example and configure your MongoDB URI, JWT secret, etc.

# Run the server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend API will be available at `http://localhost:8000`

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication:

### Token Structure
Tokens contain the following claims:
- `user_id`: Unique user identifier
- `email`: User email address
- `role`: User role (student, lecturer, admin)
- `exp`: Token expiration time (default: 8 hours)

### Login Flow
1. User submits email, password, and role
2. Server validates credentials against MongoDB
3. JWT token is generated and returned
4. Token is stored in browser localStorage
5. Token is included in Authorization header for all subsequent requests

## 📊 User Roles

### Student
- Browse assigned courses and timetables
- View venue and timing information
- Access personal account settings
- Export personal schedule

### Lecturer
- Manage course information
- View and organize teaching schedules
- Manage classroom resources
- Access student information for courses

### Admin
- Create and manage all users (students, lecturers, admins)
- Configure courses, rooms, and time slots
- Generate and optimize timetables
- Resolve scheduling conflicts
- View system analytics
- Export system data

## 🗄️ Database Schema

### Main Collections

**users**
- Email, password (hashed), role, name
- Contact info: phone, country_code, address, city, country
- Bio and profile information
- Notification preferences
- Timestamps

**student_profiles**
- Registration number, department, course
- College and campus information
- Academic year

**lecturer_profiles**
- Lecturer ID, department
- Office location, qualifications
- Availability and preferences

**admin_profiles**
- Admin ID
- Permissions and roles
- Course management responsibilities

**courses**
- Course code, name, credits
- Department and assigned lecturers

**rooms**
- Room number, capacity, facilities
- Availability and maintenance schedule

**timetables**
- Course, lecturer, room assignments
- Time slots and days
- Status and conflicts

## 🔌 API Endpoints

### Authentication
- `POST /auth/register/*` - User registration (student/lecturer/admin)
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info
- `PUT /auth/profile` - Update profile information
- `POST /auth/notification-preferences` - Save notification settings
- `POST /auth/change-password` - Change password
- `DELETE /auth/account` - Delete user account
- `GET /auth/data-export` - Export user data

### Admin
- `GET /auth/users` - List all users
- `POST /auth/create/lecturer` - Create lecturer
- `POST /auth/create/admin` - Create admin
- `DELETE /auth/users/{user_id}` - Delete user

### Timetable Management
- Endpoints for course, room, and schedule management
- Timetable generation and optimization
- Conflict detection and resolution

## 🎨 Account Settings Features

The Account page provides comprehensive user management:

- **Profile Information**: Edit name, phone, address, city, country
- **Country Selection**: 195 countries with automatic calling codes
- **Notifications**: Toggle email notifications, login alerts, activity updates
- **Password Management**: Change password with current password verification
- **Data Export**: Download all personal data as JSON
- **Account Deletion**: Permanently delete account with confirmation
- **Session Management**: View and manage active sessions

## 🔄 Data Flow

```
User Login → JWT Token → Stored in localStorage
                ↓
API Request → Token in Authorization Header
                ↓
Backend Validates Token → Extracts user_id → Fetches User Data
                ↓
Response with User Info & Update Capabilities
```

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with pbkdf2_sha256
- CORS protection
- Bearer token validation on protected endpoints
- Role-based access control (RBAC)
- Secure token expiration (8 hours default)

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/
DB_NAME=timetable_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRE_HOURS=8
FRONTEND_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## 🐛 Debugging

### Frontend
- Check browser console (F12) for errors
- Check localStorage for auth_token
- Use React DevTools for component debugging

### Backend
- Check server terminal for error logs
- Use `print()` statements or logging
- Check MongoDB connection status
- Verify JWT token validity

## 📦 Dependencies

### Frontend
- react, react-dom, react-router-dom
- vite, typescript
- tailwindcss, postcss
- shadcn/ui, lucide-react

### Backend
- fastapi, uvicorn
- motor (async MongoDB driver)
- pydantic
- python-jose (JWT), passlib
- python-dotenv

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support

For issues, questions, or suggestions, please create an issue in the repository or contact the development team.

## 🎯 Future Enhancements

- [ ] Calendar view for timetables
- [ ] Email notifications for schedule changes
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with student information systems
- [ ] Automated conflict resolution
- [ ] Resource utilization optimization
- [ ] Multi-language support

---

**Last Updated:** January 2, 2026

**Project Status:** Active Development
