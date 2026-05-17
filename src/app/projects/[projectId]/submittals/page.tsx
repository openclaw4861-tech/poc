'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface SubmittalItem {
  id: number;
  checklistId: number;
  specSection: string;
  specSubsection: string | null;
  requirementType: string | null;
  description: string;
  details: string | null;
  status: string;
  userNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SubmittalChecklist {
  id: number;
  projectId: string;
  pdfFilePath: string;
  pdfUploadedAt: string;
  extractedAt: string | null;
  items: SubmittalItem[];
}

interface Project {
  id: string;
  name: string;
}

const STATUS_OPTIONS = ['pending', 'submitted', 'approved', 'rejected', 'not_required'];

export default function SubmittalsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [checklists, setChecklists] = useState<SubmittalChecklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<SubmittalChecklist | null>(null);
  const [items, setItems] = useState<SubmittalItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Fetch projects and checklists on mount
  useEffect(() => {
    fetchProjects();
    fetchChecklists();
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    // TODO: Replace with actual projects API
    // For now, use mock data
    setProjects([
      { id: 'proj-1', name: 'Downtown Office Tower' },
      { id: 'proj-2', name: 'Westside Medical Center' },
      { id: projectId, name: 'Current Project' },
    ]);
  };

  const fetchChecklists = async () => {
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/submittals`);
      const data = await res.json();
      
      if (data.success) {
        setChecklists(data.data);
        if (data.data.length > 0 && !selectedChecklist) {
          setSelectedChecklist(data.data[0]);
          setItems(data.data[0].items || []);
        }
      }
    } catch (err) {
      console.error('Error fetching checklists:', err);
      setError('Failed to load checklists');
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file || !file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/projects/${selectedProjectId}/submittals/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Refresh checklists
      await fetchChecklists();
      setSelectedChecklist(checklists.find(c => c.id === data.data.id) || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [selectedProjectId, checklists]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDeleteChecklist = async () => {
    if (!selectedChecklist) return;

    if (!confirm(`Delete "${selectedChecklist.pdfFilePath.split('/').pop()}" and all extracted items? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/submittals/${selectedChecklist.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Delete failed');
      }

      // Refresh checklists and clear selection
      await fetchChecklists();
      setSelectedChecklist(null);
      setItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExtract = async () => {
    if (!selectedChecklist) return;

    setIsExtracting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/submittals/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistId: selectedChecklist.id }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Extraction failed');
      }

      // Refresh items
      await fetchChecklists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleItemChange = (itemId: number, field: keyof SubmittalItem, value: any) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleAddRow = () => {
    const newItem: SubmittalItem = {
      id: Date.now(), // Temporary ID
      checklistId: selectedChecklist?.id || 0,
      specSection: '1.5',
      specSubsection: '',
      requirementType: '',
      description: '',
      details: '',
      status: 'pending',
      userNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleDeleteRow = async (itemId: number) => {
    if (itemId < 0) {
      // New item not yet saved, just remove from local state
      setItems(prev => prev.filter(item => item.id !== itemId));
      return;
    }

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/submittals/${itemId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch (err) {
      setError('Delete failed');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Save all changed items
      const savePromises = items.map(async (item) => {
        // Skip items that were never saved (negative temp IDs)
        if (item.id < 0) {
          // Create new item
          const { checklistId, ...itemData } = item;
          const res = await fetch(`/api/projects/${selectedProjectId}/submittals/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              checklistId: selectedChecklist?.id,
              ...itemData,
            }),
          });
          return res.json();
        }

        // Update existing item
        const res = await fetch(`/api/projects/${selectedProjectId}/submittals/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        return res.json();
      });

      await Promise.all(savePromises);
      
      // Refresh to get updated data
      await fetchChecklists();
    } catch (err) {
      setError('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChecklistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const checklistId = parseInt(e.target.value);
    const checklist = checklists.find(c => c.id === checklistId) || null;
    setSelectedChecklist(checklist);
    setItems(checklist?.items || []);
  };

  // Sort items by spec_section, then spec_subsection
  const sortedItems = [...items].sort((a, b) => {
    const sectionCompare = a.specSection.localeCompare(b.specSection, undefined, { numeric: true });
    if (sectionCompare !== 0) return sectionCompare;
    if (!a.specSubsection || !b.specSubsection) return 0;
    return a.specSubsection.localeCompare(b.specSubsection, undefined, { numeric: true });
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Submittal Tracker</h1>

        {/* Project Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedChecklist(null);
              setItems([]);
            }}
            className="block w-full max-w-md rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Upload Zone */}
        <div
          className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <div className="text-gray-600">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a5.166 5.166 0 00-7.328 0L16 28m8-8l-4-4m0 0L8 8m4 4l4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm">
                {isUploading ? 'Uploading...' : 'Drag & drop PDF spec here, or click to upload'}
              </p>
            </div>
          </label>
        </div>

        {/* Checklist Selector */}
        {checklists.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Uploaded Spec File
            </label>
            <select
              value={selectedChecklist?.id || ''}
              onChange={handleChecklistChange}
              className="block w-full max-w-md rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {checklists.map(checklist => (
                <option key={checklist.id} value={checklist.id}>
                  {checklist.pdfFilePath.split('/').pop()} - {new Date(checklist.pdfUploadedAt).toLocaleDateString()}
                </option>
              ))}
            </select>

            {/* File Info & Extract Button */}
            {selectedChecklist && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      File: {selectedChecklist.pdfFilePath.split('/').pop()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(selectedChecklist.pdfUploadedAt).toLocaleString()}
                      {selectedChecklist.extractedAt && ` | Extracted: ${new Date(selectedChecklist.extractedAt).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteChecklist}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      onClick={handleExtract}
                      disabled={isExtracting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExtracting ? 'Extracting...' : 'Extract Submittals'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submittals Grid */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Submittal Items ({items.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleAddRow}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  + Add Row
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save All'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Sec</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Sub</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Details</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Notes</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.specSection}
                          onChange={(e) => handleItemChange(item.id, 'specSection', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.specSubsection || ''}
                          onChange={(e) => handleItemChange(item.id, 'specSubsection', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="-"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.requirementType || ''}
                          onChange={(e) => handleItemChange(item.id, 'requirementType', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Type"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <textarea
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          rows={2}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <textarea
                          value={item.details || ''}
                          onChange={(e) => handleItemChange(item.id, 'details', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          rows={2}
                          placeholder="Additional details..."
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.status}
                          onChange={(e) => handleItemChange(item.id, 'status', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <textarea
                          value={item.userNotes || ''}
                          onChange={(e) => handleItemChange(item.id, 'userNotes', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          rows={2}
                          placeholder="Your notes..."
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleDeleteRow(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {items.length === 0 && selectedChecklist && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              No submittal items yet. Click "Extract Submittals" to automatically parse the PDF,
              or add items manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
