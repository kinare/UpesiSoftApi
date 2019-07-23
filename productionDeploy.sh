#!/bin/bash

root="/var/www/api.upesisoft.com/html"

cd $root

git pull origin master

pm2 restart 1

echo -e 'Deployment successful'
