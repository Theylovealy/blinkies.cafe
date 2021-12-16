#!/bin/bash

if [[ $* == *--rm* ]]; then
    echo hi
    sudo docker rm $(sudo docker ps -a -q)
fi

if [[ $* == *--rmi* ]]; then
    echo hiii
    sudo docker rmi $(sudo docker images -q)
fi

if [[ $* == *-b* ]]; then
  sudo docker build . -t piconaut/blinkies-cafe
fi

if [[ $* == *--test* ]]; then
    sudo docker kill $(sudo docker ps -q)
    sudo docker run -p 8080:8080 -d piconaut/blinkies-cafe:latest
fi

# mount certs:
# -v /host/path/to/certs:container/path/to/certs:ro
if [[ $* == *--run* ]]; then
    sudo docker kill $(sudo docker ps -q)
    sudo docker run -p 443:8080 -p 80:3000 -d piconaut/blinkies-cafe:latest
fi

if [[ $* == *--pull* ]]; then
  sudo docker pull piconaut/blinkies-cafe
fi

if [[ $* == *--push* ]]; then
  sudo docker push piconaut/blinkies-cafe:latest
fi




sudo echo ''