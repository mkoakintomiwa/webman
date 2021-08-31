#!/bin/bash

echo "Updating mysql configs in /etc/mysql/my.cnf."

if [ 'sudo sed -i "s/.*bind-address.*/bind-address = 127.0.0.1/" /etc/mysql/my.cnf' ]; then

    echo "Updated mysql bind address in /etc/mysql/my.cnf to 0.0.0.0 to allow external connections."

    sudo /etc/init.d/mysql stop
    sudo /etc/init.d/mysql start

fi