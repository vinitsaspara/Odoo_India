import express from 'express';

const router = express.Router();

// Generate SVG placeholder images
router.get('/placeholder/:dimensions', (req, res) => {
    try {
        const { dimensions } = req.params;
        const { text = 'Image', bg = 'e2e8f0', color = '64748b' } = req.query;

        // Parse dimensions (e.g., "300x200")
        const [width, height] = dimensions.split('x').map(num => parseInt(num) || 300);

        // Validate dimensions
        if (width > 2000 || height > 2000 || width < 10 || height < 10) {
            return res.status(400).json({ error: 'Invalid dimensions' });
        }

        // Convert hex colors to valid format
        const bgColor = `#${bg.replace('#', '')}`;
        const textColor = `#${color.replace('#', '')}`;

        // Generate SVG
        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="${bgColor}"/>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                      font-family="Arial, sans-serif" font-size="${Math.max(12, Math.min(width, height) / 8)}" fill="${textColor}">
                    ${text}
                </text>
            </svg>
        `;

        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.send(svg);
    } catch (error) {
        console.error('Placeholder generation error:', error);
        res.status(500).json({ error: 'Failed to generate placeholder' });
    }
});

export default router;
