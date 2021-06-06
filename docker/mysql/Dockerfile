FROM mysql
ADD ./00-init-mysql.sql /docker-entrypoint-initdb.d/00-init-mysql.sql
ADD ./01-dump.sql /docker-entrypoint-initdb.d/01-dump.sql

