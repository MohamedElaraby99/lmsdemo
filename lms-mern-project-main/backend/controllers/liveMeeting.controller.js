import LiveMeeting from '../models/liveMeeting.model.js';
import User from '../models/user.model.js';
import Instructor from '../models/instructor.model.js';
import Stage from '../models/stage.model.js';
import Subject from '../models/subject.model.js';
import AppError from '../utils/error.utils.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Create a new live meeting
// @route   POST /api/v1/live-meetings
// @access  Admin
export const createLiveMeeting = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    googleMeetLink,
    scheduledDate,
    duration,
    instructor,
    stage,
    subject,
    attendees,
    maxAttendees,
    isRecorded,
    tags
  } = req.body;

  // Validate required fields
  if (!title || !description || !googleMeetLink || !scheduledDate || !duration || !instructor || !stage || !subject) {
    return next(new AppError('جميع الحقول المطلوبة يجب ملؤها', 400));
  }

  // Validate scheduled date is in the future
  const scheduledDateTime = new Date(scheduledDate);
  if (scheduledDateTime <= new Date()) {
    return next(new AppError('تاريخ الاجتماع يجب أن يكون في المستقبل', 400));
  }

  // Validate instructor exists
  const instructorExists = await Instructor.findById(instructor);
  if (!instructorExists) {
    return next(new AppError('المحاضر غير موجود', 404));
  }

  // Validate stage exists
  const stageExists = await Stage.findById(stage);
  if (!stageExists) {
    return next(new AppError('المرحلة غير موجودة', 404));
  }

  // Validate subject exists
  const subjectExists = await Subject.findById(subject);
  if (!subjectExists) {
    return next(new AppError('المادة غير موجودة', 404));
  }

  // Validate attendees if provided
  let validatedAttendees = [];
  if (attendees && attendees.length > 0) {
    for (const attendeeId of attendees) {
      const attendeeUser = await User.findById(attendeeId);
      if (attendeeUser) {
        validatedAttendees.push({ user: attendeeId });
      }
    }
  }

  // Create live meeting
  const liveMeeting = await LiveMeeting.create({
    title,
    description,
    googleMeetLink,
    scheduledDate: scheduledDateTime,
    duration,
    instructor,
    stage,
    subject,
    attendees: validatedAttendees,
    maxAttendees: maxAttendees || 100,
    isRecorded: isRecorded || false,
    tags: tags || [],
    createdBy: req.user._id || req.user.id
  });

  // Populate the created meeting
  await liveMeeting.populate([
    { path: 'instructor', select: 'name email' },
    { path: 'stage', select: 'name' },
    { path: 'subject', select: 'title' },
    { path: 'attendees.user', select: 'fullName email' },
    { path: 'createdBy', select: 'fullName email' }
  ]);

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الاجتماع المباشر بنجاح',
    liveMeeting
  });
});

