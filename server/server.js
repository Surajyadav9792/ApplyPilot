require('dotenv').config();

const express=require('express');
const cors=require('cors');
const connectDB=require('./config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app=express();
const PORT=process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
//connect to database
connectDB();

// Ensure uploads/ directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// PDF filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  }
});

const authRoutes=require('./routes/authRoutes');
const aiRoutes=require('./routes/aiRoutes');

app.use('/api/auth',authRoutes);
app.use('/api/ai',aiRoutes);

// Resume Upload API
app.post('/api/upload-resume', (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();

      console.log("\n=== EXTRACTED RESUME TEXT FROM /api/upload-resume ===");
      console.log(result.text);
      console.log("======================================================\n");

      return res.status(200).json({
        success: true,
        filePath: req.file.path,
        filename: req.file.filename,
        resumeText: result.text
      });
    } catch (parseError) {
      console.error("Error parsing uploaded PDF:", parseError);
      return res.status(200).json({
        success: true,
        filePath: req.file.path,
        filename: req.file.filename,
        resumeText: "Error parsing PDF: " + parseError.message
      });
    }
  });
});

// Parse Resume API
app.post('/api/parse-resume', async (req, res) => {
  const { filePath } = req.body;
  if (!filePath) {
    return res.status(400).json({ message: 'filePath is required' });
  }

  const resolvedPath = path.resolve(filePath);
  const uploadsDir = path.resolve(__dirname, 'uploads');
  
  if (!resolvedPath.startsWith(uploadsDir)) {
    return res.status(400).json({ message: 'Invalid file path' });
  }

  if (!fs.existsSync(resolvedPath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  try {
    const dataBuffer = fs.readFileSync(resolvedPath);
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();

    console.log("\n=== EXTRACTED RESUME TEXT FROM /api/parse-resume ===");
    console.log(result.text);
    console.log("====================================================\n");

    return res.status(200).json({
      resumeText: result.text
    });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return res.status(500).json({
      message: 'Failed to parse PDF',
      error: error.message
    });
  }
});

// Send Email API
app.post('/api/send-email', async (req, res) => {
  const { to, subject, body, filePath } = req.body;
  const sendEmail = require('./utils/sendEmail');

  if (!to || !subject || !body) {
    return res.status(400).json({
      success: false,
      message: 'to, subject, and body are required'
    });
  }

  const attachments = [];
  if (filePath) {
    const resolvedPath = path.resolve(filePath);
    const uploadsDir = path.resolve(__dirname, 'uploads');

    if (resolvedPath.startsWith(uploadsDir) && fs.existsSync(resolvedPath)) {
      attachments.push({
        filename: path.basename(resolvedPath),
        path: resolvedPath
      });
    }
  }

  try {
    await sendEmail({
      to,
      subject,
      text: body,
      attachments
    });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

app.listen(PORT,() =>{
    console.log(`Server is running on port ${PORT}`);
});