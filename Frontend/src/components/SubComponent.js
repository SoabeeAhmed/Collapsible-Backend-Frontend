import React from 'react';

const SubComponent = ({ 
  question, 
  componentTitle, 
  jsonFile, 
  answers, 
  handleAnswerChange, 
  isHighlighted 
}) => {
  const answerKey = `${componentTitle}_${jsonFile}_${question.id}`;
  
  return (
    <div 
      id={`question_${componentTitle}_${jsonFile}_${question.id}`}
      className={`question-item ${isHighlighted ? 'highlight-missing' : ''}`}
    >
      <div className="question-text">{question.question}</div>
      
      <div className="radio-options">
        {question.options.map((option, index) => (
          <label key={index} className="radio-label">
            <input
              type="radio"
              name={answerKey}
              value={option}
              checked={answers[answerKey] === option}
              onChange={() => handleAnswerChange(question.id, option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

export default SubComponent;