// @desc    Get all live meetings (Admin)
// @route   GET /api/v1/live-meetings/admin
// @access  Admin
export const getAllLiveMeetings = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status, stage, subject, instructor, startDate, endDate } = req.query;

  // Build filter object
  let filter = {};

  if (status) {
    filter.status = status;
  }

  if (stage) {
    filter.stage = stage;
  }

  if (subject) {
    filter.subject = subject;
  }

  if (instructor) {
    filter.instructor = instructor;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.scheduledDate = {};
    if (startDate) {
      filter.scheduledDate.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.scheduledDate.$lte = new Date(endDate);
    }
  }

  const totalMeetings = await LiveMeeting.countDocuments(filter);
  const totalPages = Math.ceil(totalMeetings / limit);

  const liveMeetings = await LiveMeeting.find(filter)
    .populate('instructor', 'name email')
    .populate('stage', 'name')
    .populate('subject', 'title')
    .populate('attendees.user', 'fullName email')
    .populate('createdBy', 'fullName email')
    .sort({ scheduledDate: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    message: 'تم استرجاع الاجتماعات المباشرة بنجاح',
    liveMeetings,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalMeetings,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

// @desc    Get user's live meetings
// @route   GET /api/v1/live-meetings/my-meetings
// @access  User
export const getUserLiveMeetings = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const { status = 'scheduled', page = 1, limit = 10 } = req.query;

  // Build filter for user's meetings
  let filter = {
    'attendees.user': userId
  };

  if (status && status !== 'all') {
    filter.status = status;
  }

  // For upcoming meetings, also check date
  if (status === 'scheduled') {
    filter.scheduledDate = { $gte: new Date() };
  }

  const totalMeetings = await LiveMeeting.countDocuments(filter);
  const totalPages = Math.ceil(totalMeetings / limit);

  const liveMeetings = await LiveMeeting.find(filter)
    .populate('instructor', 'name email')
    .populate('stage', 'name')
    .populate('subject', 'title')
    .sort({ scheduledDate: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    message: 'تم استرجاع اجتماعاتك المباشرة بنجاح',
    liveMeetings,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalMeetings,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

// @desc    Get upcoming live meetings for user's stage
// @route   GET /api/v1/live-meetings/upcoming
// @access  User
export const getUpcomingLiveMeetings = asyncHandler(async (req, res, next) => {
  const userStage = req.user.stage;
  
  // If user doesn't have a stage, return empty array instead of error
  if (!userStage) {
    return res.status(200).json({
      success: true,
      message: 'لا توجد اجتماعات قادمة - لم يتم تحديد المرحلة الدراسية',
      upcomingMeetings: []
    });
  }

  const upcomingMeetings = await LiveMeeting.find({
    stage: userStage,
    status: 'scheduled',
    scheduledDate: { $gte: new Date() }
  })
    .populate('instructor', 'name email')
    .populate('stage', 'name')
    .populate('subject', 'title')
    .sort({ scheduledDate: 1 })
    .limit(10);

  res.status(200).json({
    success: true,
    message: 'تم استرجاع الاجتماعات القادمة بنجاح',
    upcomingMeetings
  });
});

// @desc    Get single live meeting
// @route   GET /api/v1/live-meetings/:id
// @access  User/Admin
export const getLiveMeeting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id || req.user.id;
  const userRole = req.user.role;

  const liveMeeting = await LiveMeeting.findById(id)
    .populate('instructor', 'name email')
    .populate('stage', 'name')
    .populate('subject', 'title')
    .populate('attendees.user', 'fullName email')
    .populate('createdBy', 'fullName email');

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  // Check if user has access to this meeting
  if (userRole !== 'ADMIN') {
    const isAttendee = liveMeeting.isUserAttendee(userId);
    const isInstructor = liveMeeting.instructor._id.toString() === userId.toString();
    
    if (!isAttendee && !isInstructor) {
      return next(new AppError('غير مصرح لك بالوصول لهذا الاجتماع', 403));
    }
  }

  res.status(200).json({
    success: true,
    message: 'تم استرجاع الاجتماع المباشر بنجاح',
    liveMeeting
  });
});

// @desc    Update live meeting
// @route   PUT /api/v1/live-meetings/:id
// @access  Admin
export const updateLiveMeeting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  const liveMeeting = await LiveMeeting.findById(id);

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  // Don't allow updating past meetings
  if (liveMeeting.status === 'completed') {
    return next(new AppError('لا يمكن تعديل اجتماع منتهي', 400));
  }

  // Validate scheduled date if provided
  if (updates.scheduledDate) {
    const scheduledDateTime = new Date(updates.scheduledDate);
    if (scheduledDateTime <= new Date()) {
      return next(new AppError('تاريخ الاجتماع يجب أن يكون في المستقبل', 400));
    }
  }

  // Update the meeting
  const updatedMeeting = await LiveMeeting.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  )
    .populate('instructor', 'name email')
    .populate('stage', 'name')
    .populate('subject', 'title')
    .populate('attendees.user', 'fullName email')
    .populate('createdBy', 'fullName email');

  res.status(200).json({
    success: true,
    message: 'تم تحديث الاجتماع المباشر بنجاح',
    liveMeeting: updatedMeeting
  });
});

// @desc    Delete live meeting
// @route   DELETE /api/v1/live-meetings/:id
// @access  Admin
export const deleteLiveMeeting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const liveMeeting = await LiveMeeting.findById(id);

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  await LiveMeeting.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'تم حذف الاجتماع المباشر بنجاح'
  });
});

