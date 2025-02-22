import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import logo from "../../assets/congregation.png"; // Adjust path based on your structure

export default function ButtonAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      
        <Toolbar>
    
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, backgroundColor: "#52796f" }} >
          <Box
            component="img"
            src={logo} // Replace with your actual image
            alt="Header Logo"
            sx={{
              height: 60, // Adjust height
              width: "auto",
              borderRadius: "5px", 
              // Optional: round edges
            }}
          />
          </Typography>
          
        </Toolbar>
      
    </Box>
  );
}
