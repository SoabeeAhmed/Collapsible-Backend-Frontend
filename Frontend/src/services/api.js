// API service for handling backend communication
const API_URL = 'http://localhost:8000'; // Change to your backend URL in production

export const submitSurvey = async (empId, answers) => {
  try {
    const response = await fetch(`${API_URL}/submissions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emp_id: empId,
        answers: answers
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to submit survey');
    }
    
    return data;
  } catch (error) {
    console.error('Error submitting survey:', error);
    throw error;
  }
};

export const fetchSubmission = async (empId) => {
  try {
    const response = await fetch(`${API_URL}/submissions/${empId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No submission found
      }
      throw new Error('Failed to fetch submission');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching submission:', error);
    throw error;
  }
};

export const exportSurveyData = async (empId) => {
  try {
    const response = await fetch(`${API_URL}/export/${empId}`);
    
    if (!response.ok) {
      throw new Error('Failed to export survey data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error exporting survey data:', error);
    throw error;
  }
};

export const getAllSubmissions = async () => {
  try {
    const response = await fetch(`${API_URL}/submissions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    throw error;
  }
};