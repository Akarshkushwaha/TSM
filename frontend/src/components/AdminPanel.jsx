import React from 'react';
import { useGetUsersQuery, useDeleteUserMutation } from '../slices/apiSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? All their tasks may be affected.")) {
      try {
        await deleteUser(id).unwrap();
      } catch (err) {
        alert(err?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-800"
            >
                &larr; Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-indigo-600">Admin Control Panel</h1>
        </div>
      </div>

      <div className="bg-white rounded shadow text-left overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Registered Users</h2>
        </div>
        
        {isLoading ? (
          <p className="p-4">Loading users...</p>
        ) : error ? (
          <p className="p-4 text-red-500">Failed to load users</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                          {user.role}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {userInfo._id !== user._id && (
                        <button 
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded"
                        >
                            Delete
                        </button>
                    )}
                    {userInfo._id === user._id && (
                         <span className="text-gray-400 italic text-xs">Current User</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
