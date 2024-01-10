CREATE TABLE users (
    user_id int(11)	AUTO_INCREMENT PRIMARY KEY NOT NULL,
    user_fullname varchar(255),
    user_username varchar(255),
    user_password varchar(255),
    created_at datetime,
    created_by varchar(255),
    updated_at datetime,
    updated_by varchar(255)
)