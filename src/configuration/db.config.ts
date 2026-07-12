//should return a config object

const dbConfig = () => ({
  databaseUrl: process.env.DATABASE_URL,
});

export default dbConfig;
