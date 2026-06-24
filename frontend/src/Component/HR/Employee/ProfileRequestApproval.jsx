import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import { getErrorMessage } from '../../../utils/errorUtils';

const API = import.meta.env.VITE_API_URL || '';

export default function ProfileRequestApproval() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/api/employees/profile-requests`, { withCredentials: true });
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      showToast(getErrorMessage(err, 'Failed to load requests'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessing(true);
    try {
      await axios.put(`${API}/api/employees/profile-requests/${id}/approve`, {}, { withCredentials: true });
      showToast('Request approved successfully', 'success');
      fetchRequests();
    } catch (err) {
      console.error('Error approving request:', err);
      showToast(getErrorMessage(err, 'Failed to approve request'), 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectRemarks.trim()) {
      showToast('Please provide rejection remarks', 'warning');
      return;
    }
    setProcessing(true);
    try {
      await axios.put(`${API}/api/employees/profile-requests/${selectedRequest?.id}/reject`,
        { hr_remarks: rejectRemarks },
        { withCredentials: true }
      );
      showToast('Request rejected', 'success');
      setRejectOpen(false);
      setSelectedRequest(null);
      setRejectRemarks('');
      fetchRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      showToast(getErrorMessage(err, 'Failed to reject request'), 'error');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (request) => {
    setSelectedRequest(request);
    setRejectOpen(true);
  };

  const renderDiff = (oldVal, newVal, label) => {
    if (oldVal === newVal || (!oldVal && !newVal)) return null;
    return (
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2">
          <span style={{ color: '#d32f2f', textDecoration: 'line-through' }}>{oldVal || 'N/A'}</span>
          {' → '}
          <span style={{ color: '#388e3c', fontWeight: 'bold' }}>{newVal || 'N/A'}</span>
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ m: 2 }}>
      <Card>
        <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2 }}>
          <Typography variant="h6">Profile Update Requests</Typography>
          <Typography variant="body2">Review and process employee address/phone change requests</Typography>
        </Box>
        <CardContent>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : requests.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No pending requests
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Employee</strong></TableCell>
                    <TableCell><strong>Department</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Request Date</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell>
                        <Typography variant="body2">{req.employeeName}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {req.empid}</Typography>
                      </TableCell>
                      <TableCell>{req.department}</TableCell>
                      <TableCell>
                        <Chip
                          label={req.request_type === 'both' ? 'Address & Phone' : req.request_type === 'address' ? 'Address' : 'Phone'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{new Date(req.created).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => { setSelectedRequest(req); setDetailsOpen(true); }} color="info">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleApprove(req.id)} color="success">
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => openRejectDialog(req)} color="error">
                          <CancelIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Request Details
          <IconButton onClick={() => setDetailsOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Employee: {selectedRequest.employeeName} ({selectedRequest.empid})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Department: {selectedRequest.department}
              </Typography>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Field Changes</Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                    <TableRow>
                      <TableCell><strong>Field</strong></TableCell>
                      <TableCell><strong>Old Value</strong></TableCell>
                      <TableCell><strong>New Value</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { label: 'Comm. Address', old: selectedRequest.old_comm_address, new: selectedRequest.new_comm_address },
                      { label: 'Comm. Phone', old: selectedRequest.old_comm_phone, new: selectedRequest.new_comm_phone },
                      { label: 'Comm. Mobile', old: selectedRequest.old_comm_mobile, new: selectedRequest.new_comm_mobile },
                      { label: 'Perm. Address', old: selectedRequest.old_perm_address, new: selectedRequest.new_perm_address },
                      { label: 'Perm. Phone', old: selectedRequest.old_perm_phone, new: selectedRequest.new_perm_phone },
                      { label: 'Perm. Mobile', old: selectedRequest.old_perm_mobile, new: selectedRequest.new_perm_mobile },
                    ].filter(f => f.old !== f.new).map((field, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ fontWeight: 'medium' }}>{field.label}</TableCell>
                        <TableCell sx={{ color: '#d32f2f', fontStyle: 'italic', textDecoration: 'line-through' }}>{field.old || '(Empty)'}</TableCell>
                        <TableCell sx={{ color: '#3182ce', fontWeight: 'bold' }}>{field.new || '(Empty)'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained" color="success" onClick={() => { handleApprove(selectedRequest.id); setDetailsOpen(false); }}>
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide reason for rejecting this request:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            placeholder="Enter rejection remarks..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={processing}>
            {processing ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
