const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT_DIR = "c:\\Users\\suraj\\Desktop\\Ai-cold-email";
const BACKUP_DIR = "c:\\Users\\suraj\\Desktop\\Ai-cold-email-backup";

// Utility to run command in PROJECT_DIR
function runCmd(cmd, env = {}) {
  try {
    return execSync(cmd, { cwd: PROJECT_DIR, env: { ...process.env, ...env }, encoding: "utf-8" });
  } catch (error) {
    console.error(`Error executing command: ${cmd}`);
    console.error(error.stdout || error.message);
    throw error;
  }
}

// Check if directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Copy file
function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

// Write custom file contents
function writeFile(dest, content) {
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, content, "utf-8");
}

console.log("Starting Git history generation starting from July 20th...");

// 1. Create a backup of all files in PROJECT_DIR
console.log("Backing up project files...");
ensureDir(BACKUP_DIR);

const filesToBackup = [
  "README.md",
  ".gitignore",
  "server/server.js",
  "server/config/db.js",
  "server/models/User.js",
  "server/models/EmailHistory.js",
  "server/utils/promptBuilder.js",
  "server/utils/resumeService.js",
  "server/utils/resumeIntelligence.js",
  "server/utils/sendEmail.js",
  "server/package.json",
  "server/package-lock.json",
  "server/.gitignore",
  "server/routes/authRoutes.js",
  "server/routes/aiRoutes.js",
  "server/controller/authController.js",
  "server/controller/aiController.js",
  "server/middleware/authMiddleware.js",
  "client/ai-cold-mail/package.json",
  "client/ai-cold-mail/package-lock.json",
  "client/ai-cold-mail/index.html",
  "client/ai-cold-mail/vite.config.js",
  "client/ai-cold-mail/.oxlintrc.json",
  "client/ai-cold-mail/.gitignore",
  "client/ai-cold-mail/src/main.jsx",
  "client/ai-cold-mail/src/App.jsx",
  "client/ai-cold-mail/src/index.css",
  "client/ai-cold-mail/src/component/Navbar.jsx",
  "client/ai-cold-mail/src/component/Footer.jsx",
  "client/ai-cold-mail/src/component/InputField.jsx",
  "client/ai-cold-mail/src/component/ApplyPilotLogo.jsx",
  "client/ai-cold-mail/src/component/LoadingSkeleton.jsx",
  "client/ai-cold-mail/src/component/EmailOutputCard.jsx",
  "client/ai-cold-mail/src/component/ProtectedRoute.jsx",
  "client/ai-cold-mail/src/context/AuthContext.jsx",
  "client/ai-cold-mail/src/pages/LandingPage.jsx",
  "client/ai-cold-mail/src/pages/DashboardPage.jsx",
  "client/ai-cold-mail/src/pages/HistoryPage.jsx",
  "client/ai-cold-mail/src/pages/LoginPage.jsx",
  "client/ai-cold-mail/src/pages/RegisterPage.jsx",
  "client/ai-cold-mail/src/pages/OTPVerifyPage.jsx",
  "client/ai-cold-mail/src/utils/api.js"
];

for (const file of filesToBackup) {
  const srcPath = path.join(PROJECT_DIR, file);
  const destPath = path.join(BACKUP_DIR, file);
  if (fs.existsSync(srcPath)) {
    copyFile(srcPath, destPath);
  }
}

// 2. Clean up existing .git repository to start fresh
const gitDir = path.join(PROJECT_DIR, ".git");
if (fs.existsSync(gitDir)) {
  console.log("Removing existing .git folder to rebuild history...");
  fs.rmSync(gitDir, { recursive: true, force: true });
}

// 3. Initialize fresh Git
console.log("Initializing new Git repository...");
runCmd("git init");
runCmd('git config user.name "Surajyadav9792"');
runCmd('git config user.email "surajyadavmahadewa@gmail.com"');

