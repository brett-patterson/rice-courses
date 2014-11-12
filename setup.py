#!/usr/bin/env python

from setuptools import setup

setup(
    name='rice_course_manager',
    version='0.1',
    description='Course manager and planner for Rice University',
    author='Brett Patterson',
    author_email='brett.patterson@rice.edu',
    install_requires=['Django==1.7.1'],
    package_dir = {'': 'wsgi'},
    packages = ['rice_course_manager'],
)
