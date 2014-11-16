from rice_course_manager.courses import fetch_courses
fetch_courses('201520')

import os
import datetime

log_dir = os.environ['OPENSHIFT_LOG_DIR']
log_file_name = os.path.join(log_dir, 'fetch_courses.log')

log_file = open(log_file_name, 'a')
timestamp = str(datetime.datetime.now())
log_file.write(timestamp + "\r\n")
log_file.close()
