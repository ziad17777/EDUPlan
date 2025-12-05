# 🎓 EDUPlan - Smart Educational Platform

<div align="center">

![EDUPlan Banner](https://github.com/ziad17777/EDUPlan/blob/fe6ce10b9b891510010a418be8122ef1ca6c94f0/unnamed.jpg)

**The ultimate study companion every student needs.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.1-61dafb?logo=react)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-5.2.8-092e20?logo=django)](https://www.djangoproject.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.13-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Getting Started](#-getting-started) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About EDUPlan

**EDUPlan** is a comprehensive full-stack educational platform designed to revolutionize how students organize and manage their academic life. By combining modern web technologies with AI-powered insights, EDUPlan helps students optimize their study time, track subjects, and achieve their academic goals.

### ✨ Why EDUPlan?

- **🎯 Smart Study Planning**: AI-driven algorithms create personalized study schedules based on your available time and priorities
- **📚 Subject Management**: Easily track all your subjects with custom priorities and time allocations
- **🔐 Secure Authentication**: Built-in user authentication system to keep your data safe
- **📱 Responsive Design**: Beautiful, modern UI that works seamlessly across all devices
- **⚡ Lightning Fast**: Built with cutting-edge technologies for optimal performance

---

## 🏗️ Project Architecture

EDUPlan follows a **monorepo structure** with three main components:

```
EDUPlan/
├── frontend/          # React + Vite application
├── backend/           # Django REST API
└── ai_model/          # AI/ML modules (future enhancement)
```

### Component Overview

| Component | Purpose | Tech Stack |
|-----------|---------|------------|
| **Frontend** | User interface & experience | React 19, Vite 7, Tailwind CSS 4, Framer Motion |
| **Backend** | RESTful API & database | Django 5.2, Django REST Framework, SQLite |
| **AI Model** | Intelligent recommendations | Python, ML libraries (planned) |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1.1 with React Router DOM
- **Build Tool**: Vite 7.1.2
- **Styling**: Tailwind CSS 4.1.13 with custom animations
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion 12
- **Form Management**: React Hook Form + Zod validation

### Backend
- **Framework**: Django 5.2.8
- **API**: Django REST Framework
- **Database**: SQLite (development) - easily upgradable to PostgreSQL/MySQL
- **Authentication**: Django built-in auth system

### AI/ML (Planned)
- Python-based machine learning modules
- Integration with study pattern analysis
- Personalized recommendation system

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **pip** (Python package manager)
- **Git**

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ziad17777/EDUPlan.git
cd EDUPlan
```

#### 2️⃣ Backend Setup (Django)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (recommended)
python -m venv venv

# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install django djangorestframework

# Run database migrations
python manage.py migrate

# Create a superuser (optional, for admin access)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

#### 3️⃣ Frontend Setup (React)

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### 4️⃣ Verify Installation

- Frontend: Open `http://localhost:5173` in your browser
- Backend API: Open `http://localhost:8000/admin` for Django admin panel
- API Endpoints: Test at `http://localhost:8000/api/students/`

---

## 📁 Project Structure

```
EDUPlan/
│
├── frontend/                 # React Frontend Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # Base UI components (buttons, cards, etc.)
│   │   │   ├── Chat/       # Chat interface components
│   │   │   ├── layout/     # Layout components (navbar, footer)
│   │   │   └── sections/   # Page sections (hero, features)
│   │   ├── routes/         # Application routes
│   │   │   ├── pages/      # Page components
│   │   │   └── layouts/    # Route layouts
│   │   ├── store/          # State management
│   │   ├── lib/            # Utility functions
│   │   └── main.jsx        # Application entry point
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
├── backend/                 # Django Backend API
│   ├── myproject/          # Django project settings
│   │   ├── settings.py     # Project configuration
│   │   ├── urls.py         # Main URL routing
│   │   └── wsgi.py         # WSGI configuration
│   ├── students/           # Students app
│   │   ├── models.py       # Database models
│   │   ├── views.py        # API views
│   │   ├── urls.py         # App URL routing
│   │   └── admin.py        # Admin configuration
│   ├── manage.py           # Django management script
│   └── db.sqlite3          # SQLite database
│
└── ai_model/               # AI/ML Modules (Planned)
    └── README.md
```

---

## 🎯 Features

### Current Features

#### 🔐 User Authentication
- Secure user registration and login
- Token-based authentication
- User profile management

#### 📚 Subject Management
- Add, view, and manage subjects
- Set priority levels (1-5) for each subject
- Track weekly study hours per subject
- Organize subjects by importance

#### 📅 Smart Study Planning
- AI-powered study plan generation
- Personalized time allocation based on:
  - Available daily study time
  - Subject priorities
  - Weekly hour requirements
- Optimal schedule distribution

#### 🎨 Modern UI/UX
- Beautiful gradient-based design
- Smooth animations with Framer Motion
- Fully responsive layouts
- Dark mode support (coming soon)
- Accessible components

### Upcoming Features

- 🤖 Advanced AI chatbot for study assistance
- 📊 Progress tracking and analytics
- 🏆 Achievement system and gamification
- 📱 Mobile app (React Native)
- 🔔 Study reminders and notifications
- 👥 Collaborative study groups
- 📈 Performance analytics dashboard
- 🗂️ Document upload and management
- 💬 Real-time chat support

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8000/api/students/
```

### Authentication Endpoints

#### Register User
```http
POST /api/students/register/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password",
  "email": "john@example.com",
  "available_time": 240,
  "goals": "Master mathematics and programming"
}
```

**Response:**
```json
{
  "message": "registration successful",
  "student_id": 1,
  "username": "john_doe"
}
```

#### Login User
```http
POST /api/students/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "message": "login successful",
  "user_id": 1,
  "username": "john_doe"
}
```

### Subject Management Endpoints

#### Add Subject
```http
POST /api/students/subjects/add/
Content-Type: application/json

