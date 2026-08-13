const appConfig = () => ({
  port: Number(process.env.PORT),
  node_env: process.env.NODE_ENV,
  jwt_secret: process.env.JWT_SECRET,
  jwt_access_expires: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires: process.env.JWT_REFRESH_EXPIRES_IN,
});

export default appConfig;
