import React, { useState, useEffect } from 'react';
import { getAllSubmissions, exportSurveyData } from '../services/api';
import * as XLSX from 'xlsx';
import { FaDatabase, FaDownload, FaSearch } from 'react-icons/fa';

const AdminPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getAllSubmissions();
      setSubmissions(data);
      setError(null);
    } catch (err) {
      setError('Failed to load submissions. Please try again.');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (empId) => {
    try {
      const data = await exportSurveyData(empId);
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Survey Responses');
      XLSX.writeFile(wb, `survey_responses_${empId}.xlsx`);
    } catch (err) {
      alert(`Failed to export data for employee ${empId}: ${err.message}`);
    }
  };

  const handleExportAll = async () => {
    try {
      // Create a workbook with all submissions
      const wb = XLSX.utils.book_new();
      
      // For each submission, get the data and add as a sheet
      for (const submission of submissions) {
        try {
          const data = await exportSurveyData(submission.emp_id);
          const ws = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, ws, `Emp_${submission.emp_id}`);
        } catch (err) {
          console.error(`Error exporting data for ${submission.emp_id}:`, err);
          // Continue with other submissions
        }
      }
      
      // Save the workbook
      XLSX.writeFile(wb, `all_survey_responses_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      alert(`Failed to export all data: ${err.message}`);
    }
  };

  const filteredSubmissions = submissions.filter(submission => 
    submission.emp_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="admin-container">
      <div className='container-header'>
        <FaDatabase className='header-icon' />
        <h1 className='data-header'>Admin Dashboard</h1>
      </div>
      <p className='data-subheader'>Manage and View Data Quality Index Submissions</p>
      
      <div className="admin-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Employee ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button className="export-all-button" onClick={handleExportAll}>
          <FaDownload /> Export All Submissions
        </button>
        
        <button className="refresh-button" onClick={fetchSubmissions}>
          Refresh Data
        </button>
      </div>
      
      {loading ? (
        <p className="loading">Loading submissions...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="submissions-container">
          <h2>All Submissions ({filteredSubmissions.length})</h2>
          
          {filteredSubmissions.length === 0 ? (
            <p>No submissions found.</p>
          ) : (
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Submission Date</th>
                  <th>Answers Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.emp_id}</td>
                    <td>{formatDate(submission.submission_date)}</td>
                    <td>{submission.answer_count}</td>
                    <td>
                      <button 
                        onClick={() => handleExport(submission.emp_id)}
                        className="export-button"
                      >
                        <FaDownload /> Export
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;