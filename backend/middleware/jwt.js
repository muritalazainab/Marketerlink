// Create or update your JWT middleware (middleware/jwt.js):

import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

const verifyToken = (req, res, next) => {
  // Get token from multiple sources
  let token = null;
  
  // 1. Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove "Bearer " prefix
  }
  
  // 2. Fallback to cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  
  // console.log('Token received:', token ? 'Token found' : 'No token');
  
  if (!token) {
    return next(createError(401, "You are not authenticated!"));
  }

  jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_KEY, (err, userInfo) => {
    if (err) {
      console.log('JWT verification failed:', err.message);
      return next(createError(403, "Token is not valid!"));
    }
    
    req.userId = userInfo.id;
    req.isSeller = userInfo.isSeller;
    req.isAdmin = userInfo.isAdmin;
    
    // console.log('JWT verified for user:', userInfo.id);
    next();
  });
};

export default verifyToken;