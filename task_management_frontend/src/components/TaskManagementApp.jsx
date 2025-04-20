// TaskManagementApp.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Assignment } from '@mui/icons-material';
import { getTasks, createTask, updateTask, deleteTask, getUsers } from '../services/api';

function TaskManagementApp() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium', 
    status: 'To-Do', 
    deadline: '', 
    assignedTo: '' 
  });
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Fetch tasks and users when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksResponse = await getTasks();
        setTasks(tasksResponse.data);
        setFilteredTasks(tasksResponse.data);
        
        const usersResponse = await getUsers();
        setUsers(usersResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load tasks. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Apply filters when tasks, filterStatus or filterPriority changes
  useEffect(() => {
    let result = [...tasks];
    
    if (filterStatus !== 'All') {
      result = result.filter(task => task.status === filterStatus);
    }
    
    if (filterPriority !== 'All') {
      result = result.filter(task => task.priority === filterPriority);
    }
    
    setFilteredTasks(result);
  }, [tasks, filterStatus, filterPriority]);

  // Handle dialog open/close
  const handleOpenDialog = (task = null) => {
    if (task) {
      // Format date for the input field
      const formattedTask = {
        ...task,
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        assignedTo: task.assignedTo ? task.assignedTo._id : ''
      };
      setCurrentTask(formattedTask);
      setIsEditing(true);
    } else {
      setCurrentTask({ 
        title: '', 
        description: '', 
        priority: 'medium', 
        status: 'To-Do', 
        deadline: '', 
        assignedTo: '' 
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle task creation and editing
  const handleSaveTask = async () => {
    try {
      if (isEditing) {
        // Update existing task
        const response = await updateTask(currentTask._id, currentTask);
        setTasks(tasks.map(task => task._id === currentTask._id ? response.data : task));
        setNotification({
          open: true,
          message: 'Task updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new task
        const response = await createTask(currentTask);
        setTasks([...tasks, response.data]);
        setNotification({
          open: true,
          message: 'Task created successfully!',
          severity: 'success'
        });
      }
      setOpenDialog(false);
    } catch (err) {
      console.error('Error saving task:', err);
      setNotification({
        open: true,
        message: `Failed to ${isEditing ? 'update' : 'create'} task. Please try again.`,
        severity: 'error'
      });
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
      setNotification({
        open: true,
        message: 'Task deleted successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      setNotification({
        open: true,
        message: 'Failed to delete task. Please try again.',
        severity: 'error'
      });
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTask({
      ...currentTask,
      [name]: value
    });
  };

  // Handle notification close
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // Get color based on priority
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Assignment sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI-Powered Task Management System
          </Typography>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Filters and Actions */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="To-Do">To-Do</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="On-Hold">On-Hold</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                label="Priority"
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Task
          </Button>
        </Box>
        
        {/* Loading and Error States */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && !loading && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        
        {/* Task List */}
        {!loading && !error && (
          <Grid container spacing={3}>
            {filteredTasks.map(task => (
              <Grid item xs={12} md={6} lg={4} key={task._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {task.title}
                      </Typography>
                      <Chip 
                        label={task.priority} 
                        color={getPriorityColor(task.priority)} 
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {task.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip label={task.status} color="primary" size="small" />
                      <Typography variant="body2">
                        {task.deadline ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}` : 'No deadline'}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Assigned to: {task.assignedTo ? task.assignedTo.username : 'Unassigned'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleOpenDialog(task)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteTask(task._id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
            {filteredTasks.length === 0 && !loading && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No tasks found with the selected filters.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
      
      {/* Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Task Title"
              name="title"
              value={currentTask.title}
              onChange={handleInputChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={currentTask.description}
              onChange={handleInputChange}
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={currentTask.priority}
                    label="Priority"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={currentTask.status}
                    label="Status"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="To-Do">To-Do</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="On-Hold">On-Hold</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Deadline"
                  name="deadline"
                  type="date"
                  value={currentTask.deadline}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    name="assignedTo"
                    value={currentTask.assignedTo}
                    label="Assigned To"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {users.map(user => (
                      <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TaskManagementApp;