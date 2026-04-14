import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { logout } from '../slices/authSlice';
import { useGetTasksQuery, useDeleteTaskMutation, apiSlice } from '../slices/apiSlice';
import TaskModal from './TaskModal';

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Filter, Sort, and Pagination states
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Pass filtering, sorting, and pagination to API
  const { data, isLoading, error, refetch } = useGetTasksQuery({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    sortBy: sortBy || undefined,
    pageNumber: currentPage,
  });

  const [deleteTask] = useDeleteTaskMutation();

  // Socket.io for Real-time Updates
  useEffect(() => {
    // In production, we need to point to the deployed backend URL
    const socket = io(import.meta.env.VITE_API_BASE_URL || window.location.origin); 

    socket.on('task:created', () => {
      // Invalidate tags or refetch to get fresh data
      dispatch(apiSlice.util.invalidateTags(['Task']));
    });

    socket.on('task:updated', () => {
      dispatch(apiSlice.util.invalidateTags(['Task']));
    });

    socket.on('task:deleted', () => {
      dispatch(apiSlice.util.invalidateTags(['Task']));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleCreateTask = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId).unwrap();
      } catch (err) {
        console.error('Failed to delete the task:', err);
        alert(err?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold text-blue-600">Task Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Welcome, {userInfo?.email || 'User'}</span>
          {userInfo?.role === 'admin' && (
             <button 
                onClick={() => navigate('/admin')} 
                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded hover:bg-indigo-200 font-medium"
              >
               Admin Panel
             </button>
          )}
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
            <h2 className="text-xl font-bold">Your Tasks</h2>
            <button 
              onClick={handleCreateTask}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium"
            >
              + New Task
            </button>
        </div>

        {/* Filters and Sorting Bar */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
           <div className="flex items-center gap-2">
             <label className="text-sm font-medium text-gray-700">Status:</label>
             <select 
               className="border-gray-300 rounded shadow-sm p-1 text-sm border"
               value={statusFilter}
               onChange={handleFilterChange(setStatusFilter)}
             >
               <option value="">All</option>
               <option value="Todo">Todo</option>
               <option value="In Progress">In Progress</option>
               <option value="Done">Done</option>
             </select>
           </div>
           
           <div className="flex items-center gap-2">
             <label className="text-sm font-medium text-gray-700">Priority:</label>
             <select 
               className="border-gray-300 rounded shadow-sm p-1 text-sm border"
               value={priorityFilter}
               onChange={handleFilterChange(setPriorityFilter)}
             >
               <option value="">All</option>
               <option value="Low">Low</option>
               <option value="Medium">Medium</option>
               <option value="High">High</option>
             </select>
           </div>

           <div className="flex items-center gap-2 ml-auto">
             <label className="text-sm font-medium text-gray-700">Sort By:</label>
             <select 
               className="border-gray-300 rounded shadow-sm p-1 text-sm border"
               value={sortBy}
               onChange={handleFilterChange(setSortBy)}
             >
               <option value="">Recently Created</option>
               <option value="dueDate">Due Date</option>
             </select>
           </div>
        </div>

        {/* Task List */}
        {isLoading ? (
          <p className="text-center py-4">Loading tasks...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-4">Failed to load tasks</p>
        ) : (
          <>
            <div className="space-y-4">
              {data?.tasks?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tasks found. Click '+ New Task' to create one!</p>
              ) : (
                data?.tasks?.map(task => (
                  <div key={task._id} className="p-4 border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow bg-white">
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                        <p className="text-gray-600 text-sm mt-1 mb-3">{task.description}</p>
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className={`px-2 py-1 rounded-full font-medium 
                            ${task.status === 'Done' ? 'bg-green-100 text-green-800' : 
                              task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'}`}
                          >
                            {task.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full font-medium
                             ${task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                               task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 
                               'bg-blue-100 text-blue-800'}`}
                          >
                            {task.priority} Priority
                          </span>
                          {task.dueDate && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.assignedTo && (
                            <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full font-medium">
                              Assigned: {task.assignedTo.email || task.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 flex flex-col items-end justify-start min-w-[120px]">
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleEditTask(task)} 
                             className="text-indigo-600 hover:text-indigo-800 text-sm font-medium border border-indigo-200 rounded px-2 py-1"
                           >
                             Edit
                           </button>
                           <button 
                             onClick={() => handleDeleteTask(task._id)}
                             className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 rounded px-2 py-1"
                           >
                             Delete
                           </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Attached Documents - Downloads via API Endpoint */}
                    {task.attachedDocuments && task.attachedDocuments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {task.attachedDocuments.map((doc, index) => (
                            <a
                              key={index}
                              href={`/api/tasks/${task._id}/documents/${index}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                              </svg>
                              {doc.filename}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {data?.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &larr; Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {data?.page} of {data?.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, data?.pages))}
                  disabled={currentPage >= data?.pages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        existingTask={taskToEdit} 
      />
    </div>
  );
};

export default Dashboard;
