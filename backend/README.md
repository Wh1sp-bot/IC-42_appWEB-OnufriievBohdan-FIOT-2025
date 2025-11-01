GachiFit Backend (MySQL) - real DB configuration


This backend connects to your existing MySQL database using credentials from .env.

Endpoints (examples):
GET /api/users
POST /api/users
GET /api/programs
GET /api/programs/:id
GET /api/programs/:id/exercises  (use /api/exercises?program_id=...)

How to run:
1. cd backend_mysql_real
2. npm install
3. make sure .env contains DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
4. npm start

Notes:
- The models reflect the CREATE TABLE definitions found in your SQL dump.
- No automatic sync is run; Sequelize will not alter your database schema.
