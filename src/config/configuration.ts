export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  googleSheets: {
    range: process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:A',
    serviceAccount: {
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY,
    },
  },
});
