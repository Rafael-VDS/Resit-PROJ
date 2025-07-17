const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.PMA_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection(async (err, connection) => {
    if (err) {
        console.error("❌ Erreur de connexion à MySQL :", err);
        return;
    }
    console.log("✅ Connecté à MySQL !");

    try {
        console.log("🛠️ Vérification / création des tables...");

        const tables = [
            `CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255),
                image VARCHAR(255),
                description TEXT, -- optionnel : description de la chaîne
                oauth_provider VARCHAR(50),
                oauth_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS Videos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                video_url VARCHAR(255) NOT NULL,
                thumbnail_url VARCHAR(255),
                is_public BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS Hashtags (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) UNIQUE
            )`,

            `CREATE TABLE IF NOT EXISTS Video_Hashtags (
                video_id INT,
                hashtag_id INT,
                PRIMARY KEY (video_id, hashtag_id),
                FOREIGN KEY (video_id) REFERENCES Videos(id) ON DELETE CASCADE,
                FOREIGN KEY (hashtag_id) REFERENCES Hashtags(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS Likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                video_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (video_id) REFERENCES Videos(id) ON DELETE CASCADE,
                UNIQUE (user_id, video_id)
            )`,

            `CREATE TABLE IF NOT EXISTS Comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                video_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (video_id) REFERENCES Videos(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS Playlists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS Playlist_Videos (
                playlist_id INT,
                video_id INT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (playlist_id, video_id),
                FOREIGN KEY (playlist_id) REFERENCES Playlists(id) ON DELETE CASCADE,
                FOREIGN KEY (video_id) REFERENCES Videos(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS History (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                video_id INT NOT NULL,
                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (video_id) REFERENCES Videos(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS Subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                target_user_id INT NOT NULL,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (target_user_id) REFERENCES Users(id) ON DELETE CASCADE,
                UNIQUE (user_id, target_user_id)
            )`
        ];

        
        for (const query of tables) {
            await connection.promise().query(query);
        }

        console.log("✅ Toutes les tables ont été vérifiées/créées !");
    } catch (error) {
        console.error("❌ Erreur lors de la création des tables :", error);
    } finally {
        connection.release();
    }
});

module.exports = pool.promise();
