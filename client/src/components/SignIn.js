import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Modal, Backdrop, Fade } from '@mui/material';
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
        password
      });

      if (response.data.token) {
        console.log('Token received:', response.data.token); 
        login(response.data.token); 
        alert('Login successful');
        handleClose();
      }
    } catch (error) {
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
            Sign in to AgriConnect
          </Typography>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2, textAlign: 'center' }}>
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
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, mb: 1 }}
            onClick={handleSignIn}
          >
            SIGN IN
          </Button>
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', cursor: 'pointer', color: 'primary.main' }}
            onClick={() => alert('Forgot Password')}
          >
            Forgot Password?
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            sx={{ mt: 2, mb: 1 }}
            onClick={handleSignUpClick}
          >
            SIGN UP
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            sx={{ mt: 2, mb: 1 }}
            onClick={() => alert('Sign in with Google')}
          >
            Sign in with Google
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SignIn;
