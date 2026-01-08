const config = {};
config.sql = {};

// defaults (used in production)
config.sql.host = process.env.DB_HOST || "localhost";
config.sql.user = process.env.DB_USER || "root";
config.sql.password = process.env.DB_PASSWORD || "root";
config.sql.database = process.env.DB_NAME || "rwils001_co2";
config.sql.port = process.env.DB_PORT || 3306;

// MAMP uses socket, not TCP
if (config.sql.host === "localhost") {
  config.sql.socketPath = "/Applications/MAMP/tmp/mysql/mysql.sock";
}

module.exports = config;