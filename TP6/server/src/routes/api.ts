import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Example API endpoint
router.get('/example', (req, res) => {
    res.status(200).json({ message: 'This is an example endpoint' });
});

// Add more API routes as needed

export default router;