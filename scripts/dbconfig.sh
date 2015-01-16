#!/bin/bash

## ADD ROOT USER, CREATE learntogeter DATABASE, GRANT ALL PRIVILEGES
## Calls ./scripts/db.sql 
## Creates database: learntogether
##		     schema: core
##		     tables: users
## Inserts root into table, with login credentials 
psql -f ./scripts/createDatabase.sql 
psql -f ./scripts/createTables.sql 

