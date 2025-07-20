#!/bin/bash

for i in {1..10}; do
    echo "Iteration $i"
    curl "https://lvnm4u3xonjpdmeyxbzvvqo3ee0hmwtu.lambda-url.us-east-1.on.aws/"
    sleep 1
done