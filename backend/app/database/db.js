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
                id_user INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NULL,
                surname VARCHAR(50),
                name VARCHAR(50),
                image VARCHAR(255) DEFAULT NULL,
                theme BOOLEAN DEFAULT FALSE,
                status VARCHAR(20) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS Workspaces (
                id_workspace INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                image VARCHAR(255) DEFAULT NULL,
                status ENUM('public', 'private') NOT NULL,
                creator_id INT NOT NULL,
                FOREIGN KEY (creator_id) REFERENCES Users(id_user) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS Roles (
                id_role INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                create_channel BOOLEAN DEFAULT 0,
                send_message BOOLEAN DEFAULT 1,
                edit_workspace BOOLEAN DEFAULT 0,
                invite_people BOOLEAN DEFAULT 0,
                edit_message BOOLEAN DEFAULT 0,
                suppr_people BOOLEAN DEFAULT 0,
                id_workspace INT,
                FOREIGN KEY (id_workspace) REFERENCES Workspaces(id_workspace) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS Channels (
                id_channel INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                status ENUM('public', 'private') NOT NULL,
                id_workspace INT,
                id_creator INT,
                FOREIGN KEY (id_workspace) REFERENCES Workspaces(id_workspace) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS sondage (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question VARCHAR(255) NOT NULL,
                finish DATETIME NOT NULL
            )`,

            `CREATE TABLE IF NOT EXISTS Messages (
                id_message INT AUTO_INCREMENT PRIMARY KEY,
                message VARCHAR(255),
                emoji VARCHAR(255),
                extern_file BLOB,
                id_workspace INT,
                id_channel INT,
                id_user INT NOT NULL,
                id_sondage INT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_workspace) REFERENCES Workspaces(id_workspace) ON DELETE CASCADE,
                FOREIGN KEY (id_channel) REFERENCES Channels(id_channel) ON DELETE CASCADE,
                FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE,
                FOREIGN KEY (id_sondage) REFERENCES sondage(id) ON DELETE SET NULL
            )`,

            `CREATE TABLE IF NOT EXISTS User_Channels (
                id_channel INT,
                id_user INT,
                notification BOOLEAN DEFAULT 1,
                PRIMARY KEY (id_channel, id_user),
                FOREIGN KEY (id_channel) REFERENCES Channels(id_channel) ON DELETE CASCADE,
                FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS Inbox (
                id_inbox INT AUTO_INCREMENT PRIMARY KEY,
                nb_notif INT DEFAULT 0,
                id_user INT,
                FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS User_Workspaces (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_user INT,
                id_workspace INT,
                id_role INT,
                FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE,
                FOREIGN KEY (id_workspace) REFERENCES Workspaces(id_workspace) ON DELETE CASCADE,
                FOREIGN KEY (id_role) REFERENCES Roles(id_role) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS invite_code (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_workspace INT NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                finish DATETIME NOT NULL,
                FOREIGN KEY (id_workspace) REFERENCES Workspaces(id_workspace) ON DELETE CASCADE
            )`,

            `CREATE EVENT IF NOT EXISTS delete_expired_invite_codes
            ON SCHEDULE EVERY 1 HOUR
            DO
            DELETE FROM invite_code WHERE finish < NOW()`,

            `CREATE TABLE IF NOT EXISTS response_option (
                id INT AUTO_INCREMENT PRIMARY KEY,
                response VARCHAR(55) NOT NULL,
                id_sondage INT NOT NULL,
                FOREIGN KEY (id_sondage) REFERENCES sondage(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS user_response (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_user INT NOT NULL,
                id_sondage INT NOT NULL,
                id_response INT NOT NULL,
                UNIQUE (id_user, id_sondage),
                FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE,
                FOREIGN KEY (id_sondage) REFERENCES sondage(id) ON DELETE CASCADE,
                FOREIGN KEY (id_response) REFERENCES response_option(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS Notifications (
                id_notification INT AUTO_INCREMENT PRIMARY KEY,
                id_user INT NOT NULL,
                type ENUM('mention', 'message', 'sondage') NOT NULL,
                id_workspace INT,
                id_channel INT,
                id_message INT DEFAULT NULL,
                id_sondage INT DEFAULT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE,
                FOREIGN KEY (id_workspace) REFERENCES Workspaces(id_workspace) ON DELETE CASCADE,
                FOREIGN KEY (id_channel) REFERENCES Channels(id_channel) ON DELETE CASCADE,
                FOREIGN KEY (id_message) REFERENCES Messages(id_message) ON DELETE SET NULL,
                FOREIGN KEY (id_sondage) REFERENCES sondage(id) ON DELETE SET NULL
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
