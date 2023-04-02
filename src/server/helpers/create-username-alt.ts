export const createUsernameAlt = (un: string) => {
  const pn = 'profile image';
  if (!un) return pn;
  return un + ' ' + pn;
};