import bcrypt from 'bcrypt';

const SALT_ROUNDS = 8;

export async function encrypt(text: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(text, salt);
}

export async function compare(
  encryptedText: string,
  textToCompare: string,
): Promise<boolean> {
  return bcrypt.compare(encryptedText, textToCompare);
}
