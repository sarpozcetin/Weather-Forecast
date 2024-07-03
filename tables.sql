DROP TABLE IF EXISTS `userInfo`;

CREATE TABLE userInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    timestamp DATETIME NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100)
);