CREATE DATABASE IF NOT EXISTS ecommerce;
CREATE DATABASE IF NOT EXISTS ecommerce_test;

GRANT ALL PRIVILEGES ON ecommerce.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON ecommerce_test.* TO 'app_user'@'%';

FLUSH PRIVILEGES;