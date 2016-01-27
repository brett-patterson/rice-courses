"""
Django settings for rice_courses project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""
import os

# SECURITY WARNING: keep the secret key used in production secret!
DEFAULT_SECRET_KEY = '0+u!e@o_m4)t1%2gzzpuxtb5f8qx+3lg^fxf*ix$g5lw98219+'
SECRET_KEY = os.environ.get('SECRET_KEY', DEFAULT_SECRET_KEY)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('RCM_REMOTE') is None
TEMPLATE_DEBUG = DEBUG

APP_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(APP_DIR)

if DEBUG:
    ALLOWED_HOSTS = []
else:
    ALLOWED_HOSTS = ['*']


# Website specific settings

EVAL_DATE_FORMAT = '%m/%d/%Y %I:%M %p'
HELP_DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, 'data/help'))
COURSE_PAGE_LENGTH = 50

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'adminsortable',
    'nested_inline',
    'webpack_loader',

    'courses',
    'evaluation',
    'help',
    'me'
)

TEMPLATE_DIRS = (
    os.path.join(APP_DIR, 'templates'),
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.tz',
    'django.contrib.messages.context_processors.messages',
    'django.core.context_processors.request'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_cas.middleware.CASMiddleware',
)

AUTHENTICATION_BACKENDS = (
    'django_cas.backends.CASBackend',
)

LOGIN_URL = '/login/'

CAS_SERVER_URL = 'https://netid.rice.edu/cas/'

ROOT_URLCONF = 'rice_courses.urls'

WSGI_APPLICATION = 'wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases
DATABASES = {}

if DEBUG:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'rice_courses',
        'USER': 'rice_courses',
        'PASSWORD': 'root',
        'HOST': 'localhost',
        'PORT': ''
    }
else:
    import dj_database_url
    DATABASES['default'] = dj_database_url.config()

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/
STATIC_URL = '/static/'
STATIC_ROOT = '/app/staticfiles/'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)

WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'bundles/',
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats.json')
    }
}

# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
