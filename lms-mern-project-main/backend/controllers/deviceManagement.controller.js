import UserDevice from "../models/userDevice.model.js";
import userModel from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateDeviceFingerprint, parseDeviceInfo, generateDeviceName } from "../utils/deviceUtils.js";

// Constants
const MAX_DEVICES_PER_USER = 2;

/**
 * Register or update device for user
 */
export const registerDevice = asyncHandler(async (req, res, next) => {
    // Try both _id and id fields from the JWT token
    const userId = req.user._id || req.user.id;
    
    console.log('=== DEVICE REGISTRATION DEBUG ===');
    console.log('Full req.user object:', req.user);
    console.log('Extracted userId:', userId);
    console.log('Request body:', req.body);
    
    if (!userId) {
        return next(new ApiError(400, "User ID not found in request"));
    }
    
    const { 
        platform, 
        screenResolution, 
        timezone,
        additionalInfo = {} 
    } = req.body;

    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint(req, {
        platform,
        screenResolution,
        timezone,
        ...additionalInfo
    });

    // Parse device info from user agent
    const deviceInfo = parseDeviceInfo(req.get('User-Agent'));
    deviceInfo.platform = platform || deviceInfo.platform;
    deviceInfo.ip = req.ip || req.connection.remoteAddress;
    deviceInfo.screenResolution = screenResolution;
    deviceInfo.timezone = timezone;

    // Generate device name
    const deviceName = generateDeviceName(deviceInfo);

    try {
        // Check if device already exists for this user
        let existingDevice = await UserDevice.findOne({
            user: userId,
            deviceFingerprint
        });

        if (existingDevice) {
            // Update existing device
            existingDevice.lastActivity = new Date();
            existingDevice.loginCount += 1;
            existingDevice.deviceInfo = deviceInfo;
            existingDevice.deviceName = deviceName;
            existingDevice.isActive = true;
            await existingDevice.save();

            return res.status(200).json(
                new ApiResponse(200, {
                    device: existingDevice,
                    isNewDevice: false
                }, "Device updated successfully")
            );
        }

        // Check current device count for user
        const deviceCount = await UserDevice.countDocuments({
            user: userId,
            isActive: true
        });

        if (deviceCount >= MAX_DEVICES_PER_USER) {
            return next(new ApiError(
                403, 
                `تم الوصول للحد الأقصى من الأجهزة المسموحة (${MAX_DEVICES_PER_USER} أجهزة). يرجى التواصل مع الإدارة لإعادة تعيين الأجهزة.`,
                "DEVICE_LIMIT_EXCEEDED"
            ));
        }

        // Create new device
        const newDevice = await UserDevice.create({
            user: userId,
            deviceFingerprint,
            deviceInfo,
            deviceName,
            isActive: true
        });

        res.status(201).json(
            new ApiResponse(201, {
                device: newDevice,
                isNewDevice: true,
                remainingSlots: MAX_DEVICES_PER_USER - deviceCount - 1
            }, "Device registered successfully")
        );

    } catch (error) {
        console.error("Error in registerDevice:", error);
        return next(new ApiError(500, "Failed to register device"));
    }
});

/**
 * Check if current device is authorized
 */
export const checkDeviceAuthorization = asyncHandler(async (req, res, next) => {
    // Try both _id and id fields from the JWT token
    const userId = req.user._id || req.user.id;
    
    console.log('=== DEVICE AUTHORIZATION CHECK DEBUG ===');
    console.log('Full req.user object:', req.user);
    console.log('Extracted userId:', userId);
    console.log('Request body:', req.body);
    
    if (!userId) {
        return next(new ApiError(400, "User ID not found in request"));
    }
    
    const { 
        platform, 
        screenResolution, 
        timezone 
    } = req.body;

    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint(req, {
        platform,
        screenResolution,
        timezone
    });

    try {
        // Check if device exists and is active
        const device = await UserDevice.findOne({
            user: userId,
            deviceFingerprint,
            isActive: true
        });

        if (!device) {
            return next(new ApiError(
                403, 
                "هذا الجهاز غير مصرح له بالوصول. يرجى التواصل مع الإدارة.",
                "DEVICE_NOT_AUTHORIZED"
            ));
        }

        // Update last activity
        device.lastActivity = new Date();
        await device.save();

        res.status(200).json(
            new ApiResponse(200, {
                device,
                isAuthorized: true
            }, "Device authorized")
        );

    } catch (error) {
        console.error("Error in checkDeviceAuthorization:", error);
        return next(new ApiError(500, "Failed to check device authorization"));
    }
});

/**
 * Get user devices (Admin only)
 */
export const getUserDevices = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const devices = await UserDevice.find({ user: userId })
            .populate('user', 'fullName username email')
            .sort({ lastActivity: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalDevices = await UserDevice.countDocuments({ user: userId });
        const activeDevices = await UserDevice.countDocuments({ 
            user: userId, 
            isActive: true 
        });

        res.status(200).json(
            new ApiResponse(200, {
                devices,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalDevices / parseInt(limit)),
                    totalDevices,
                    activeDevices,
                    limit: parseInt(limit)
                }
            }, "User devices retrieved successfully")
        );

    } catch (error) {
        console.error("Error in getUserDevices:", error);
        return next(new ApiError(500, "Failed to retrieve user devices"));
    }
});

/**
 * Get all users with device information (Admin only)
 */
