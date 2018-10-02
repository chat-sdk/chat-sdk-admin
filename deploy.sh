#! /usr/bin/env bash

preact build
echo 'chat-sdk-admin.pepebecker.com' > build/CNAME
mv build/index.html build/200.html
cd build; surge; cd ..
