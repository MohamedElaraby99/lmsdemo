import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCourses } from '../../Redux/Slices/CourseSlice';
import { getAllStages } from '../../Redux/Slices/StageSlice';
import { getAllSubjects } from '../../Redux/Slices/SubjectSlice';
import Layout from '../../Layout/Layout';
import { FaChevronDown, FaChevronRight, FaEdit, FaBookOpen, FaSearch, FaBook, FaLayerGroup } from 'react-icons/fa';

const CourseContentManager = () => {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector(state => state.course);
  const { stages } = useSelector(state => state.stage);
  const { subjects } = useSelector(state => state.subject);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    dispatch(getAllCourses());
    dispatch(getAllStages());
    dispatch(getAllSubjects());
  }, [dispatch]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesStage = !stageFilter || (course.stage && course.stage._id === stageFilter);
    const matchesSubject = !subjectFilter || (course.subject && course.subject._id === subjectFilter);
    return matchesSearch && matchesStage && matchesSubject;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
        {/* Sidebar: Course List */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col">
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="بحث عن دورة..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={stageFilter}
                onChange={e => setStageFilter(e.target.value)}
                className="w-1/2 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">كل المراحل</option>
                {stages?.map(stage => (
                  <option key={stage._id} value={stage._id}>{stage.name}</option>
                ))}
              </select>
              <select
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                className="w-1/2 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">كل المواد</option>
                {subjects?.map(subject => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-10">جاري التحميل...</div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center text-gray-400 py-10">لا توجد دورات</div>
            ) : (
              filteredCourses.map(course => (
                <div
                  key={course._id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${selectedCourse && selectedCourse._id === course._id ? 'bg-blue-100 dark:bg-blue-800/30 border-blue-400' : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                  onClick={() => {
                    setSelectedCourse(course);
                    setExpandedUnit(null);
                  }}
                >
                  <FaBook className="text-blue-500 text-lg" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white truncate">{course.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{course.stage?.name}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Main Content: Units & Lessons */}
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6 text-right text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <FaLayerGroup />
            إدارة محتوى الدورات
          </h1>
          {!selectedCourse ? (
            <div className="text-center text-gray-400 py-20 text-lg">اختر دورة من القائمة لعرض وحداتها ودروسها</div>
          ) : (
            <div className="space-y-6">
              {selectedCourse.units?.length === 0 && selectedCourse.directLessons?.length === 0 && (
                <div className="text-center text-gray-400 py-10">لا توجد وحدات أو دروس مباشرة في هذه الدورة</div>
              )}
              {/* Units Accordion */}
              {selectedCourse.units?.map(unit => (
                <div key={unit._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedUnit(expandedUnit === unit._id ? null : unit._id)}
                  >
                    <div className="flex items-center gap-2">
                      <FaBookOpen className="text-blue-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">{unit.title}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">{unit.price ? `سعر الوحدة: ${unit.price}` : 'بدون سعر'}</span>
                    </div>
                    <FaChevronDown className={`transition-transform ${expandedUnit === unit._id ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedUnit === unit._id && (
                    <div className="mt-4 space-y-2">
                      {unit.lessons?.length === 0 ? (
                        <div className="text-gray-400 text-sm">لا توجد دروس في هذه الوحدة</div>
                      ) : (
                        unit.lessons.map(lesson => (
                          <div key={lesson._id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-2">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">{lesson.title}</span>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{lesson.price ? `سعر الدرس: ${lesson.price}` : 'بدون سعر'}</span>
                            </div>
                            <button
                              className="text-blue-600 hover:text-blue-800 p-1 flex items-center gap-1"
                              onClick={() => setSelectedLesson({ ...lesson, courseId: selectedCourse._id, unitId: unit._id })}
                            >
                              <FaEdit className="text-sm" />
                              <span className="text-xs">إدارة المحتوى</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
              {/* Direct Lessons */}
              {selectedCourse.directLessons?.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl shadow p-4">
                  <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                    <FaBookOpen className="text-purple-500" />
                    دروس مباشرة
                  </div>
                  {selectedCourse.directLessons.map(lesson => (
                    <div key={lesson._id} className="flex items-center justify-between bg-white dark:bg-gray-600 rounded p-2 mb-2">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{lesson.title}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{lesson.price ? `سعر الدرس: ${lesson.price}` : 'بدون سعر'}</span>
                      </div>
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 flex items-center gap-1"
                        onClick={() => setSelectedLesson({ ...lesson, courseId: selectedCourse._id, unitId: null })}
                      >
                        <FaEdit className="text-sm" />
                        <span className="text-xs">إدارة المحتوى</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Modern Modal for lesson content */}
          {selectedLesson && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة محتوى الدرس</h2>
                  <button onClick={() => setSelectedLesson(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl">×</button>
                </div>
                <div className="space-y-4">
                  <div><span className="font-semibold">العنوان:</span> {selectedLesson.title}</div>
                  <div><span className="font-semibold">الوصف:</span> {selectedLesson.description}</div>
                  {/* Here you can add forms/fields for videos, PDFs, exams, trainings */}
                  <div className="text-gray-500 dark:text-gray-400 text-sm">(هنا يمكنك إضافة الفيديوهات، ملفات PDF، الامتحانات، التدريبات...)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseContentManager;
