export const isValidGroupType = (groupType: string) => {
  const VALID_GROUP_TYPES = ['ALL', 'NONPROFIT', 'SUPPLIER', 'ADMIN'];
  if (!VALID_GROUP_TYPES.includes(groupType)) {
    throw new Error('Invalid groupType');
  }
};
