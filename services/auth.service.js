import { signAccess, signRefresh } from '../utils/tokens.js';
import { pick } from '../utils/pick.js';

export const createTokens = (user) => {
  return {
    accessToken: signAccess(user),
    refreshToken: signRefresh(user)
  };
};

export const sanitizeUser = (user) => {
  return pick(user.toObject ? user.toObject() : user, [
    '_id',
    'email',
    'firstName',
    'lastName',
    'phone',
    'address',
    'city',
    'state',
    'zip',
    'role',
    'membershipPlan',
    'membershipStatus',
    'membershipStartAt',
    'membershipEndAt',
    'createdAt',
    'updatedAt'
  ]);
};
