#! /bin/sh

cd $(stat -f $0 | xargs dirname)/../main
bin/rails s -p 3000
