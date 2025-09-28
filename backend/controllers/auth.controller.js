import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const { username, email, password, country, phone, desc, isSeller, img } = req.body;

    // basic validation
    if (!username || !email || !password || !country) {
      return res.status(400).json({ message: 'username, email, password and country are required' });
    }

    // check existing user
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      // produce a helpful message about which field is taken
      if (existing.email === email) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      if (existing.username === username) {
        return res.status(409).json({ message: 'Username already in use' });
      }
      return res.status(409).json({ message: 'User already exists' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const newUser = new User({
      username,
      email,
      password: hash,
      img,
      country,
      phone,
      isSeller,
      desc
    });

    const savedUser = await newUser.save();

    // FIXED: Use consistent JWT_SECRET
    const token = jwt.sign(
      { id: savedUser._id, isSeller: savedUser.isSeller }, 
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '7d' }
    );

    // remove password before sending
    const { password: _p, ...userWithoutPassword } = savedUser._doc;

    res.status(201).json({
      message: 'User created',
      user: userWithoutPassword,
      token
    });
  } catch (err) {
    // duplicate key error fallback
    if (err.code === 11000) {
      const key = Object.keys(err.keyValue || {})[0];
      return res.status(409).json({ message: `${key || 'Field'} already exists` });
    }

    // mongoose validation
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: err.message });
    }

    console.error('Register error:', err);
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    console.log('Login attempt:', req.body); // Debug log
    
    const { username, email, password } = req.body;
    
    // FIXED: Allow login with either username OR email
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (username) {
      user = await User.findOne({ username });
    } else {
      return next(createError(400, "Username or email is required!"));
    }

    if (!user) return next(createError(404, "User not found!"));

    const isCorrect = bcrypt.compareSync(password, user.password);
    if (!isCorrect)
      return next(createError(400, "Wrong password!"));

    // FIXED: Use consistent JWT_SECRET
    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
      },
      process.env.JWT_SECRET || 'secretkey'  // Use same secret as register
    );

    const { password: _, ...info } = user._doc;
    
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      })
      .status(200)
      .json({
        message: "Login successful",
        user: info,
        token // Also send token in response body for easier frontend handling
      });
  } catch (err) {
    console.error('Login error:', err); // Debug log
    next(err);
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    .status(200)
    .json({ message: "User has been logged out." });
};

export const registerAdmin = async (req, res) => {
  try {
    const { adminKey, ...adminData } = req.body;
    const ADMIN_KEY = process.env.ADMIN_REGISTRATION_KEY;
    
    console.log('Environment key exists:', !!ADMIN_KEY);
    console.log('Environment key length:', ADMIN_KEY?.length);
    console.log('Received key exists:', !!adminKey);
    console.log('Received key length:', adminKey?.length);
    console.log('Keys match (strict):', adminKey === ADMIN_KEY);
    console.log('Keys match (trimmed):', adminKey?.trim() === ADMIN_KEY?.trim());
    
    // Verify admin key with better error details
    if (!ADMIN_KEY) {
      console.error('ADMIN_REGISTRATION_KEY not found in environment variables');
      return res.status(500).json({ message: "Server configuration error" });
    }
    
    // FIXED: This condition was wrong - it should check if adminKey is NOT equal
    if (!adminKey || adminKey.trim() !== ADMIN_KEY.trim()) {
      return res.status(403).json({ 
        message: "Invalid admin access key",
        debug: process.env.NODE_ENV === 'development' ? {
          received_length: adminKey?.length,
          expected_length: ADMIN_KEY.length
        } : undefined
      });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminData.email },
        { username: adminData.username }
      ]
    });
    
    if (existingAdmin) {
      const field = existingAdmin.email === adminData.email ? 'email' : 'username';
      return res.status(400).json({ 
        message: `Admin account with this ${field} already exists` 
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const newAdmin = new User({
      ...adminData,
      password: hashedPassword,
      isAdmin: true,
      role: "admin",
    });

    await newAdmin.save();
    console.log('Admin created successfully:', newAdmin.username);

    res.status(201).json({
      message: "Admin account created successfully",
      user: { ...newAdmin._doc, password: undefined },
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, isAdmin: true });
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, isAdmin: true, role: "admin" },
      process.env.JWT_SECRET || 'secretkey',  // FIXED: Use consistent JWT_SECRET
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: { ...admin._doc, password: undefined },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: error.message });
  }
};