module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            // define the files to lint
            files: ['gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        },
        uglify: {
            options: {
                banner: '/**\n' + ' * <%=pkg.name %>.js\n' +
                    ' * <%= pkg.description %>\n' +
                    ' * @version v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    ' * @link <%= pkg.homepage %>\n' +
                    ' * @author <%= pkg.author %>\n' +
                    ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' + ' */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['jshint']);

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'uglify']);

};