#!/usr/bin/env python

from setuptools import setup

setup(
    name='django-realtime-admin',
    packages=['django_realtime_admin'],
    description='Django Realtime Admin refresh UI without page refresh',
    long_description='',
    author='Volodymyr Trotsyshyn',
    author_email='devova@gmail.com',
    url='https://github.com/devova/django-realtime-admin',
    py_modules=['django_realtime_admin'],
    install_requires=["django>=1.11,<2.0", "django_eventstream"],
    keywords=['testing', 'pytest'],
    classifiers=[
        'Programming Language :: Python :: 3.7',
    ],
    setup_requires=[
        'setuptools_scm',
    ],
    use_scm_version={'root': '.', 'relative_to': __file__}
)
