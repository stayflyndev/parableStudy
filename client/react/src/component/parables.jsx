import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Header from "./Header/Header"

const BIBLE_VERSION = "en-web"; // Web English Bible Version

const ParableList = () => {
  const [parables, setParables] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [verses, setVerses] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchParables = async () => {
      try {
        // Fetch both parables & topics at the same time
        const [parableRes, topicRes] = await Promise.all([
          axios.get("http://localhost:5000/api/parable-verses"), // Correct endpoint
          axios.get("http://localhost:5000/api/topics"), // Correct endpoint
        ]);

        // Organize parables
        const groupedParables = parableRes.data.reduce((acc, item) => {
          if (!acc[item.parable]) {
            acc[item.parable] = { references: [], topics: [] };
          }
          acc[item.parable].references.push(item.reference);
          return acc;
        }, {});

        // Normalize function to improve matching
        const normalize = (str) =>
          str.toLowerCase().replace(/\s+/g, "").replace(/[^\w]/g, "");

        // Attach topics to parables using better matching
        topicRes.data.forEach((topic) => {
          const normalizedTopic = normalize(topic.topic);
          const matchingParableKey = Object.keys(groupedParables).find(
            (key) => normalize(key) === normalizedTopic
          );

          if (matchingParableKey) {
            groupedParables[matchingParableKey].topics.push(topic.description);
          } else {
            console.warn(`No exact match for topic: ${topic.topic}`);
          }
        });

        setParables(groupedParables);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchParables();
  }, []);

  const parseReference = (reference) => {
    const match = reference.match(/^([A-Za-z ]+) (\d+):(\d+)(?:-(\d+))?/);
    if (match) {
      return {
        book: match[1].trim().replace(/\s+/g, ""),
        chapter: match[2],
        verseStart: match[3],
        verseEnd: match[4] || match[3],
      };
    }
    return null;
  };

  const fetchVerses = async (references) => {
    const verseTexts = [];

    for (let ref of references) {
      const parsed = parseReference(ref);
      if (!parsed) {
        verseTexts.push({ reference: ref, text: "Invalid reference format." });
        continue;
      }

      const { book, chapter, verseStart, verseEnd } = parsed;

      for (
        let verse = parseInt(verseStart);
        verse <= parseInt(verseEnd);
        verse++
      ) {
        try {
          const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${BIBLE_VERSION}/books/${book.toLowerCase()}/chapters/${chapter}/verses/${verse}.json`;
          const response = await axios.get(url);
          verseTexts.push({
            reference: `${book} ${chapter}:${verse}`,
            text: response.data.text,
          });
        } catch (error) {
          console.error(`Error fetching ${ref}:`, error);
          verseTexts.push({ reference: ref, text: "Error fetching verse." });
        }
      }
    }

    setVerses(verseTexts);
  };

  const handleOpen = async (group) => {
    setSelectedGroup(group);
    setOpen(true);
    await fetchVerses(parables[group].references);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedGroup(null);
    setVerses([]);
  };

  if (loading) return <p>There's A Friend in Jesus...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Container>
        <Header />
        <Typography
  variant="h1"
  sx={{ fontFamily: "Elsie, serif", color: "#000000", textAlign: "center" }}
>
  Earthly Stories With Heavenly Meaning
</Typography>
      <h3>Some Stories Read Us</h3>
      <Grid container spacing={2} sx={{ padding: 2 }}>
        {Object.keys(parables).map((group, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={index}>
            <Card
              sx={{
                height: 130,
                cursor: "pointer",
                transition: "0.3s",
                borderRadius: 2,
                boxShadow: 7,
                border: "1px solid rgba(0, 0, 0, 0.12)",
                backgroundColor: "#52796f", // Light blue background
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
                  backgroundColor: "#4f5d75", 
                  fontWeight: "900" /// Slightly darker blue on hover
                },
              }}
              onClick={() => handleOpen(group)}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{ fontFamily: "Elsie, serif", color: "#FFFFFF" }}
                >
                  {group}
                </Typography>
                {parables[group].topics.length > 0 && (
                  <Typography variant="h6" color="textSecondary"
                  sx={{ fontFamily: "Patrick Hand", color: "#ffffff" }}>
                    {parables[group].topics.join(", ")}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedGroup}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {verses.length === 0 ? (
            <CircularProgress />
          ) : (
            verses.map((item, index) => (
              <Typography key={index} variant="body1" sx={{ marginBottom: 1 }}>
                <strong>📖 {item.reference}:</strong> {item.text}
              </Typography>
            ))
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ParableList;
