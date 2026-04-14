import React, { useState, useEffect } from 'react';
import { useCreateTaskMutation, useUpdateTaskMutation, useGetUsersQuery } from '../slices/apiSlice';

const TaskModal = ({ isOpen, onClose, existingTask = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [documents, setDocuments] = useState(null);

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title || '');
      setDescription(existingTask.description || '');
      setStatus(existingTask.status || 'Todo');
      setPriority(existingTask.priority || 'Medium');
      setDueDate(existingTask.dueDate ? existingTask.dueDate.substring(0, 10) : '');
      setAssignedTo(existingTask.assignedTo?._id || existingTask.assignedTo || '');
      setDocuments(null);
    } else {
      resetForm();
    }
  }, [existingTask, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('Todo');
    setPriority('Medium');
    setDueDate('');
    setAssignedTo('');
    setDocuments(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 3) {
      alert('You can only upload up to 3 documents.');
      e.target.value = '';
      return;
    }
    setDocuments(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('priority', priority);
    if (dueDate) formData.append('dueDate', dueDate);
    if (assignedTo) formData.append('assignedTo', assignedTo);
    
    if (documents) {
      for (let i = 0; i < documents.length; i++) {
        formData.append('documents', documents[i]);
      }
    }

    try {
      if (existingTask) {
        await updateTask({ id: existingTask._id, data: formData }).unwrap();
      } else {
        await createTask(formData).unwrap();
      }
      onClose();
      resetForm();
    } catch (err) {
      console.error('Failed to save task:', err);
      alert(err?.data?.message || 'Failed to save task');
    }
  };

  if (!isOpen) return null;

  const isLoading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">{existingTask ? 'Edit Task' : 'Create Task'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Assign To (Optional)</label>
             <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">-- Select User --</option>
                {!usersLoading && usersData?.map(user => (
                   <option key={user._id} value={user._id}>{user.email}</option>
                ))}
              </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Attach Documents (Up to 3, PDF preferred)</label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 p-2 border border-gray-300 rounded"
              onChange={handleFileChange}
            />
            {documents && documents.length > 0 && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    <p className="font-semibold mb-1">Selected to upload:</p>
                    <ul className="list-disc list-inside">
                        {Array.from(documents).map((file, i) => (
                            <li key={i}>{file.name}</li>
                        ))}
                    </ul>
                </div>
            )}
            {existingTask?.attachedDocuments && existingTask.attachedDocuments.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                    Currently has {existingTask.attachedDocuments.length} document(s) attached.
                </p>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t">
            <button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
