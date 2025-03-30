-- Database Schema untuk Aplikasi

-- Tabel Users (Pengguna)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    birth_date DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    bio TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    account_status VARCHAR(20) DEFAULT 'active',
    verification_status VARCHAR(20) DEFAULT 'unverified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Foto Profil
CREATE TABLE user_photos (
    photo_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    photo_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sort_order INTEGER NOT NULL
);

-- Tabel untuk Preferensi Pengguna
CREATE TABLE user_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    interested_in VARCHAR(50)[], -- Array bisa berisi 'male', 'female', 'non-binary', dll
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 99,
    max_distance INTEGER DEFAULT 50, -- dalam kilometer
    show_me_on_app BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Minat/Hobi
CREATE TABLE interests (
    interest_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Tabel Relasi User dan Minat (Many-to-Many)
CREATE TABLE user_interests (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    interest_id INTEGER REFERENCES interests(interest_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, interest_id)
);

-- Tabel untuk Swipes/Likes
CREATE TABLE swipes (
    swipe_id SERIAL PRIMARY KEY,
    swiper_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    swiped_user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL, -- 'left' untuk reject, 'right' untuk like, 'super' untuk super like
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(swiper_id, swiped_user_id)
);

-- Tabel untuk Matches
CREATE TABLE matches (
    match_id SERIAL PRIMARY KEY,
    user_id_1 INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    user_id_2 INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2) -- Untuk memastikan tidak ada duplikasi matches
);

-- Tabel untuk Pesan/Chat
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(match_id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Tabel untuk Lampiran Pesan (Gambar, Video, dll)
CREATE TABLE message_attachments (
    attachment_id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(message_id) ON DELETE CASCADE,
    attachment_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'audio', 'location', dll
    attachment_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Laporan Pengguna
CREATE TABLE user_reports (
    report_id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    reported_user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Blokir Pengguna
CREATE TABLE user_blocks (
    block_id SERIAL PRIMARY KEY,
    blocker_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    blocked_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

-- Tabel untuk Subscription/Premium
CREATE TABLE subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subscription_type VARCHAR(50) NOT NULL, -- 'basic', 'premium', 'platinum', dll
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT false,
    payment_status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Transaksi Pembayaran
CREATE TABLE payment_transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(subscription_id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_status VARCHAR(20) NOT NULL,
    payment_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk Notifikasi
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'match', 'message', 'like', dll
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    related_id INTEGER -- Bisa reference ke match_id, message_id, dll.
);

-- Tabel untuk Log Aktivitas Pengguna (untuk analisis dan keamanan)
CREATE TABLE user_activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    device_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk meningkatkan performa query
CREATE INDEX idx_users_location ON users(location_lat, location_lng);
CREATE INDEX idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped_user_id ON swipes(swiped_user_id);
CREATE INDEX idx_matches_users ON matches(user_id_1, user_id_2);
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);
