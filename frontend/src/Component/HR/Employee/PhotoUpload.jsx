import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, MenuItem, Button, Avatar, Grid,
  Card, CardContent, CircularProgress, Divider, IconButton
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';

const API = import.meta.env.VITE_API_URL || '';

export default function PhotoUpload() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch employee list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API}/api/employees`, { withCredentials: true });
        const list = Array.isArray(res.data) ? res.data : res.data.rows || [];
        setEmployees(list);
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  // Load employee photo when selected
  useEffect(() => {
    if (!selectedEmpId) {
      setSelectedEmp(null);
      setCurrentPhoto(null);
      setPhotoPreview(null);
      setPhotoFile(null);
      return;
    }

    const emp = employees.find(e => String(e.empid) === String(selectedEmpId));
    setSelectedEmp(emp || null);
    setPhotoPreview(null);
    setPhotoFile(null);

    const fetchPhoto = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/employees/${selectedEmpId}/photo`, {
          withCredentials: true,
        });
        if (res.data && res.data.photo) {
          setCurrentPhoto(`data:${res.data.mimeType || 'image/jpeg'};base64,${res.data.photo}`);
        } else {
          setCurrentPhoto(null);
        }
      } catch {
        setCurrentPhoto(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [selectedEmpId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Photo size must be less than 5MB', 'error');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!selectedEmpId) {
      showToast('Please select an employee', 'error');
      return;
    }
    if (!photoFile) {
      showToast('Please select a photo to upload', 'error');
      return;
    }

    setSaving(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1]; // Remove data:...;base64, prefix
        try {
          await axios.put(
            `${API}/api/employees/${selectedEmpId}/photo`,
            {
              photo: base64,
              fileName: photoFile.name,
              mimeType: photoFile.type,
            },
            { withCredentials: true }
          );
          showToast('Photo uploaded successfully!', 'success');
          setCurrentPhoto(URL.createObjectURL(photoFile));
          setPhotoPreview(null);
          setPhotoFile(null);
        } catch (err) {
          console.error('Upload error:', err);
          showToast('Failed to upload photo', 'error');
        } finally {
          setSaving(false);
        }
      };
      reader.readAsDataURL(photoFile);
    } catch (err) {
      setSaving(false);
      showToast('Failed to process photo', 'error');
    }
  };

  const handleRemovePhoto = async () => {
    if (!selectedEmpId) return;
    setSaving(true);
    try {
      await axios.delete(`${API}/api/employees/${selectedEmpId}/photo`, { withCredentials: true });
      setCurrentPhoto(null);
      setPhotoPreview(null);
      setPhotoFile(null);
      showToast('Photo removed successfully', 'success');
    } catch (err) {
      showToast('Failed to remove photo', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(emp.empid).includes(term) ||
      (emp.ename || '').toLowerCase().includes(term)
    );
  });

  const displayPhoto = photoPreview || currentPhoto;

  return (
    <Box sx={{ m: 2 }}>
      <Card>
        <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoCameraIcon />
          <Typography variant="h6">Employee Photo Upload</Typography>
        </Box>
        <CardContent>
          <Grid container spacing={3}>
            {/* Employee Selection */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Select Employee
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  label="Search by ID or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                  }}
                />

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Employee"
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                >
                  <MenuItem value="">-- Select Employee --</MenuItem>
                  {filteredEmployees.map((emp) => (
                    <MenuItem key={emp.empid} value={emp.empid}>
                      {emp.empid} - {emp.ename}
                    </MenuItem>
                  ))}
                </TextField>

                {selectedEmp && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2"><strong>Name:</strong> {selectedEmp.ename}</Typography>
                    <Typography variant="body2"><strong>Department:</strong> {selectedEmp.deptname || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Status:</strong> {selectedEmp.status || 'Active'}</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Photo Section */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Employee Photo
                </Typography>

                {loading ? (
                  <Box sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>Loading photo...</Typography>
                  </Box>
                ) : (
                  <>
                    <Avatar
                      src={displayPhoto}
                      sx={{
                        width: 200,
                        height: 200,
                        mx: 'auto',
                        my: 2,
                        boxShadow: 3,
                        border: '4px solid #e0e0e0',
                        fontSize: 64,
                      }}
                      variant="rounded"
                    >
                      {!displayPhoto && <PersonIcon sx={{ fontSize: 80 }} />}
                    </Avatar>

                    {selectedEmpId ? (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="photo-upload-input"
                            onChange={handlePhotoChange}
                          />
                          <label htmlFor="photo-upload-input">
                            <Button
                              component="span"
                              variant="outlined"
                              startIcon={<PhotoCameraIcon />}
                            >
                              {currentPhoto ? 'Change Photo' : 'Select Photo'}
                            </Button>
                          </label>

                          {currentPhoto && (
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={handleRemovePhoto}
                              disabled={saving}
                            >
                              Remove
                            </Button>
                          )}
                        </Box>

                        {photoFile && (
                          <>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              Selected: {photoFile.name} ({(photoFile.size / 1024).toFixed(1)} KB)
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                              onClick={handleSave}
                              disabled={saving}
                            >
                              {saving ? 'Uploading...' : 'Upload Photo'}
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Select an employee to manage their photo
                      </Typography>
                    )}
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
