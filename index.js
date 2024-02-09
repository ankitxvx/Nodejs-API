const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
 
const app = express();
const PORT = 3000;

// Middleware to parse JSON body
app.use(bodyParser.json());

// Load data from store.json
let data = {};
const storeFilePath = 'store.json';
if (fs.existsSync(storeFilePath)) {
    const fileData = fs.readFileSync(storeFilePath, 'utf8');
    data = JSON.parse(fileData);
}

// Middleware to save data to store.json after POST or DELETE
function saveData() {
    fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2));
}

// Middleware to validate ID immutability
function validateId(req, res, next) {
    const { id } = req.params;
    const { id: bodyId } = req.body;
    if (id && bodyId && id !== bodyId) {
        return res.status(400).json({ error: 'ID cannot be mutated' });
    }
    next();
}

// GET /posts
app.get('/posts', (req, res) => {
    res.json(data.posts || []);
});

// GET /posts/:id
app.get('/posts/:id', (req, res) => {
    const post = data.posts.find(post => post.id == req.params.id);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
});

// POST /posts
app.post('/posts', validateId, (req, res) => {
    const newPost = req.body;
    const id = data.posts.length > 0 ? Math.max(...data.posts.map(post => post.id)) + 1 : 0; // Generate unique ID
    

    newPost.id = id;
    data.posts = data.posts || [];
    data.posts.push(newPost);
    saveData();
    res.status(201).json(newPost);
});

// DELETE /posts/:id
app.delete('/posts/:id', (req, res) => {
    const { id } = req.params;
    const index = data.posts.findIndex(post => post.id == id);
    if (index === -1) {
        return res.status(404).json({ error: 'Post not found' });
    }
    data.posts.splice(index, 1);
    saveData();
    res.status(204).send();
});

// GET /authors
app.get('/authors', (req, res) => {
    res.json(data.authors || []);
});

// GET /authors/:id
app.get('/authors/:id', (req, res) => {
    const author = data.authors.find(author => author.id == req.params.id);
    if (!author) {
        return res.status(404).json({ error: 'Author not found' });
    }
    res.json(author);
});

// POST /authors
app.post('/authors', validateId, (req, res) => {
    const newAuthor = req.body;
    const id = data.authors.length > 0 ? Math.max(...data.authors.map(author => author.id)) + 1 : 0; // Generate unique ID
    newAuthor.id = id;
    data.authors = data.authors || [];
    data.authors.push(newAuthor);
    saveData();
    res.status(201).json(newAuthor);
});

// DELETE /authors/:id
app.delete('/authors/:id', (req, res) => {
    const { id } = req.params;
    const index = data.authors.findIndex(author => author.id == id);
    if (index === -1) {
        return res.status(404).json({ error: 'Author not found' });
    }
    data.authors.splice(index, 1);
    saveData();
    res.status(204).send();
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
