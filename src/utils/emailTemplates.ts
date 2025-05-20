export const generateVerificationEmail = (link: string) => {
    return `
      <h2>Welcome to InternZity</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${link}">Verify your email</a>
      <p>The link expires in 24 hours.</p>
    `;
  };
  
export function generateResetEmail(link: string) {
  return `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password (valid for 1 hour):</p>
    <a href="${link}">Reset your Password</a>
  `;
}
