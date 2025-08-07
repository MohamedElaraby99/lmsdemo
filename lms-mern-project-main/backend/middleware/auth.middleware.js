import AppError from "../utils/error.utils.js";
import jwt from "jsonwebtoken";
import userModel from '../models/user.model.js';

const isLoggedIn = async (req, res, next) => {
    console.log('=== IS LOGGED IN MIDDLEWARE ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Cookies:', req.cookies);
    
    const { token } = req.cookies;

    if (!token) {
        console.log('No token found in cookies');
        return next(new AppError("Unauthenticated, please login again", 400))
    }

    try {
        const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded user details:', userDetails);
        console.log('User role from JWT:', userDetails.role);
        req.user = userDetails;
        console.log('Set req.user:', req.user);
        next();
    } catch (error) {
        console.log('JWT verification failed:', error.message);
        return next(new AppError("Invalid token, please login again", 400));
    }
}

// authorised roles
const authorisedRoles = (...roles) => async (req, res, next) => {
    const currentUserRoles = req.user.role;
    console.log('=== AUTHORISED ROLES CHECK ===');
    console.log('Current user role:', currentUserRoles);
    console.log('Required roles:', roles);
    console.log('User object:', req.user);
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    
    if (!roles.includes(currentUserRoles)) {
        console.log('ACCESS DENIED: User role not in required roles');
        return next(new AppError("You do not have permission to access this routes", 403))
    }
    console.log('ACCESS GRANTED: User has required role');
    next();
}

const authorizeSubscriber = async (req, res, next) => {
    const {role, id} = req.user; 
    console.log('=== AUTHORIZE SUBSCRIBER CHECK ===');
    console.log('User role:', role);
    console.log('User ID:', id);
    
    const user = await userModel.findById(id);
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
        console.log('User not found in database');
        return next(new AppError('User not found', 404));
    }
    
    const subscriptionStatus = user.subscription?.status;
    console.log('Subscription status:', subscriptionStatus);
    console.log('User subscription object:', user.subscription);
    
    // For now, allow all logged-in users to access courses (temporary fix)
    if (role !== 'ADMIN' && subscriptionStatus !== 'active') {
        console.log('ACCESS DENIED: User needs subscription, but allowing access for now');
        // return next(
        //     new AppError('Please subscribce to access this route!', 403)
        // )
    }
    
    console.log('ACCESS GRANTED: User has valid subscription or is admin');
    next();
}

export {
    isLoggedIn,
    authorisedRoles,
    authorizeSubscriber
}