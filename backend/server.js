require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require("path"); // Add this line
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // Used for fetching parables

app.use(cors({
    origin: "https://parablestudystudy.onrender.com",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
  }));
app.use(express.json());

// Function to delay execution (helps avoid API spam)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to parse book, chapter, and verse(s) from reference strings
const parseReference = (ref) => {
    const match = ref.match(/^([A-Za-z ]+) (\d+):(\d+)(?:-(\d+))?/);
    if (match) {
        const book = match[1].trim().replace(/\s+/g, ''); // Remove spaces for URL formatting
        const chapter = match[2];
        const verseStart = match[3];
        const verseEnd = match[4] || verseStart; // If no range, use the same verse for start and end
        return { book, chapter, verseStart, verseEnd };
    }
    return null;
};

// Function to fetch Bible verses using the new API
const fetchVerses = async (book, chapter, verseStart, verseEnd) => {
    const verses = [];

    for (let verse = verseStart; verse <= verseEnd; verse++) {
        const verseUrl = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-web/books/${book.toLowerCase()}/chapters/${chapter}/verses/${verse}.json`;

        try {
            const response = await axios.get(verseUrl);
            verses.push(response.data.text); // Extract only the verse text
        } catch (error) {
            console.error(`Error fetching verse ${verse}:`, error.message);
            verses.push(`Error fetching verse ${verse}`);
        }
    }

    return verses.join(' '); // Combine verses into a single text
};

// API route to fetch parables and their corresponding Bible verses
app.get('/api/parable-verses', async (req, res) => {
    try {
        // Fetch parables from the first API
        const parablesResponse = await axios.get(
            'https://iq-bible.p.rapidapi.com/GetParables?language=english',
            { headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY } }
        );

        const parables = parablesResponse.data;

        if (!parables || Object.keys(parables).length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }

        const versePromises = [];

        // Loop through parables and fetch verse texts
        for (const [parable, references] of Object.entries(parables)) {
            references.forEach((ref, index) => {
                const parsed = parseReference(ref);
                if (parsed) {
                    const { book, chapter, verseStart, verseEnd } = parsed;

                    versePromises.push(
                        delay(index * 800) // Delay to prevent overwhelming the API
                        .then(() => fetchVerses(book, chapter, parseInt(verseStart), parseInt(verseEnd)))
                        .then(verseText => ({
                            parable,
                            reference: ref,
                            verseText
                        }))
                        .catch(err => ({
                            parable,
                            reference: ref,
                            error: err.message
                        }))
                    );
                }
            });
        }

        // Wait for all API requests to complete
        const verseResults = await Promise.all(versePromises);

        // Send final response
        res.json(verseResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/api/topics', (req, res) => {
    try {
        const dataPath = path.join(__dirname, "parable_topics.json"); // Load the file
        const jsonData = fs.readFileSync(dataPath, "utf-8");
        const topics = JSON.parse(jsonData);
        res.json(topics); // Send JSON response
    } catch (error) {
        console.error("Error reading JSON file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
