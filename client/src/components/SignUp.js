import React, { useState } from 'react';
import { Box, Button, TextField, Typography, IconButton, Modal, Fade, Select, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const SignUp = ({ open, handleClose, handleOpenSignIn }) => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' }); 
  const [error, setError] = useState('');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i);

  const handleBirthDateChange = (field, value) => {
    setBirthDate((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    try {
      const formattedBirthDate = new Date(`${birthDate.year}-${birthDate.month}-${birthDate.day}`);
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email,
        password,
        confirm_password: confirmPassword,
        birthDate: formattedBirthDate, 
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
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold', color: '#2E7D32' }}>
            Sign up to AgriConnect
          </Typography>
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
          <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>Birth Date:</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Select
              value={birthDate.day}
              onChange={(e) => handleBirthDateChange('day', e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>Day</MenuItem>
              {days.map((day) => (
                <MenuItem key={day} value={day}>{day}</MenuItem>
              ))}
            </Select>
            <Select
              value={birthDate.month}
              onChange={(e) => handleBirthDateChange('month', e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>Month</MenuItem>
              {months.map((month, index) => (
                <MenuItem key={index} value={index + 1}>{month}</MenuItem>
              ))}
            </Select>
            <Select
              value={birthDate.year}
              onChange={(e) => handleBirthDateChange('year', e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>Year</MenuItem>
              {years.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </Box>
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