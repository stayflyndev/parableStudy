import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, CardMedia, CircularProgress, Grid2 } from "@mui/material";


const API_URL = 'http://localhost:5000/api/parables-verses';

//manage the data returned and if its loading
const DataCard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)

//hook to handle the API GET request 
//there needs to be an empty array in order to keep track of state
useEffect(() => {
fetch(API_URL)
.then((res) => res.join())
.then((results) => {
    setData(results);
    setLoading(false);
})
.catch((error) => {
    console.error("There was a problem with your reqeust: ", error);
    setLoading(false);
})
}, [])

if(loading){
    return <CircularProgress/>
}

return (
    <Grid container spacing={2}>
      {data.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Card sx={{ maxWidth: 345 }}>
            {item.parable && (
              <CardMedia
                component="img"
                height="140"
                image={item.image} 
                alt={item.title}
              />
            )}
            <CardContent>
              <Typography gutterBottom variant="h5">
                {item.reference}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.verseText || "No verses available"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DataCard;