const baseConfig = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'articles_db',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  development: { ...baseConfig },
  test: {
    ...baseConfig,
    database: process.env.DB_NAME_TEST || 'articles_db_test',
  },
  production: { ...baseConfig },
};
