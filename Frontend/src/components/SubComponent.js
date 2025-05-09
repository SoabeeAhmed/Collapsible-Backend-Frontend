import React from 'react';

const SubComponent = ({ question, questionId, onAnswerChange, selectedAnswer, isMissing, componentId }) => {
  return (
    <div 
      id={componentId || `question_${questionId}`}
      className={`subcomponent ${isMissing ? 'highlight-missing' : ''}`}
    >
      <p className="subcomponent-question">
        {question.question}
        <span className="required-asterisk"> *</span>
      </p>
      <div className="radio-group">
        {question.options && question.options.map((option, index) => (
          <label key={index}>
            <input
              type="radio"
              name={`question-${question.subheading}-${question.id}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={() => onAnswerChange(questionId, option)}
              required={index === 0}
            />
            {option}
          </label>
        ))}
        
        {question.type === 'text' && (
          <textarea
            value={selectedAnswer || ''}
            onChange={(e) => onAnswerChange(questionId, e.target.value)}
            placeholder="Enter your answer here..."
            rows={3}
            className="text-input"
            required
          />
        )}
        
        {question.type === 'number' && (
          <input
            type="number"
            value={selectedAnswer || ''}
            onChange={(e) => onAnswerChange(questionId, e.target.value)}
            placeholder="Enter a number..."
            className="number-input"
            required
          />
        )}
      </div>
    </div>
  );
};

export default SubComponent;