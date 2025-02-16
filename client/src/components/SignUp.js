import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Modal, Backdrop, Fade } from '@mui/material';
import axios from 'axios';

const SignUp = ({ open, handleClose }) => {
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
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" component="h2" sx={{ mb: 2, textAlign: 'center' }}>
            Sign up to AgriConnect
          </Typography>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            variant="outlined"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Middle Name"
            variant="outlined"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            variant="outlined"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, mb: 1 }}
            onClick={handleSignUp}
          >
            SIGN UP
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SignUp;
