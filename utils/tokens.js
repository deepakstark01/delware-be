import jwt from 'jsonwebtoken';

export const signAccess = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'access_secret', {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
  });
};

export const signRefresh = (user) => {
  const payload = {
    userId: user._id,
    email: user.email
  };
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d'
  });
};

export const verify = (token, secret) => {
  return jwt.verify(token, secret);
};
