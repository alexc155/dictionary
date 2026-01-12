#!/bin/bash

cat raw-wiktextract-data.jsonl \
    | grep ", \"lang\": \"English\", " \
    | grep -v "\"etymology_number\": 2" \
    | grep -v "\"etymology_number\": 3" \
    | grep -v "\"etymology_number\": 4" \
    | grep -v "\"etymology_number\": 5" \
    | grep -v "\"etymology_number\": 6" \
    | grep -v "\"etymology_number\": 7" \
    | grep -v "\"etymology_number\": 8" \
    | grep -v "\"etymology_number\": 9" \
    | grep -v "\"etymology_number\": 10" \
    | grep -v "\"etymology_number\": 11" \
    | grep -v "\"etymology_number\": 12" \
    | grep -v "\"etymology_number\": 13" \
    | grep -v "\"etymology_number\": 14" \
    | grep -v "\"etymology_number\": 15" \
    | grep -v "\"etymology_number\": 16" \
    | grep -v "\"etymology_number\": 17" \
    | grep -v "\"etymology_number\": 18" \
    | grep -v "\"etymology_number\": 19" \
    | grep -v "\"etymology_number\": 20" \
    > data/data.jsonl