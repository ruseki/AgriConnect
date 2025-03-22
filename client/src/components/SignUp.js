//SignUp.js

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, IconButton, Card, Modal, Fade } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const SignUp = ({ open, handleClose, handleOpenSignIn }) => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email,
        password,
        confirm_password: confirmPassword
      });

      if (response.data.message) {
        alert(response.data.message);
        handleClose(); 
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: '480px',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: 3,
            backgroundColor: 'white'
          }}
        >
          <IconButton onClick={handleClose} sx={{ alignSelf: 'flex-start' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold', color: '#2E7D32' }}>Sign up to AgriConnect</Typography>
          {error && <Typography variant="body2" color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="First Name"
            variant="outlined"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Middle Name"
            variant="outlined"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Last Name"
            variant="outlined"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Confirm Password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={handleSignUp}
            sx={{ mt: 2 }}
          >
            SIGN UP
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SignUp;