export const PASSWORD_REQUIREMENTS = [
  { test: (value: string) => value.length >= 8, message: "Le mot de passe doit contenir au moins 8 caractères." },
  { test: (value: string) => /[A-Z]/.test(value), message: "Le mot de passe doit contenir une majuscule." },
  { test: (value: string) => /[a-z]/.test(value), message: "Le mot de passe doit contenir une minuscule." },
  { test: (value: string) => /[0-9]/.test(value), message: "Le mot de passe doit contenir un chiffre." },
  { test: (value: string) => /[^A-Za-z0-9]/.test(value), message: "Le mot de passe doit contenir un caractère spécial." },
];

export const getPasswordValidationError = (password: string) =>
  PASSWORD_REQUIREMENTS.find((requirement) => !requirement.test(password))?.message ?? null;
