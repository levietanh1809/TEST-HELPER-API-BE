export default () => ({
  port: process.env.PORT|| 3000,
  googleSheets: {
    range: process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:A',
    serviceAccount: {
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY,
    },
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    maxTokens: process.env.OPENAI_MAX_TOKENS || 4000,
  },
});
