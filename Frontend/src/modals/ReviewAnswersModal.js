import React from 'react';

const ReviewAnswersModal = ({ isOpen, onClose, onConfirm, questionsData }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-review" onClick={onClose}>
      <div className="modal-content-review" onClick={(e) => e.stopPropagation()}>
        <h2>Review Your Answers</h2>
        <div className="answers-list">
          {/* {questionsData.length > 0 ? ( */}
            <ul>
              {questionsData.map((item, idx) => (
                <li key={idx}>
                <strong>{item.question}</strong>
                <div className="radio-review-group">
                  {item.options.map((opt, i) => (
                    <label key={i} className="radio-label-disabled">
                      <input
                        type="radio"
                        name={`review-${idx}`}
                        value={opt}
                        checked={item.answer === opt}
                        disabled
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </li>              
              ))}
            </ul>
          {/* ) : (
            <p>No answers to show.</p>
          )} */}
        </div>
        <div className="modal-actions">
          <button className="ok-button-modal" onClick={onConfirm}><strong>Ok</strong></button>
          <button className="cancel-button-modal" onClick={onClose}><strong>Cancel</strong></button>
        </div>
      </div>
    </div>
  );
};

export default ReviewAnswersModal;
