### Struktur project

````
dating-app-backend/
  ├── config/
  │   └── db.js
  ├── controllers/
  ├── middlewares/
  │   ├── auth.js
  │   └── validators.js
  ├── models/
  ├── routes/
  ├── utils/
  ├── .env
  ├── .gitignore
  ├── app.js
  └── package.json
````

### Install Lib

````
mkdir dating-app-backend
cd dating-app-backend
npm init -y

npm install express pg dotenv cors helmet jsonwebtoken bcrypt

npm install socket.io

npm install --save-dev nodemon

npx madge --circular ./app.js

npm install express-validator

````

- Run jwt env:
````
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
````

- verifikasi token:
````
echo "YOUR_ACCESS_TOKEN" | jq -R 'split(".") | .[1] | @base64d | fromjson'

````

### DB

- CREATE DATABASE dating_app;
- GRANT ALL PRIVILEGES ON DATABASE dating_app TO existing_user;
- \c dating_app
- \q
- psql -U postgres -d dating_app -f /home/anone/Projects/express/dating-app-backend/database/dating-schema.sql
- psql -U postgres -d dating_app
- \d users
- cek tabel

````
sudo -u postgres psql -d dating_app -c "\dt"

````

````
                                              Table "public.users"
       Column        |           Type           | Collation | Nullable |                Default                 
---------------------+--------------------------+-----------+----------+----------------------------------------
 user_id             | integer                  |           | not null | nextval('users_user_id_seq'::regclass)
 email               | character varying(255)   |           | not null | 
 phone_number        | character varying(20)    |           |          | 
 password_hash       | character varying(255)   |           | not null | 
 first_name          | character varying(100)   |           | not null | 
 last_name           | character varying(100)   |           |          | 
 birth_date          | date                     |           | not null | 
 gender              | character varying(20)    |           | not null | 
 bio                 | text                     |           |          | 
 location_lat        | numeric(10,8)            |           |          | 
 location_lng        | numeric(11,8)            |           |          | 
 last_active         | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 account_status      | character varying(20)    |           |          | 'active'::character varying
 verification_status | character varying(20)    |           |          | 'unverified'::character varying
 created_at          | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at          | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "users_pkey" PRIMARY KEY, btree (user_id)
    "idx_users_location" btree (location_lat, location_lng)
    "users_email_key" UNIQUE CONSTRAINT, btree (email)
    "users_phone_number_key" UNIQUE CONSTRAINT, btree (phone_number)
Referenced by:
    TABLE "matches" CONSTRAINT "matches_user_id_1_fkey" FOREIGN KEY (user_id_1) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "matches" CONSTRAINT "matches_user_id_2_fkey" FOREIGN KEY (user_id_2) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "messages" CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "notifications" CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "payment_transactions" CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "subscriptions" CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "swipes" CONSTRAINT "swipes_swiped_user_id_fkey" FOREIGN KEY (swiped_user_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "swipes" CONSTRAINT "swipes_swiper_id_fkey" FOREIGN KEY (swiper_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "user_activity_logs" CONSTRAINT "user_activity_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "user_blocks" CONSTRAINT "user_blocks_blocked_id_fkey" FOREIGN KEY (blocked_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "user_blocks" CONSTRAINT "user_blocks_blocker_id_fkey" FOREIGN KEY (blocker_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "user_interests" CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "user_photos" CONSTRAINT "user_photos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "user_preferences" CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    TABLE "user_reports" CONSTRAINT "user_reports_reported_user_id_fkey" FOREIGN KEY (reported_user_id) REFERENCES users(user_id) ON DELETE CASCADE
:

````

````
INSERT INTO users (email, phone_number, password_hash, first_name, last_name, birth_date, gender)
VALUES ('example@example.com', '1234567890', 'hashed_password', 'John', 'Doe', '1990-01-01', 'male');

````

- SELECT * FROM users WHERE email = 'example@example.com';

````
 user_id |        email        | phone_number |  password_hash  | first_name | last_name | birth_date | gender | bio | location_lat | location_lng |          last_active          | account_status | verification_status |          created_at           |          updated_at           
---------+---------------------+--------------+-----------------+------------+-----------+------------+--------+-----+--------------+--------------+-------------------------------+----------------+---------------------+-------------------------------+-------------------------------
       1 | example@example.com | 1234567890   | hashed_password | John       | Doe       | 1990-01-01 | male   |     |              |              | 2025-03-30 10:10:08.788761+07 | active         | unverified          | 2025-03-30 10:10:08.788761+07 | 2025-03-30 10:10:08.788761+07
(1 row)

````

- insert untk match user
````
INSERT INTO users (email, password_hash, first_name, last_name, birth_date, gender) 
VALUES ('user3@example.com', 'dummyhash', 'User', 'Three', '1995-01-01', 'male')
RETURNING user_id;

````

````
INSERT INTO matches (user_id_1, user_id_2, created_at, is_active) 
VALUES (1, 3, NOW(), true);

````

````
SELECT * FROM matches;

````

- buat match untuk user 2
````
INSERT INTO matches (user_id_1, user_id_2, is_active, created_at)
VALUES (2, 3, true, NOW());

SELECT * FROM matches WHERE user_id_1 = 2 OR user_id_2 = 2;

````
- kirim message
````
INSERT INTO messages (match_id, sender_id, content, sent_at, is_read)
VALUES (4, 2, 'Halo, ini pesan pertama!', NOW(), false);

````

## Tes Endpoint

### POST Regitrasi /users

````
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  --data '{
    "email": "newuser@example.com",
    "password": "password123",
    "first_name": "New",
    "last_name": "User",
    "birth_date": "1990-01-01",
    "gender": "male"
  }'

````

### POST Login /users/login

````
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  --data '{
    "email": "newuser@example.com",
    "password": "password123"
  }'

````

### GET /users

````
curl -X GET http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

````

### Match

````
curl -X GET http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

````

### Match Detail

````
curl -X GET http://localhost:3000/api/matches/2/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_TOKEN"

````