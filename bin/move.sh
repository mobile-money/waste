#!/bin/bash
scp ~/code/waste/target/waste.tar.gz root@oakenphoto.ru:/tmp
ssh root@oakenphoto.ru "cd /opt/node/waste && tar zxf /tmp/waste.tar.gz && npm install && cd ./public && bower install --allow-root && forever restart /opt/node/waste/bin/www"