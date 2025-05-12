import React, { useState, useEffect, useRef } from 'react';
import { FaDatabase } from "react-icons/fa";
import EmployeeIdModal from '../modals/EmployeeIdModal';
import Configs from './Configs';
import * as XLSX from 'xlsx';
import Component from '../components/Component';
import ReviewAnswersModal from '../modals/ReviewAnswersModal';
import { submitSurvey, exportSurveyData } from '../services/api';

const HomePage = () => {
  const [openComponent, setOpenComponent] = useState(null);
  const [openSubcategory, setOpenSubcategory] = useState({});
  const [empId, setEmpId] = useState('');
  const [answers, setAnswers] = useState({});
  const [subheading, setSubheading] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState([]);
  const [missingQuestionRef, setMissingQuestionRef] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleComponentClick = (componentId) => {
    setOpenComponent(prevOpen => prevOpen === componentId ? null : componentId);
    if (openComponent === componentId) {
      setOpenSubcategory({});
    }
  };

  const handleSubcategoryClick = (componentId, subcategoryTitle) => {
    setOpenSubcategory(prev => ({
      ...prev,
      [componentId]: prev[componentId] === subcategoryTitle ? null : subcategoryTitle
    }));

    if (!openSubcategory[componentId]) {
      import(`../assets/${subcategoryTitle}.json`)
        .then(module => {
          const questions = module.questions;
          setSubheading(subcategoryTitle);
        })
        .catch(err => {
          console.error("Error loading the JSON file:", err);
        });
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    const missingAnswers = [];
    const reviewAnswers = [];
    let firstMissingFound = false;
    let firstMissingConfig = null;
    let firstMissingSubcategory = null;
    let firstMissingQuestionId = null;

    for (const config of Configs) {
      for (const subcategory of config.subcategories) {
        const jsonFile = subcategory.title;

        try {
          const module = await import(`../assets/${jsonFile}.json`);
          const questions = module.questions;

          questions.forEach((question, index) => {
            const key = `${config.title}_${subcategory.title}_${question.id}`;
            const answer = answers[key];

            if (!answer || answer.toString().trim() === '') {
              missingAnswers.push({
                category: config.title,
                subcategory: subcategory.title,
                question: question.question,
                questionId: question.id,
                index: index
              });

              if (!firstMissingFound) {
                firstMissingFound = true;
                firstMissingConfig = config.id;
                firstMissingSubcategory = subcategory.title;
                firstMissingQuestionId = question.id;
              }
            }

            reviewAnswers.push({
              category: config.title,
              subcategory: subcategory.title,
              question: question.question,
              answer: answer,
              options: question.options
            });
          });
        } catch (err) {
          console.error(`Error loading JSON file: ${jsonFile}`, err);
        }
      }
    }

    if (missingAnswers.length > 0) {
      // Reset all open states
      setOpenComponent(firstMissingConfig);
      
      // Create a new object for openSubcategory with only the first missing subcategory open
      const newOpenSubcategory = {};
      newOpenSubcategory[firstMissingConfig] = firstMissingSubcategory;
      setOpenSubcategory(newOpenSubcategory);
      
      // Set the reference to highlight the missing question
      setMissingQuestionRef({
        config: firstMissingConfig,
        subcategory: firstMissingSubcategory,
        questionId: firstMissingQuestionId
      });
      
      // Scroll to the component after a short delay to allow the DOM to update
      setTimeout(() => {
        const element = document.getElementById(`question_${firstMissingConfig}_${firstMissingSubcategory}_${firstMissingQuestionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-missing');
          
          // Remove the highlight after 3 seconds
          setTimeout(() => {
            element.classList.remove('highlight-missing');
            setMissingQuestionRef(null);
          }, 3000);
        }
        else {
          setMissingQuestionRef(null);
        }
      }, 300);
      
      return;
    }

    setReviewData(reviewAnswers);
    setShowReviewModal(true);
  };

  const handleReviewConfirm = () => {
    setShowReviewModal(false);
    setIsModalOpen(true);
  };

  const handleEmployeeIdSubmit = async (userEmpId) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Submit data to the backend API
      await submitSurvey(userEmpId, answers);
      
      setEmpId(userEmpId);
      
      // Show success message
      alert('Submission successful!');
      
      // Export data to Excel
      try {
        const exportData = await exportSurveyData(userEmpId);
        
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Survey Responses');
        XLSX.writeFile(wb, `survey_responses_${userEmpId}.xlsx`);
      } catch (exportError) {
        console.error('Error exporting data:', exportError);
        // Still consider submission successful even if export fails
      }
      
      // Reset form after successful submission
      setAnswers({});
      
    } catch (error) {
      console.error('Error submitting data:', error);
      setSubmitError(error.message || 'Failed to submit survey. Please try again.');
      alert(`Error: ${error.message || 'Failed to submit survey. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="home-container">
      <div>
        <div className='container-header'>
          <FaDatabase className='header-icon' />
          <h1 className='data-header'>Data Quality Index</h1>
        </div>
        <p className='data-subheader'>Comprehensive Assessment of Data Quality for Improved Decision-Making</p>
      </div>

      {Configs.map(config => (
        <div key={config.id} className={`component ${openComponent === config.id ? 'open' : ''}`}>
          <div className="component-header" onClick={() => handleComponentClick(config.id)}>
            {config.icon}
            {config.title} <span>{openComponent === config.id ? '\u25BC' : '\u25B6'}</span>
          </div>
          {openComponent === config.id && (
            <div className="component-subcategories active">
              {config.subcategories.map(subcategory => (
                <div key={subcategory.title} className={`subcategory ${openSubcategory[config.id] === subcategory.title ? 'open' : ''}`}>
                  <div className="subcategory-header" onClick={() => handleSubcategoryClick(config.id, subcategory.title)}>
                    {subcategory.title}
                    <span>{openSubcategory[config.id] === subcategory.title ? '\u25BC' : '\u25B6'}</span>
                  </div>
                  {openSubcategory[config.id] === subcategory.title && (
                    <div className="subcategory-content active">
                      <Component
                        componentTitle={config.title}
                        jsonFile={subcategory.title}
                        answers={answers}
                        setAnswers={setAnswers}
                        subheading={subheading}
                        setSubheading={setSubheading}
                        missingQuestionRef={missingQuestionRef}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      <button 
        className="submit-button" 
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        <strong>{isSubmitting ? 'Submitting...' : 'Submit'}</strong>
      </button>

      {submitError && <p className="error-message">{submitError}</p>}

      <EmployeeIdModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleEmployeeIdSubmit}
        isSubmitting={isSubmitting}
      />

      <ReviewAnswersModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={handleReviewConfirm}
        questionsData={reviewData}
      />
    </div>
  );
};

export default HomePage;