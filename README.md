Rice Course Manager
===

Requirements
---
* Python 2.7
* Sass

Optional requirements

* node.js
* babel installed globally

Building/Running in Development
---
1. Install Python requirements with `pip install -r requirements.txt`
2. Ensure that Git submodules are fetched
3. Sync database with `./rice_course_manager/manage.py syncdb` (Note that you need a PostgresSQL server running with user `rice_courses` and password `root` and database `rice_courses`)
4. Run development server with `./rice_course_manager/manage.py runserver`

If modified, JavaScript files can be compiled with `make`. Note that this requires the optional requirements above.