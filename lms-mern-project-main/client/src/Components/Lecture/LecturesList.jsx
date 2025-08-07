import React, { useState, useEffect } from 'react';
import { FaBook, FaChevronDown, FaChevronRight, FaExpand, FaCompress } from 'react-icons/fa';
import LectureItem from './LectureItem';

export default function LecturesList({ 
  lectures, 
  isPaid, 
  hasAccess, 
  userProgress, 
  onLectureClick,
  hasLessonAccess
}) {
  const [expandedUnits, setExpandedUnits] = useState(new Set());

  const isLectureCompleted = (lectureId) => {
    return userProgress[lectureId]?.isCompleted;
  };

  const getLectureProgress = (lectureId) => {
    return userProgress[lectureId]?.progress || 0;
  };

  const toggleUnit = (unitTitle) => {
    const newExpandedUnits = new Set(expandedUnits);
    if (newExpandedUnits.has(unitTitle)) {
      newExpandedUnits.delete(unitTitle);
    } else {
      newExpandedUnits.add(unitTitle);
    }
    setExpandedUnits(newExpandedUnits);
  };

  const toggleAllUnits = () => {
    const unitTitles = Object.keys(unitGroups);
    if (expandedUnits.size === unitTitles.length) {
      // All units are expanded, collapse all
      setExpandedUnits(new Set());
    } else {
      // Expand all units
      setExpandedUnits(new Set(unitTitles));
    }
  };

  // Get unit groups for the toggle all functionality
  const getUnitGroups = () => {
    const unitGroups = {};
    const standaloneLectures = [];
    
    lectures.forEach((lecture) => {
      if (lecture.unitTitle) {
        if (!unitGroups[lecture.unitTitle]) {
          unitGroups[lecture.unitTitle] = [];
        }
        unitGroups[lecture.unitTitle].push(lecture);
      } else {
        standaloneLectures.push(lecture);
      }
    });
    
    return { unitGroups, standaloneLectures };
  };

  const { unitGroups, standaloneLectures } = getUnitGroups();

  // Expand all units by default when component loads
  useEffect(() => {
    const unitTitles = Object.keys(unitGroups);
    if (unitTitles.length > 0 && expandedUnits.size === 0) {
      setExpandedUnits(new Set(unitTitles));
    }
  }, [unitGroups, expandedUnits.size]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              دروسالدورة
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {lectures.length} محاضرة متاحة
            </p>
          </div>
          {Object.keys(unitGroups).length > 0 && (
            <button
              onClick={toggleAllUnits}
              className="flex items-center space-x-2 space-x-reverse px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              {expandedUnits.size === Object.keys(unitGroups).length ? (
                <>
                  <FaCompress size={14} />
                  <span>طي الكل</span>
                </>
              ) : (
                <>
                  <FaExpand size={14} />
                  <span>توسيع الكل</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {lectures.length > 0 ? (
          (() => {
            const renderItems = [];
            
            // Add standalone lectures first
            standaloneLectures.forEach((lecture, index) => {
              renderItems.push(
                                  <LectureItem
                    key={lecture._id || `standalone-${index}`}
                    lecture={lecture}
                    isPaid={isPaid}
                    hasAccess={hasAccess}
                    hasLessonAccess={hasLessonAccess}
                    isCompleted={isLectureCompleted(lecture._id)}
                    progress={getLectureProgress(lecture._id)}
                    onLectureClick={onLectureClick}
                  />
              );
            });
            
            // Add unit groups with collapsible functionality
            Object.entries(unitGroups).forEach(([unitTitle, unitLectures]) => {
              const isExpanded = expandedUnits.has(unitTitle);
              
              renderItems.push(
                <div key={`unit-${unitTitle}`} className="border-b border-gray-200 dark:border-gray-700">
                  {/* Unit Header - Clickable to expand/collapse */}
                  <div 
                    className="bg-purple-50 dark:bg-purple-900/20 px-6 py-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    onClick={() => toggleUnit(unitTitle)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        {isExpanded ? (
                          <FaChevronDown className="text-purple-600 dark:text-purple-400" />
                        ) : (
                          <FaChevronRight className="text-purple-600 dark:text-purple-400" />
                        )}
                        <FaBook className="text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                          {unitTitle}
                        </h4>
                        <span className="text-sm text-purple-600 dark:text-purple-400">
                          ({unitLectures.length} محاضرة)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Unit Lessons - Collapsible */}
                  {isExpanded && (
                    <div className="bg-gray-50 dark:bg-gray-900/50">
                      {unitLectures.map((lecture, index) => (
                        <div key={lecture._id || `unit-${unitTitle}-${index}`} className="border-l-4 border-purple-200 dark:border-purple-700">
                                                     <LectureItem
                             lecture={lecture}
                             isPaid={isPaid}
                             hasAccess={hasAccess}
                             hasLessonAccess={hasLessonAccess}
                             isCompleted={isLectureCompleted(lecture._id)}
                             progress={getLectureProgress(lecture._id)}
                             onLectureClick={onLectureClick}
                           />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            });
            
            return renderItems;
          })()
        ) : (
          <div className="p-6 text-center">
            <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              لا توجد دروسمتاحة لهذه الدورة
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 