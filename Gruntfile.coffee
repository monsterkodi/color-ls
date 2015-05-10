
module.exports = (grunt) ->

    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'

        salt:
            options:
                dryrun:  false
                verbose: true
                refresh: false
            coffee:
                files:
                    'asciiHeader': ['**/*.coffee']
                    'asciiText':   ['**/*.coffee']

        watch:
          sources:
            files: ['*.coffee', 'coffee/**.coffee']
            tasks: ['build']

        coffee:
            options:
                bare: true
            ls:
                expand: true,
                flatten: true,
                cwd: '.',
                src: ['*.coffee'],
                dest: 'js',
                ext: '.js'
            coffee:
                expand: true,
                flatten: true,
                cwd: '.',
                src: ['coffee/*.coffee'],
                dest: 'js/coffee',
                ext: '.js'

        bumpup:
            file: 'package.json'

        shell:
            publish:
                command: 'npm publish'

    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-bumpup'
    grunt.loadNpmTasks 'grunt-pepper'
    grunt.loadNpmTasks 'grunt-shell'

    grunt.registerTask 'build',     [ 'bumpup', 'salt', 'coffee' ]
    grunt.registerTask 'default',   [ 'build' ]

# npm install --save-dev grunt
# npm install --save-dev grunt-contrib-watch
# npm install --save-dev grunt-contrib-coffee
# npm install --save-dev grunt-bumpup
# npm install --save-dev grunt-pepper
# npm install --save-dev grunt-shell
