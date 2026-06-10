import mysql from 'mysql2/promise';

export async function queryDatabase(queryString, params = []) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '10.204.2.40',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'epos2000',
    user: process.env.DB_USER || 'QA_User',
    password: process.env.DB_PASSWORD || 'Q@uSer1!',
  });

  try {
    const [rows] = await connection.execute(queryString, params);
    return rows;
  } catch (error) {
    console.error('Database query execution failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}