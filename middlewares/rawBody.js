import express from 'express';

export const rawBodyParser = express.raw({ 
  type: 'application/json',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
});
