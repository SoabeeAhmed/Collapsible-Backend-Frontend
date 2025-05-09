import React, { useState } from 'react';
const EmployeeIdModal = ({ isOpen, onClose, onSubmit}) => {
  const [empId, setEmpId] = useState('');
  
  const empIdRegex = /^[A][0-9]{4}$/;

const handleSubmit = () => {
  if (empIdRegex.test(empId)) {
    onSubmit(empId);
    onClose(); 
    setEmpId('');
  } else {
    
    if (empId.length !== 5) {
      if(empId.length === 0){
        alert('Please enter Employee ID');
      }
      else{
        alert('Employee ID must be exactly 5 characters long.');
      }
    } 
    else if (!empId.startsWith('A')) {
      alert('The first character must be "A".');
    } else if (!/^[0-9]{4}$/.test(empId.slice(1))) {
      alert('The last 4 characters must be digits.');
    } else {
      alert('Please enter an Employee ID that starts with "A" followed by 4 digits (e.g., A1234).');
    }

  }
  
};



  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Enter Your 5-Character Employee ID</h2>
        <input
          type="text"
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
          maxLength="5"
          className="emp-id-input"
          placeholder="Eg:A1234"
        />
        <div className='modal-button'>
          <button className="ok-button" onClick={handleSubmit}><strong>Ok</strong></button>
          <button className="cancel-button" onClick={onClose}><strong>Cancel</strong></button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeIdModal;
