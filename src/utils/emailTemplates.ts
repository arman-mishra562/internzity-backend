export const generateVerificationEmail = (link: string) => {
    return `
      <h2>Welcome to InternZity</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${link}">Verify your email</a>
      <p>The link expires in 24 hours.</p>
    `;
  };
  