Rice Course Manager
===

Requirements
---
* Python 2.x
* Node.js

Building/Running in Development
---
1. Install Python requirements with `pip install -r requirements.txt`
2. Install Node.js requirements with `npm install`
3. Build static files with `make`
3. Sync database with `./rice_course_manager/manage.py syncdb` (Note that you need a PostgresSQL server running with user `rice_courses` and password `root` and database `rice_courses`)
4. Run development server with `./rice_course_manager/manage.py runserver`

If modified, static files need to be re-compiled with `make`.
