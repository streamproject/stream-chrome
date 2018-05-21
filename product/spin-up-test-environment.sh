#!/bin/bash

rm -rf .postgres_test_data
mkdir .postgres_test_data

docker-compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose.test.yml up