import React, { useState } from 'react';
import { useGetUsersQuery, useDeleteUserMutation, useCreateUserMutation, useUpdateUserMutation } from '../slices/apiSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useGetUsersQuery({ pageNumber: currentPage });
  const [deleteUser] = useDeleteUserMutation();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('user');

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? All their tasks may be affected.")) {
      try {
        await deleteUser(id).unwrap();
      } catch (err) {
        alert(err?.data?.message || 'Failed to delete user');
      }
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormEmail('');
    setFormPassword('');
    setFormRole('user');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload = { email: formEmail, role: formRole };
        if (formPassword) payload.password = formPassword;
        await updateUser({ id: editingUser._id, data: payload }).unwrap();
      } else {
        if (!formPassword) {
          alert('Password is required for new users.');
          return;
        }
        await createUser({ email: formEmail, password: formPassword, role: formRole }).unwrap();
      }
      setShowModal(false);
    } catch (err) {
      alert(err?.data?.message || 'Failed to save user');
    }
  };

  const users = data?.users || data || [];
  const totalPages = data?.pages || 1;

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
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium"
        >
          + Create User
        </button>
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
          <>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{user._id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        {userInfo._id !== user._id ? (
                          <button 
                              onClick={() => handleDelete(user._id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded"
                          >
                              Delete
                          </button>
                        ) : (
                          <span className="text-gray-400 italic text-xs px-3 py-1">You</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 p-4 border-t">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &larr; Previous
                </button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">{editingUser ? 'Edit User' : 'Create User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password {editingUser ? '(leave blank to keep current)' : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