{
  "student_id": 1,
  "name": "Mathematics",
  "hours_needed": 10,
  "priority": 5
}
```

**Response:**
```json
{
  "message": "subject Mathematics added successfully",
  "subject_id": 1
}
```

#### Get Student Subjects
```http
GET /api/students/subjects/{student_id}/
```

**Response:**
```json
{
  "student_name": "john_doe",
  "subjects": [
    {
      "id": 1,
      "name": "Mathematics",
      "hours_per_week": 10,
      "priority": 5
    },
    {
      "id": 2,
      "name": "Physics",
      "hours_per_week": 8,
      "priority": 4
    }
  ]
}
```

### Study Plan Endpoints

#### Create Study Plan
```http
POST /api/students/plan/create/
Content-Type: application/json

{
  "student_id": 1
}
```

**Response:**
```json
{
  "student": "john_doe",
  "available_minutes_daily": 240,
  "study_plan": [
    {
      "subject_name": "Mathematics",
      "daily_minutes": 120,
      "priority_level": 5
    },
    {
      "subject_name": "Physics",
      "daily_minutes": 96,
      "priority_level": 4
    }
  ]
}
```

---

## 🧪 Development

### Running Tests

#### Backend Tests
```bash
cd backend
python manage.py test
```

#### Frontend Tests
```bash
cd frontend
npm run test
```

### Linting

#### Frontend Linting
```bash
cd frontend
npm run lint
```

### Building for Production

#### Frontend Build
```bash
cd frontend
npm run build
```

The production build will be available in the `frontend/dist` directory.

#### Backend Deployment
For production deployment, ensure you:
1. Set `DEBUG = False` in `settings.py`
2. Configure proper `ALLOWED_HOSTS`
3. Use a production-grade database (PostgreSQL/MySQL)
4. Set up proper secret key management
5. Configure static files serving

---

## 🌟 Screenshots

### Landing Page
![Home Page](https://via.placeholder.com/800x500/1e40af/ffffff?text=EDUPlan+Landing+Page)

*Modern, responsive landing page with smooth animations*

### Dashboard
![Dashboard](https://via.placeholder.com/800x500/1e40af/ffffff?text=Student+Dashboard)

*Intuitive dashboard for managing subjects and study plans*

### Study Plan
![Study Plan](https://via.placeholder.com/800x500/1e40af/ffffff?text=AI-Generated+Study+Plan)

*AI-powered personalized study schedule*

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/EDUPlan.git
   cd EDUPlan
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make Your Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click 'New Pull Request'
   - Provide a clear description of your changes

### Contribution Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Update documentation for new features
- Add tests for new functionality
- Ensure all tests pass before submitting PR
- Be respectful and constructive in discussions

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- 🌐 Internationalization
- ♿ Accessibility improvements

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 EDUPlan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Authors & Contributors

### Core Team

- **Ziad** - *Project Creator & Lead Developer* - [@ziad17777](https://github.com/ziad17777)

### Contributors

Want to see your name here? Check out our [Contributing Guidelines](#-contributing)!

---

## 💬 Support & Contact

### Get Help

- 🐛 **Issues**: [GitHub Issues](https://github.com/ziad17777/EDUPlan/issues) - Report bugs or request features
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ziad17777/EDUPlan/discussions) - Ask questions and share ideas
- 📧 **Email**: Create an issue on GitHub for the fastest response

### Connect With Us

- ⭐ **Star this repo**: Show your support and stay updated
- 🔔 **Watch**: Get notifications about updates and releases
- 🍴 **Fork**: Create your own version and contribute back

---

## 🙏 Acknowledgments

Special thanks to:

- [React Team](https://reactjs.org/) for the amazing framework
- [Django Team](https://www.djangoproject.com/) for the robust backend framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Lucide](https://lucide.dev/) for the beautiful icons
- All our contributors and supporters

---

## 📊 Project Status

### Current Version: 0.0.0 (Beta)

### Development Roadmap

#### Phase 1: Core Features (Current) ✅
- [x] User authentication system
- [x] Subject management
- [x] Basic study plan generation
- [x] Responsive UI design

#### Phase 2: Enhanced Features 🚧
- [ ] Advanced AI chatbot integration
- [ ] Progress tracking and analytics
- [ ] Document upload functionality
- [ ] Real-time notifications

#### Phase 3: Scaling & Optimization 📋
- [ ] Mobile app development
- [ ] Performance optimization
- [ ] Advanced caching strategies
- [ ] Microservices architecture

#### Phase 4: Community & Collaboration 🎯
- [ ] Study groups feature
- [ ] Collaborative learning tools
- [ ] Peer review system
- [ ] Gamification elements

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/ziad17777/EDUPlan?style=social)
![GitHub forks](https://img.shields.io/github/forks/ziad17777/EDUPlan?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/ziad17777/EDUPlan?style=social)
![GitHub issues](https://img.shields.io/github/issues/ziad17777/EDUPlan)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ziad17777/EDUPlan)

---

<div align="center">

**Made with ❤️ by students, for students**

⭐ Star us on GitHub — it helps!

[Report Bug](https://github.com/ziad17777/EDUPlan/issues) • [Request Feature](https://github.com/ziad17777/EDUPlan/issues) • [Documentation](https://github.com/ziad17777/EDUPlan/wiki)

</div>
