import React, { useState, useEffect } from 'react';
import SubComponent from './SubComponent';

const Component = ({ 
  componentTitle, 
  jsonFile, 
  answers, 
  setAnswers, 
  subheading, 
  setSubheading,
  missingQuestionRef
}) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const module = await import(`../assets/${jsonFile}.json`);
        setQuestions(module.questions || []);
        setError(null);
      } catch (err) {
        console.error(`Error loading questions for ${jsonFile}:`, err);
        setError(`Failed to load questions for ${jsonFile}`);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (jsonFile) {
      loadQuestions();
    }
  }, [jsonFile]);

  const handleAnswerChange = (questionId, value) => {
    const key = `${componentTitle}_${jsonFile}_${questionId}`;
    setAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReset = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      Object.keys(newAnswers).forEach(key => {
        if (key.startsWith(`${componentTitle}_${jsonFile}_`)) {
          delete newAnswers[key];
        }
      });
      return newAnswers;
    });
  };

  if (loading) {
    return <div className="loading-spinner">Loading questions...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="questions-container">
      {questions.map((question) => {
        const isHighlighted = missingQuestionRef && 
                             missingQuestionRef.config === componentTitle &&
                             missingQuestionRef.subcategory === jsonFile &&
                             missingQuestionRef.questionId === question.id;
        
        return (
          <SubComponent
            key={question.id}
            question={question}
            componentTitle={componentTitle}
            jsonFile={jsonFile}
            answers={answers}
            handleAnswerChange={handleAnswerChange}
            isHighlighted={isHighlighted}
          />
        );
      })}
      <button onClick={handleReset} className="reset-button">Reset Answers</button>
    </div>
  );
};

export default Component;