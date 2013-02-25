module.exports = function (grunt) {


  grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-css');

grunt.initConfig({


  uglify: {
    main: {
      files: {
        'assets/js/report-back.min.js': [
        'assets/js/report-back.js'
      ]
      }
    },
    libs: {
      files: {
        'assets/js/dependencies.js': [
        'assets/js/jquery.base64.js',
        'assets/js/html2canvas.js',
        'bootstrap.min.js'
      ]
      }
    }
  },

  cssmin: {
    options: {
      keepSpecialComments: 0
    },
    libs: {
      src: ['assets/css/bootstrap.min.css',  'assets/css/jquery.ui.css'],
      dest: 'assets/css/deps.css'
    }
  },
  jshint: {
    options: {
      asi: true,
      smarttabs: true
    },
    all: ['Gruntfile.js', 'assets/js/report-back.js']
  }



});


  grunt.registerTask(
      'default',
      [
          'uglify',
          //'cssmin',
          //'jshint'
      ]
  );
};