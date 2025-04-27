//SignUp.js

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
  
  // Form validation states
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i);

  const handleBirthDateChange = (field, value) => {
    setBirthDate((prev) => ({ ...prev, [field]: value }));
    
    // Clear birthDate error when user makes changes
    if (errors.birthDate) {
      setErrors(prev => ({ ...prev, birthDate: '' }));
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, containing at least one uppercase, one lowercase, one number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
  };

  // Improved function to capitalize all parts of a name
  const capitalizeNames = (string) => {
    if (!string) return '';
    
    // Split the string by spaces and capitalize each part
    return string
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    const MAX_NAME_LENGTH = 30;

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    } else if (firstName.length > MAX_NAME_LENGTH) {
      newErrors.firstName = `First name cannot exceed ${MAX_NAME_LENGTH} characters`;
      isValid = false;
    }
    
    // Middle name validation (optional but limit it too)
    if (middleName.length > MAX_NAME_LENGTH) {
      newErrors.middleName = `Middle name cannot exceed ${MAX_NAME_LENGTH} characters`;
      isValid = false;
    }
    
    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    } else if (lastName.length > MAX_NAME_LENGTH) {
      newErrors.lastName = `Last name cannot exceed ${MAX_NAME_LENGTH} characters`;
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
      isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Birth date validation
    if (!birthDate.day || !birthDate.month || !birthDate.year) {
      newErrors.birthDate = 'Complete birth date is required';
      isValid = false;
    } else {
      // Check if date is valid
      const dateObj = new Date(`${birthDate.year}-${birthDate.month}-${birthDate.day}`);
      if (dateObj.toString() === 'Invalid Date' || dateObj.getMonth() + 1 !== parseInt(birthDate.month)) {
        newErrors.birthDate = 'Invalid date';
        isValid = false;
      }
      
      // Check if user is at least 18 years old
      const today = new Date();
      const age = today.getFullYear() - dateObj.getFullYear();
      const monthDiff = today.getMonth() - dateObj.getMonth();
      if (age < 18 || (age === 18 && monthDiff < 0) || 
          (age === 18 && monthDiff === 0 && today.getDate() < dateObj.getDate())) {
        newErrors.birthDate = 'You must be at least 18 years old';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    // Reset general error
    setError('');
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      const formattedBirthDate = new Date(`${birthDate.year}-${birthDate.month}-${birthDate.day}`);
      const API_BASE_URL = "https://backend-service-538405936687.us-central1.run.app";

      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        first_name: firstName.trim(),
        middle_name: middleName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
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

  // Handle input change and clear errors
  const handleInputChange = (field, value) => {
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Update the corresponding state with capitalization for name fields
    switch (field) {
      case 'firstName':
        setFirstName(capitalizeNames(value));
        break;
      case 'middleName':
        setMiddleName(capitalizeNames(value));
        break;
      case 'lastName':
        setLastName(capitalizeNames(value));
        break;
      case 'email':
        setEmail(value.toLowerCase());
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      default:
        break;
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
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Middle Name"
            variant="outlined"
            value={middleName}
            onChange={(e) => handleInputChange('middleName', e.target.value)}
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Last Name"
            variant="outlined"
            value={lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            required
          />
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Confirm Password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            required
          />
          <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>Birth Date:</Typography>
          {errors.birthDate && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              {errors.birthDate}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Select
              value={birthDate.day}
              onChange={(e) => handleBirthDateChange('day', e.target.value)}
              displayEmpty
              fullWidth
              error={!!errors.birthDate}
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
              error={!!errors.birthDate}
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
              error={!!errors.birthDate}
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