module.exports = function(grunt) {
    require('time-grunt')(grunt);

    var config = require('./.screeps.json')


    var branch = grunt.option('branch') || config.branch;
    var email = grunt.option('email') || config.email;
    var password = grunt.option('password') || config.password;
    var ptr = grunt.option('ptr') ? true : config.ptr
    var private_directory = grunt.option('private_directory') || config.private_directory;

    var currentdate = new Date();
    // Output the current date and branch.
    grunt.log.subhead('Task Start: ' + currentdate.toLocaleString())
    grunt.log.writeln('Branch: ' + branch)

    grunt.loadNpmTasks('grunt-screeps')
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-file-append')
    grunt.loadNpmTasks("grunt-jsbeautifier")
    grunt.loadNpmTasks("grunt-rsync")
    

    grunt.initConfig({
        screeps: {
            options: {
                email: email,
                password: password,
                branch: branch,
                ptr: ptr
            },
            dist: {
                src: ['dist/*.js']
            }
        },

        // Remove all files from the dist folder.
        clean: {
          'dist': ['dist']
        },

        // Copy all source files into the dist folder, flattening the folder structure by converting path delimiters to underscores
        copy: {
          // Pushes the game code to the dist folder so it can be modified before being send to the screeps server.
          screeps: {
            files: [{
              expand: true,
              cwd: 'src/',
              src: '**',
              dest: 'dist/',
              filter: 'isFile',
              rename: function (dest, src) {
                // Change the path name utilize underscores for folders
                return dest + src.replace(/\//g,'_');
              }
            }],
          }
        },
        // Add version variable using current timestamp.
        file_append: {
            versioning: {
                files: [
                {
                    append: "\nglobal.SCRIPT_VERSION = "+ currentdate.getTime() + "\n",
                    input: 'dist/version.js',
                }
                ]
            }
        },
        rsync: {
            options: {
                args: ["--verbose", "--checksum", "--delete"],
                exclude: [".git*"],
                recursive: true
            },
            private: {
                options: {
                    src: './dist/',
                    dest: private_directory,
                }
            },
            backup: {
                options: {
                  src: private_directory+'/',
                  dest: './backup/',
                }
            },
            restore: {
              options: {
                src: './backup/',
                dest: private_directory,
              }
            }
        },
        jsbeautifier: {
            modify: {
              src: ["src/**/*.js"],
              options: {
                config: '.jsbeautifyrc'
              }
            },
            verify: {
              src: ["src/**/*.js"],
              options: {
                mode: 'VERIFY_ONLY',
                config: '.jsbeautifyrc'
              }
            }
        }
          
    })

    grunt.registerTask('default',  ['clean', 'copy:screeps', 'file_append:versioning', 'screeps']);
    grunt.registerTask('private',  ['clean', 'copy:screeps', 'file_append:versioning', 'rsync:backup', 'rsync:private']);
    grunt.registerTask('restore',  ['clean', 'copy:screeps', 'rsync:restore']);

    grunt.registerTask('test',     ['jsbeautifier:verify']);
    grunt.registerTask('pretty',   ['jsbeautifier:modify']);
}