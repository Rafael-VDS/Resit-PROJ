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
                FOREIGN KEY (video_id) REFERENCES Videos(id) ON DELETE CASCADE,
                UNIQUE (user_id, video_id)
            )`,

            `CREATE TABLE IF NOT EXISTS Subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                channel_id INT NOT NULL,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (channel_id) REFERENCES Users(id) ON DELETE CASCADE,
                UNIQUE (user_id, channel_id)
            )`
        ];

        
        for (const query of tables) {
            await connection.promise().query(query);
        }

        // Migration pour nettoyer les doublons dans History et ajouter la contrainte unique
        try {
            // Supprimer les doublons en gardant seulement le plus récent
            await connection.promise().query(`
                DELETE h1 FROM History h1
                INNER JOIN History h2 
                WHERE h1.user_id = h2.user_id 
                AND h1.video_id = h2.video_id 
                AND h1.viewed_at < h2.viewed_at
            `);
            
            // Ajouter la contrainte unique si elle n'existe pas déjà
            await connection.promise().query(`
                ALTER TABLE History 
                ADD CONSTRAINT unique_user_video 
                UNIQUE (user_id, video_id)
            `);
            console.log("✅ Migration History appliquée avec succès !");
        } catch (migrationError) {
            // La contrainte existe probablement déjà
            console.log("ℹ️ Migration History : contrainte unique déjà présente");
        }

        // Migration pour renommer target_user_id en channel_id dans Subscriptions
        try {
            await connection.promise().query(`
                ALTER TABLE Subscriptions CHANGE target_user_id channel_id INT NOT NULL
            `);
            console.log("✅ Migration Subscriptions appliquée avec succès !");
        } catch (migrationError) {
            // La colonne a déjà été renommée ou n'existe pas
            console.log("ℹ️ Migration Subscriptions : colonne channel_id déjà présente");
        }

        console.log("✅ Toutes les tables ont été vérifiées/créées !");
    } catch (error) {
        console.error("❌ Erreur lors de la création des tables :", error);
    } finally {
        connection.release();
    }
});

module.exports = pool.promise();
