export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthdiff = today.getMonth() - birthDate.getMonth();
  if (
    monthdiff < 0 ||
    (monthdiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};
