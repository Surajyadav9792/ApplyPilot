# ApplyPilot 🚀

ApplyPilot is a premium AI-powered SaaS platform designed to help job seekers apply smarter and get more interviews. It parses user resumes, allows inputting specific job descriptions, and utilizes advanced AI to generate highly personalized, high-converting cold outreach emails.

---

## ✨ Features

- **Supersonic AI Email Generator**: Automatically writes tailored cold emails matching your resume credentials to the target job description.
- **Resume Intelligence**: Upload your resume in PDF/Docx format, and the system extracts key professional highlights and skills.
- **Authentication & Security**: Robust JWT-based user authentication, including registration, login, and secure OTP verification.
- **Outreach History Tracker**: Keep track of all generated emails, target roles, and companies in one clean dashboard.
- **Premium Dark Mode UI**: Modern dashboard interface featuring high-fidelity micro-animations and a custom Flight Jet "A" branding.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS
- React Router DOM
- Axios

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- Nodemailer (Gmail service configuration)
- Gemini / OpenRouter API (AI text generation)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Surajyadav9792/ApplyPilot.git
   cd ApplyPilot
   ```

2. **Backend Setup:**
   Navigate to the `server` directory, install dependencies, and configure variables:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file inside the `server` directory (reference `.env.example` for details):
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   JWT_SECRET=your_jwt_secret_token
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```
   Start the backend server:
   ```bash
   npm start
   ```

3. **Frontend Setup:**
   Navigate to the `client/ai-cold-mail` directory and install dependencies:
   ```bash
   cd ../client/ai-cold-mail
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 📄 License

This project is licensed under the MIT License.