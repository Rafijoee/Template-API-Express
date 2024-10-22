const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors'); // Import CORS
const app = express();

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

// Enable CORS for all routes
app.use(cors()); // <-- Tambahkan ini untuk mengaktifkan CORS

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "API documentation with Swagger",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local server",
            }
        ]
    },
    apis: ['./index.js'], // Path ke file tempat routes diatur
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(bodyParser.json());
app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Contoh route POST
app.post('/api/v1/users', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        let user = await prisma.user.create({
            data: { name: name }
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Example route
 *     responses:
 *       200:
 *         description: An example response
 */
app.get('/api/v1/users', async (req, res) => {
    let users = await prisma.post.findMany({
        orderBy: { id: 'asc' }
    });

    return res.json(users);
});

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create a new category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the post
 *                 example: "My First Post"
 *               assignedBy:
 *                 type: string
 *                 description: The user assigning the category
 *                 example: "user123"
 *               category:
 *                 type: string
 *                 description: Name of the category to create
 *                 example: "Technology"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the created post
 *                   example: "1"
 *                 title:
 *                   type: string
 *                   description: Title of the created post
 *                   example: "My First Post"
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       assignedBy:
 *                         type: string
 *                         description: The user who assigned the category
 *                       assignedAt:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time when the category was assigned
 *                       category:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: Name of the created category
 *                             example: "Technology"
 *       400:
 *         description: Bad request, invalid input
 *       500:
 *         description: Internal server error
 */
app.post('/api/v1/categories', async (req, res) => {
    const createCategory = await prisma.post.create({
        data: {
            title: req.body.title,
            categories: {
                create: [
                    {
                        assignedBy: req.body.assignedBy,
                        assignedAt: new Date(),
                        category: {
                            create: {
                                name: req.body.category
                            },
                        }
                    }
                ]
            }
        }
    });

    res.status(201).json(createCategory);
});

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));