// @desc    Join live meeting
// @route   POST /api/v1/live-meetings/:id/join
// @access  User
export const joinLiveMeeting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id || req.user.id;

  const liveMeeting = await LiveMeeting.findById(id);

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  // Check if meeting is live
  if (liveMeeting.status !== 'live') {
    return next(new AppError('الاجتماع غير مباشر حالياً', 400));
  }

  // Check if user is an attendee
  if (!liveMeeting.isUserAttendee(userId)) {
    return next(new AppError('غير مصرح لك بالانضمام لهذا الاجتماع', 403));
  }

  // Mark user as joined
  const attendeeIndex = liveMeeting.attendees.findIndex(
    attendee => attendee.user.toString() === userId.toString()
  );

  if (attendeeIndex > -1) {
    liveMeeting.attendees[attendeeIndex].hasJoined = true;
    liveMeeting.attendees[attendeeIndex].joinedAt = new Date();
    await liveMeeting.save();
  }

  res.status(200).json({
    success: true,
    message: 'تم الانضمام للاجتماع بنجاح',
    meetingLink: liveMeeting.googleMeetLink
  });
});

// @desc    Add attendees to live meeting
// @route   POST /api/v1/live-meetings/:id/attendees
// @access  Admin
export const addAttendees = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { attendees } = req.body;

  if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
    return next(new AppError('قائمة الحضور مطلوبة', 400));
  }

  const liveMeeting = await LiveMeeting.findById(id);

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  // Validate all attendees exist
  const validAttendees = [];
  for (const attendeeId of attendees) {
    const user = await User.findById(attendeeId);
    if (user && !liveMeeting.isUserAttendee(attendeeId)) {
      validAttendees.push({ user: attendeeId });
    }
  }

  // Check if adding attendees would exceed max limit
  if (liveMeeting.attendees.length + validAttendees.length > liveMeeting.maxAttendees) {
    return next(new AppError('عدد الحضور يتجاوز الحد الأقصى المسموح', 400));
  }

  // Add attendees
  liveMeeting.attendees.push(...validAttendees);
  await liveMeeting.save();

  await liveMeeting.populate('attendees.user', 'fullName email');

  res.status(200).json({
    success: true,
    message: 'تم إضافة الحضور بنجاح',
    attendeesAdded: validAttendees.length,
    totalAttendees: liveMeeting.attendees.length
  });
});

// @desc    Remove attendee from live meeting
// @route   DELETE /api/v1/live-meetings/:id/attendees/:attendeeId
// @access  Admin
export const removeAttendee = asyncHandler(async (req, res, next) => {
  const { id, attendeeId } = req.params;

  const liveMeeting = await LiveMeeting.findById(id);

  if (!liveMeeting) {
    return next(new AppError('الاجتماع المباشر غير موجود', 404));
  }

  const removed = liveMeeting.removeAttendee(attendeeId);

  if (!removed) {
    return next(new AppError('الحضور غير موجود في الاجتماع', 404));
  }

  await liveMeeting.save();

  res.status(200).json({
    success: true,
    message: 'تم إزالة الحضور بنجاح'
  });
});

// @desc    Get live meeting statistics
// @route   GET /api/v1/live-meetings/stats
// @access  Admin
export const getLiveMeetingStats = asyncHandler(async (req, res, next) => {
  const now = new Date();

  const stats = await LiveMeeting.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const upcomingCount = await LiveMeeting.countDocuments({
    status: 'scheduled',
    scheduledDate: { $gte: now }
  });

  const liveCount = await LiveMeeting.countDocuments({
    status: 'live'
  });

  const completedCount = await LiveMeeting.countDocuments({
    status: 'completed'
  });

  const totalCount = await LiveMeeting.countDocuments();

  // Total attendees across all meetings
  const attendeesStats = await LiveMeeting.aggregate([
    { $unwind: '$attendees' },
    {
      $group: {
        _id: null,
        totalAttendees: { $sum: 1 },
        joinedAttendees: {
          $sum: { $cond: ['$attendees.hasJoined', 1, 0] }
        }
      }
    }
  ]);

  const attendeesData = attendeesStats[0] || { totalAttendees: 0, joinedAttendees: 0 };

  res.status(200).json({
    success: true,
    message: 'تم استرجاع إحصائيات الاجتماعات المباشرة بنجاح',
    stats: {
      total: totalCount,
      upcoming: upcomingCount,
      live: liveCount,
      completed: completedCount,
      totalAttendees: attendeesData.totalAttendees,
      joinedAttendees: attendeesData.joinedAttendees,
      attendanceRate: attendeesData.totalAttendees > 0 
        ? ((attendeesData.joinedAttendees / attendeesData.totalAttendees) * 100).toFixed(2)
        : 0
    }
  });
});
