#! /bin/sh

cd $(stat -f $0 | xargs dirname)/../soa
bin/rails s -p 3001
