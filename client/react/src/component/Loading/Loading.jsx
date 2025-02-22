44
import React, { useState, useEffect } from "react";
import { Typography, CircularProgress, Box } from "@mui/material";

const LoadingScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish(); // Hide animation after 3 seconds
    }, 4000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
   <>
      <Typography variant="h4" sx={{ opacity: 0.8 }}>
        Loading Parables...
      </Typography>
      <CircularProgress sx={{ marginTop: 2 }} color="primary" />
    </>
  );
};

export default LoadingScreen;
