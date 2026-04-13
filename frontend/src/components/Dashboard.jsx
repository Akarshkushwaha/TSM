import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../slices/authSlice';
import { useGetTasksQuery } from '../slices/apiSlice';

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetTasksQuery();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold text-blue-600">Task Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Welcome, {userInfo?.email || 'User'}</span>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold">Your Tasks</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">+ New Task</button>
        </div>
        {isLoading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load tasks</p>
        ) : (
          <div className="space-y-4">
            {data?.tasks?.length === 0 ? (
              <p className="text-gray-500">No tasks found. Click '+ New Task' to create one!</p>
            ) : (
              data?.tasks?.map(task => (
                <div key={task._id} className="p-4 border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                    <div className="mt-3 text-sm text-gray-500 flex gap-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">{task.status}</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">{task.priority} Priority</span>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
                    <button className="bg-green-100 text-green-700 px-4 py-1 rounded hover:bg-green-200 font-medium">Edit Document</button>
                    {task.attachedDocuments && task.attachedDocuments.length > 0 && (
                        <span className="text-xs text-gray-400">attachments: {task.attachedDocuments.length}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
