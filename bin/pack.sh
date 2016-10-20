#!/bin/bash
rm -rf target/
mkdir target
tar zcfv target/waste.tar.gz . --exclude='./node_modules' \
                              --exclude='./public/bower_components' \
                              --exclude='./.idea' \
                              --exclude='./waste.iml' \
                              --exclude='./target' \
                              --exclude='./bin/pack.sh' \
                              --exclude='./bin/move.sh' \
                              --exclude='./todo.txt' \
                              --exclude='./.git' \
                              --exclude='./.gitignore'
