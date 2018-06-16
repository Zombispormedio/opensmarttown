#open-data
[![Build Status](https://travis-ci.org/Zombispormedio/opensmarttown.svg?branch=master)](https://travis-ci.org/Zombispormedio/opensmarttown) [![Greenkeeper badge](https://badges.greenkeeper.io/Zombispormedio/opensmarttown.svg)](https://greenkeeper.io/)
catalog
-magnitudes
-zones
-sensor_grids
-sensors

magnitudes
zones?page=&near=(\d,\d)&magnitude=&format=(geojson|kml)
zones/:ref?format=(geojson|kml)

sensor_grids?page=&near=(\d,\d)&format=(geojson|kml)&magnitude=&zone=&greater_num_sensor=&less_num_sensor
sensor_grids/:ref?format=(geojson|kml)

sensors?page=&near=(\d,\d)&format=(geojson|kml)&magnitude=&zone=&type=(current|historical)&page=&size=&from=&to=
sensors/:ref?&format=(geojson|kml)&type=(current|historical)&from=&to=
