//should return a config object

const appConfig = () => ({
  port: Number(process.env.PORT),
  node_env: process.env.NODE_ENV,
});

export default appConfig;
