"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}-${Date.now()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const fileFilter = (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Only images and documents are allowed'));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: fileFilter
});
// Upload file endpoint
router.post('/upload', auth_1.authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { dogId, vaccinationId, healthRecordId, documentType } = req.body;
        const documentId = (0, uuid_1.v4)();
        const filePath = `/uploads/${req.file.filename}`;
        // Save document info to database
        const result = await database_1.default.query(`INSERT INTO documents (id, dog_id, vaccination_id, health_record_id, filename, original_name, 
       file_type, file_size, file_path, document_type, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [
            documentId,
            dogId || null,
            vaccinationId || null,
            healthRecordId || null,
            req.file.filename,
            req.file.originalname,
            req.file.mimetype,
            req.file.size,
            filePath,
            documentType || 'other',
            req.user.id
        ]);
        res.json({
            message: 'File uploaded successfully',
            document: result.rows[0],
            fileUrl: `${req.protocol}://${req.get('host')}/api/uploads/file/${req.file.filename}`
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});
// Serve uploaded files
router.get('/file/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path_1.default.join(uploadsDir, filename);
    if (fs_1.default.existsSync(filePath)) {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
        res.setHeader("Access-Control-Allow-Origin", "*"); // still good practice
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
        res.sendFile(filePath);
    }
    else {
        res.status(404).json({ error: 'File not found' });
    }
});
// Get documents for a dog
router.get('/dog/:dogId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { dogId } = req.params;
        // Verify dog belongs to user
        const dogCheck = await database_1.default.query('SELECT id FROM dogs WHERE id = $1 AND user_id = $2', [dogId, req.user.id]);
        if (dogCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Dog not found' });
        }
        const result = await database_1.default.query('SELECT * FROM documents WHERE dog_id = $1 ORDER BY created_at DESC', [dogId]);
        res.json({ documents: result.rows });
    }
    catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete document
router.delete('/:documentId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { documentId } = req.params;
        // Get document info and verify ownership
        const docResult = await database_1.default.query(`SELECT d.*, dog.user_id FROM documents d 
       LEFT JOIN dogs dog ON d.dog_id = dog.id 
       WHERE d.id = $1`, [documentId]);
        if (docResult.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const document = docResult.rows[0];
        if (document.user_id !== req.user.id && document.uploaded_by !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Delete file from filesystem
        const filePath = path_1.default.join(uploadsDir, document.filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // Delete from database
        await database_1.default.query('DELETE FROM documents WHERE id = $1', [documentId]);
        res.json({ message: 'Document deleted successfully' });
    }
    catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=uploads.js.map