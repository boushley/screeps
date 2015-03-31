module.exports = function (grunt) {
    require('time-grunt')(grunt);

    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt);

    var creds = require('./screeps-creds.json');

    grunt.initConfig({
        broccoli_build: {
            src: {
                dest: 'build/'
            }
        },
        clean: {
            build: ['build']
        },
        screeps: {
            options: {
                email: creds.email,
                password: creds.password
            },
            dist: {
                src: ['build/*.js']
            }
        }
    });

    grunt.registerTask('build', ['clean', 'broccoli_build']);
    grunt.registerTask('publish', ['screeps']);
    grunt.registerTask('default', ['build', 'publish']);
};
