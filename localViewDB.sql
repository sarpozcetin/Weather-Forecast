CREATE DATABASE users;

USE users;

CREATE TABLE userInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45),
    timestamp DATETIME,
    city VARCHAR(100),
    country VARCHAR(100)
);
