module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-uglify');

grunt.initConfig({


  uglify: {
    main: {
      files: {
        'assets/js/report-back.min.js': [
        'assets/js/report-back.js',
        'assets/js/html2canvas.js'
      ]
      }
    }
  }
});


  grunt.registerTask(
      'default',
      [
          'uglify',
      ]
  );
}