export const getAllUsersDevices = asyncHandler(async (req, res, next) => {
    const { 
        page = 1, 
        limit = 20, 
        search = '',
        deviceStatus = 'all' // all, overLimit, underLimit
    } = req.query;

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build aggregation pipeline
        const pipeline = [];

        // Match users based on search
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { fullName: { $regex: search, $options: 'i' } },
                        { username: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        // Add device information
        pipeline.push(
            {
                $lookup: {
                    from: 'userdevices',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'devices'
                }
            },
            {
                $addFields: {
                    totalDevices: { $size: '$devices' },
                    activeDevices: {
                        $size: {
                            $filter: {
                                input: '$devices',
                                cond: { $eq: ['$$this.isActive', true] }
                            }
                        }
                    },
                    lastDeviceActivity: {
                        $max: '$devices.lastActivity'
                    }
                }
            }
        );

        // Filter by device status
        if (deviceStatus === 'overLimit') {
            pipeline.push({
                $match: { activeDevices: { $gt: MAX_DEVICES_PER_USER } }
            });
        } else if (deviceStatus === 'underLimit') {
            pipeline.push({
                $match: { activeDevices: { $lt: MAX_DEVICES_PER_USER } }
            });
        }

        // Sort and paginate
        pipeline.push(
            { $sort: { lastDeviceActivity: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        );

        // Project required fields
        pipeline.push({
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                role: 1,
                isActive: 1,
                totalDevices: 1,
                activeDevices: 1,
                lastDeviceActivity: 1,
                createdAt: 1
            }
        });

        const users = await userModel.aggregate(pipeline);

        // Get total count for pagination
        const countPipeline = [];
        if (search) {
            countPipeline.push({
                $match: {
                    $or: [
                        { fullName: { $regex: search, $options: 'i' } },
                        { username: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        countPipeline.push(
            {
                $lookup: {
                    from: 'userdevices',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'devices'
                }
            },
            {
                $addFields: {
                    activeDevices: {
                        $size: {
                            $filter: {
                                input: '$devices',
                                cond: { $eq: ['$$this.isActive', true] }
                            }
                        }
                    }
                }
            }
        );

        if (deviceStatus === 'overLimit') {
            countPipeline.push({
                $match: { activeDevices: { $gt: MAX_DEVICES_PER_USER } }
            });
        } else if (deviceStatus === 'underLimit') {
            countPipeline.push({
                $match: { activeDevices: { $lt: MAX_DEVICES_PER_USER } }
            });
        }

        countPipeline.push({ $count: "total" });

        const totalResult = await userModel.aggregate(countPipeline);
        const totalUsers = totalResult.length > 0 ? totalResult[0].total : 0;

        res.status(200).json(
            new ApiResponse(200, {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalUsers / parseInt(limit)),
                    totalUsers,
                    limit: parseInt(limit)
                },
                maxDevicesPerUser: MAX_DEVICES_PER_USER
            }, "Users with device information retrieved successfully")
        );

    } catch (error) {
        console.error("Error in getAllUsersDevices:", error);
        return next(new ApiError(500, "Failed to retrieve users device information"));
    }
});

/**
 * Reset user devices (Admin only)
 */
export const resetUserDevices = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    try {
        // Verify user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        // Deactivate all devices for the user
        const result = await UserDevice.updateMany(
            { user: userId },
            { 
                isActive: false,
                lastActivity: new Date()
            }
        );

        res.status(200).json(
            new ApiResponse(200, {
                userId,
                deactivatedDevices: result.modifiedCount,
                message: `تم إعادة تعيين ${result.modifiedCount} جهاز للمستخدم ${user.fullName}`
            }, "User devices reset successfully")
        );

    } catch (error) {
        console.error("Error in resetUserDevices:", error);
        return next(new ApiError(500, "Failed to reset user devices"));
    }
});

/**
 * Remove specific device (Admin only)
 */
export const removeDevice = asyncHandler(async (req, res, next) => {
    const { deviceId } = req.params;

    try {
        const device = await UserDevice.findById(deviceId).populate('user', 'fullName username');
        
        if (!device) {
            return next(new ApiError(404, "Device not found"));
        }

        // Deactivate the device
        device.isActive = false;
        device.lastActivity = new Date();
        await device.save();

        res.status(200).json(
            new ApiResponse(200, {
                device,
                message: `تم إلغاء تفعيل الجهاز ${device.deviceName} للمستخدم ${device.user.fullName}`
            }, "Device deactivated successfully")
        );

    } catch (error) {
        console.error("Error in removeDevice:", error);
        return next(new ApiError(500, "Failed to remove device"));
    }
});

/**
 * Get device statistics (Admin only)
 */
export const getDeviceStats = asyncHandler(async (req, res, next) => {
    try {
        const stats = await UserDevice.aggregate([
            {
                $group: {
                    _id: null,
                    totalDevices: { $sum: 1 },
                    activeDevices: {
                        $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                    },
                    inactiveDevices: {
                        $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get platform statistics
        const platformStats = await UserDevice.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$deviceInfo.platform',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get browser statistics
        const browserStats = await UserDevice.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$deviceInfo.browser',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get users over device limit
        const usersOverLimit = await UserDevice.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$user',
                    deviceCount: { $sum: 1 }
                }
            },
            { $match: { deviceCount: { $gt: MAX_DEVICES_PER_USER } } },
            { $count: "usersOverLimit" }
        ]);

        const overLimitCount = usersOverLimit.length > 0 ? usersOverLimit[0].usersOverLimit : 0;

        const deviceStats = {
            ...(stats[0] || { totalDevices: 0, activeDevices: 0, inactiveDevices: 0 }),
            platformStats,
            browserStats,
            usersOverLimit: overLimitCount,
            maxDevicesPerUser: MAX_DEVICES_PER_USER
        };

        res.status(200).json(
            new ApiResponse(200, deviceStats, "Device statistics retrieved successfully")
        );

    } catch (error) {
        console.error("Error in getDeviceStats:", error);
        return next(new ApiError(500, "Failed to retrieve device statistics"));
    }
});