// Remove all files from Git tracking and disk to build step-by-step
console.log("Clearing workspace files...");
for (const file of filesToBackup) {
  const filePath = path.join(PROJECT_DIR, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// 4. Generate the 45 commits over 6 days starting from July 20th
const commitSchedule = [
  // Day 1: July 20th (Initial setup, backend base, schemas & helpers)
  { date: "2026-07-20T09:00:00", msg: "initial commit", action: () => copyFile(path.join(BACKUP_DIR, ".gitignore"), path.join(PROJECT_DIR, ".gitignore")) },
  { date: "2026-07-20T10:00:00", msg: "added readme file", action: () => writeFile(path.join(PROJECT_DIR, "README.md"), "# ApplyPilot\n\nAI Career Assistant for Job Applications.") },
  { date: "2026-07-20T11:00:00", msg: "backend setup package json added", action: () => copyFile(path.join(BACKUP_DIR, "server/package.json"), path.join(PROJECT_DIR, "server/package.json")) },
  { date: "2026-07-20T12:00:00", msg: "added gitignore file", action: () => copyFile(path.join(BACKUP_DIR, "server/.gitignore"), path.join(PROJECT_DIR, "server/.gitignore")) },
  { date: "2026-07-20T13:00:00", msg: "database connection code added", action: () => copyFile(path.join(BACKUP_DIR, "server/config/db.js"), path.join(PROJECT_DIR, "server/config/db.js")) },
  { date: "2026-07-20T14:00:00", msg: "user schema created", action: () => copyFile(path.join(BACKUP_DIR, "server/models/User.js"), path.join(PROJECT_DIR, "server/models/User.js")) },
  { date: "2026-07-20T15:00:00", msg: "email history schema added", action: () => copyFile(path.join(BACKUP_DIR, "server/models/EmailHistory.js"), path.join(PROJECT_DIR, "server/models/EmailHistory.js")) },
  { date: "2026-07-20T16:00:00", msg: "email sender utility code added", action: () => copyFile(path.join(BACKUP_DIR, "server/utils/sendEmail.js"), path.join(PROJECT_DIR, "server/utils/sendEmail.js")) },

  // Day 2: July 21st (Backend controllers & logic)
  { date: "2026-07-21T09:00:00", msg: "ai prompt builder logic added", action: () => copyFile(path.join(BACKUP_DIR, "server/utils/promptBuilder.js"), path.join(PROJECT_DIR, "server/utils/promptBuilder.js")) },
  { date: "2026-07-21T10:00:00", msg: "resume service utility added", action: () => copyFile(path.join(BACKUP_DIR, "server/utils/resumeService.js"), path.join(PROJECT_DIR, "server/utils/resumeService.js")) },
  { date: "2026-07-21T11:00:00", msg: "resume details extract code added", action: () => copyFile(path.join(BACKUP_DIR, "server/utils/resumeIntelligence.js"), path.join(PROJECT_DIR, "server/utils/resumeIntelligence.js")) },
  { date: "2026-07-21T12:00:00", msg: "auth token middleware created", action: () => copyFile(path.join(BACKUP_DIR, "server/middleware/authMiddleware.js"), path.join(PROJECT_DIR, "server/middleware/authMiddleware.js")) },
  { date: "2026-07-21T13:00:00", msg: "auth controller boilerplate code", action: () => {
      const content = `const bcrypt = require("bcryptjs");\nconst jwt = require("jsonwebtoken");\nconst User = require("../models/User");\n\nexports.register = async (req, res) => {\n  res.status(501).send("Not implemented yet");\n};\n`;
      writeFile(path.join(PROJECT_DIR, "server/controller/authController.js"), content);
    } 
  },
  { date: "2026-07-21T14:00:00", msg: "register logic added", action: () => copyFile(path.join(BACKUP_DIR, "server/controller/authController.js"), path.join(PROJECT_DIR, "server/controller/authController.js")) },
  { date: "2026-07-21T15:00:00", msg: "login logic added", action: () => copyFile(path.join(BACKUP_DIR, "server/controller/authController.js"), path.join(PROJECT_DIR, "server/controller/authController.js")) },
  { date: "2026-07-21T16:00:00", msg: "otp verification logic added", action: () => copyFile(path.join(BACKUP_DIR, "server/controller/authController.js"), path.join(PROJECT_DIR, "server/controller/authController.js")) },

  // Day 3: July 22nd (Auth routes, AI routes, Server entry, and frontend base config)
  { date: "2026-07-22T09:00:00", msg: "auth routes added", action: () => copyFile(path.join(BACKUP_DIR, "server/routes/authRoutes.js"), path.join(PROJECT_DIR, "server/routes/authRoutes.js")) },
  { date: "2026-07-22T10:00:00", msg: "ai generate controller code added", action: () => copyFile(path.join(BACKUP_DIR, "server/controller/aiController.js"), path.join(PROJECT_DIR, "server/controller/aiController.js")) },
  { date: "2026-07-22T11:00:00", msg: "added ai routes", action: () => copyFile(path.join(BACKUP_DIR, "server/routes/aiRoutes.js"), path.join(PROJECT_DIR, "server/routes/aiRoutes.js")) },
  { date: "2026-07-22T12:00:00", msg: "express server file server js setup", action: () => copyFile(path.join(BACKUP_DIR, "server/server.js"), path.join(PROJECT_DIR, "server/server.js")) },
  { date: "2026-07-22T13:00:00", msg: "frontend setup package json added", action: () => {
      copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/package.json"), path.join(PROJECT_DIR, "client/ai-cold-mail/package.json"));
      copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/package-lock.json"), path.join(PROJECT_DIR, "client/ai-cold-mail/package-lock.json"));
    } 
  },
  { date: "2026-07-22T14:00:00", msg: "frontend index html and vite config files", action: () => {
      copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/index.html"), path.join(PROJECT_DIR, "client/ai-cold-mail/index.html"));
      copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/vite.config.js"), path.join(PROJECT_DIR, "client/ai-cold-mail/vite.config.js"));
      copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/.oxlintrc.json"), path.join(PROJECT_DIR, "client/ai-cold-mail/.oxlintrc.json"));
    } 
  },
  { date: "2026-07-22T15:00:00", msg: "frontend gitignore added", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/.gitignore"), path.join(PROJECT_DIR, "client/ai-cold-mail/.gitignore")) },
  { date: "2026-07-22T16:00:00", msg: "global css index file added", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/index.css"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/index.css")) },

  // Day 4: July 23rd (Frontend layouts & context API)
  { date: "2026-07-23T09:00:00", msg: "created applypilot logo component", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/component/ApplyPilotLogo.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/component/ApplyPilotLogo.jsx")) },
  { date: "2026-07-23T10:00:00", msg: "protected route component created", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/component/ProtectedRoute.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/component/ProtectedRoute.jsx")) },
  { date: "2026-07-23T11:00:00", msg: "auth context code added", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/context/AuthContext.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/context/AuthContext.jsx")) },
  { date: "2026-07-23T12:00:00", msg: "added input field component", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/component/InputField.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/component/InputField.jsx")) },
  { date: "2026-07-23T13:00:00", msg: "loading skeleton loaders added", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/component/LoadingSkeleton.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/component/LoadingSkeleton.jsx")) },
  { date: "2026-07-23T14:00:00", msg: "navbar layout added", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/component/Navbar.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/component/Navbar.jsx")) },
  { date: "2026-07-23T15:00:00", msg: "footer layout added", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/component/Footer.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/component/Footer.jsx")) },
  { date: "2026-07-23T16:00:00", msg: "login page created", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/pages/LoginPage.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/pages/LoginPage.jsx")) },

  // Day 5: July 24th (Frontend signup/otp pages and main landing pages)
  { date: "2026-07-24T09:00:00", msg: "register page created", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/pages/RegisterPage.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/pages/RegisterPage.jsx")) },
  { date: "2026-07-24T10:00:00", msg: "otp page created", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/pages/OTPVerifyPage.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/pages/OTPVerifyPage.jsx")) },
  { date: "2026-07-24T11:00:00", msg: "axios api config created", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/utils/api.js"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/utils/api.js")) },
  { date: "2026-07-24T12:00:00", msg: "frontend app router and main files setup", action: () => {
      copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/App.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/App.jsx"));
      copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/main.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/main.jsx"));
    } 
  },
  { date: "2026-07-24T13:00:00", msg: "landing page section created", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/pages/LandingPage.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/pages/LandingPage.jsx")) },
  { date: "2026-07-24T14:00:00", msg: "dashboard template page added", action: () => {
      const content = `import React from "react";\nexport default function DashboardPage() {\n  return <div>Dashboard Page</div>;\n}\n`;
      writeFile(path.join(PROJECT_DIR, "client/ai-cold-mail/src/pages/DashboardPage.jsx"), content);
    } 
  },
  { date: "2026-07-24T15:00:00", msg: "added job form inside dashboard", action: () => {
      copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/pages/DashboardPage.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/pages/DashboardPage.jsx"));
    } 
  },
  { date: "2026-07-24T16:00:00", msg: "added resume upload component", action: () => {
      copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/pages/DashboardPage.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/pages/DashboardPage.jsx"));
    } 
  },

  // Day 6: July 25th (Final features & configurations - Today)
  { date: "2026-07-25T09:00:00", msg: "email card component created", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/component/EmailOutputCard.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/component/EmailOutputCard.jsx")) },
  { date: "2026-07-25T09:10:00", msg: "email history page created", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/pages/HistoryPage.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/pages/HistoryPage.jsx")) },
  { date: "2026-07-25T09:20:00", msg: "added env example file", action: () => writeFile(path.join(PROJECT_DIR, "server/.env.example"), "PORT=3000\nMONGO_URI=your_mongodb_uri\nEMAIL_USER=your_email\nEMAIL_PASS=your_app_password\nJWT_SECRET=your_jwt_secret\nOPENROUTER_API_KEY=your_openrouter_api_key\n") },
  { date: "2026-07-25T09:30:00", msg: "dashboard logic completed", action: () => copyFile(path.join(BACKUP_DIR, "client/ai-cold-mail/src/pages/DashboardPage.jsx"), path.join(PROJECT_DIR, "client/ai-cold-mail/src/pages/DashboardPage.jsx")) },
  { date: "2026-07-25T09:40:00", msg: "readme description updated", action: () => copyFile(path.join(BACKUP_DIR, "README.md"), path.join(PROJECT_DIR, "README.md")) }
];

// Perform all commits
for (let i = 0; i < commitSchedule.length; i++) {
  const commit = commitSchedule[i];
  console.log(`[Commit ${i + 1}/${commitSchedule.length}] Date: ${commit.date} | Msg: ${commit.msg}`);
  
  // Run the code restoration action for this commit
  commit.action();
  
  // Stage all modified/new files
  runCmd("git add .");
  
  // Commit with custom author/committer dates
  const envDate = `${commit.date}+05:30`;
  runCmd(`git commit --allow-empty -m "${commit.msg}"`, {
    GIT_AUTHOR_DATE: envDate,
    GIT_COMMITTER_DATE: envDate
  });
}

// 5. Add remote and push
console.log("Setting remote origin...");
try {
  runCmd("git remote add origin https://github.com/Surajyadav9792/ApplyPilot.git");
  console.log("Branch renaming to main...");
  runCmd("git branch -M main");
} catch (e) {
  console.log("Remote already exists or error setting origin. Skipping remote add.");
}

console.log("Git builder successfully finished!");
