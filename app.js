import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import myNote from './models/myNote.js';

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

connectDB();

app.get('/', (req, res) => {
    res.send(`<h1>Welcome to note App that is served by MongoDB in the backend</h1>`);
});


//Get all notes (GET /api/notes)
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await myNote.find();
        res.json(notes);
        res.status(200).json({message: 'Notes retrieved successfully'})
    }
    catch(error)
    {
        res.status(500).json({error: 'Failed to fetch notes'});
    } 
});

// Get a node by ID (GET /api/notes/:id)
app.get('/api/notes/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const note = await myNote.findById(id);
        res.json(note);
        res.status(200).json({message: 'Note retrieved successfully'});
    }

    catch(error) {
        res.status(500).json({error: 'Failed to fetch the note by id'});
    }
});

//Add a note (POST /api/notes)
app.post('/api/notes', async (req, res) => {
    try {
        if (!req.body.text) {
            return res.status(400).json({error: 'Text is required'})
            }
        const note = await myNote.create(            {
                text: req.body.text,
                completed: req.body.completed || false
            });
        res.status(201).json(note);
        }
    catch(error)
        {
            res.status(500).json({error: 'Failed to create note'});
        }
});

//Update a note (PUT /api/notes/:id)
app.put('/api/notes/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const note = await myNote.findByIdAndUpdate(id, req.body, {new: true});
        res.status(200).json({message: 'Note updated successfully'});
    } 
    catch(error) {
        res.status(500).json({error: 'Failed to update note'});
    }
});

//Delete a note (DELETE /api/notes/:id)
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const note = await myNote.findByIdAndDelete(id);
        res.status(200).json({message: 'Note deleted successfully'});

    }

    catch (error) {
        res.status(500).json({error: 'Failed to delete the node'});

    }
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}` );
});