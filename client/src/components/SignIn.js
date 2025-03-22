//SignIn.js

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Modal, Backdrop, Fade, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useAuth } from './AuthProvider';

const SignIn = ({ open, handleClose, handleOpenSignUp }) => {
  const { login } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
  
      console.log('Login API response:', response.data);
  
      if (response.status === 200) {
        console.log('Token received:', response.data.token); 
  
        localStorage.setItem('isAdmin', response.data.isAdmin.toString());
        localStorage.setItem('userId', response.data.userId);
  
        login(response.data.token); 
        alert('Login successful');
        setEmail('');
        setPassword('');
        setError('');
        handleClose();
      }
    } catch (error) {
      console.error('Error in handleSignIn:', error);
  
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleSignUpClick = () => {
    handleClose();
    handleOpenSignUp();
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
            display: 'flex',
            width: '800px',
            height: '500px',
            backgroundColor: '#F5F5DC',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Box
            sx={{
              width: '40%',
              backgroundColor: '#4D7C2E',
              color: '#FFF',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 16, left: 16, color: '#FFF' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ textAlign: 'center' }}>
            Sign in to AgriConnect
          </Typography>
          </Box>
          <Box
            sx={{
              width: '60%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
            }}
          >
            {error && (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <TextField
              fullWidth
              margin="normal"
              label="Email / Phone Number"
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
            <Typography
              variant="body2"
              sx={{ mt: 1, mb: 2, cursor: 'pointer', color: '#3f51b5' }}
              onClick={() => alert('Forgot Password?')}
            >
              Forgot Password?
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={handleSignIn}
              sx={{ mt: 1, mb: 1 }}
            >
              SIGN IN
            </Button>
            <Typography variant="body2" sx={{ mb: 1 }}>
              I do not have an account.{' '}
              <span onClick={handleSignUpClick} style={{ color: '#3f51b5', cursor: 'pointer' }}>SIGN UP</span>
            </Typography>
            <Typography variant="body2">OR</Typography>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => alert('Sign in with Google')}
              sx={{ mt: 1 }}
            >
              Sign in with Google
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SignIn;