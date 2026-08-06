const appConfig = () => ({
  port: Number(process.env.PORT),
  node_env: process.env.NODE_ENV,
  jwt_secret: process.env.JWT_SECRET,
});

export default appConfig;
