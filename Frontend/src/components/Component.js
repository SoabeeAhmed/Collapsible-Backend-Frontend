import React, { useState, useEffect } from 'react';
import SubComponent from './SubComponent';

const Component = ({ componentTitle, jsonFile, answers, setAnswers, subheading, setSubheading, missingQuestionRef }) => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questionsModule = await import(`../assets/${jsonFile}.json`);
        
        if (questionsModule.default && Array.isArray(questionsModule.default.questions)) {
          setQuestions(questionsModule.default.questions);
          setSubheading(questionsModule.default.subheading || '');  // Set subheading dynamically
        } else {
          console.error('Invalid JSON structure: "questions" array missing');
        }
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };

    loadQuestions();
  }, [jsonFile, setSubheading]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [`${componentTitle}_${subheading}_${questionId}`]: answer // Store answer using the composite key
    }));
  };

  const handleReset = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      Object.keys(newAnswers).forEach(key => {
        if (key.startsWith(`${componentTitle}_${subheading}_`)) {
          delete newAnswers[key];  // Reset answers for this component and subheading
        }
      });
      return newAnswers;
    });
  };

  return (
    <div className="component-questions">
      {questions.length > 0 ? (
        <>
          {questions.map((question, index) => (
            <SubComponent
              key={index}
              question={question}
              questionId={index}
              onAnswerChange={handleAnswerChange}
              selectedAnswer={answers[`${componentTitle}_${subheading}_${index}`] || ""}  // Access answer with composite key
              isMissing={missingQuestionRef && 
                missingQuestionRef.subcategory === jsonFile && 
                missingQuestionRef.questionId === index}
              componentId={`question_${missingQuestionRef?.config || ''}_${jsonFile}_${index}`}
            />
          ))}
          <button onClick={handleReset} className="reset-button">Reset All</button>
        </>
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
};

export default Component;