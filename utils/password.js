import bcrypt from 'bcryptjs';

export const hash = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

export const compare = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
