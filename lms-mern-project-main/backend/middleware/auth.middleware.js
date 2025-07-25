import AppError from "../utils/error.utils.js";
import jwt from "jsonwebtoken";
import userModel from '../models/user.model.js';

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new AppError("Unauthenticated, please login again", 400))
    }

    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded user details:', userDetails);
    req.user = userDetails;

    next();
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
    const user = await userModel.findById(id);
    const subscriptionStatus = user.subscription.status;
    if (role !== 'ADMIN' && subscriptionStatus !== 'active') {
        return next(
            new AppError('Please subscribce to access this route!', 403)
        )
    }

    next();
}

export {
    isLoggedIn,
    authorisedRoles,
    authorizeSubscriber
}