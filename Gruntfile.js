module.exports = function(e) {
    e.loadNpmTasks("grunt-contrib-uglify"), e.loadNpmTasks("grunt-contrib-jshint"), 
    e.loadNpmTasks("grunt-css"), e.loadNpmTasks("grunt-html-prettyprinter"), e.initConfig({
        uglify: {
            main: {
                files: {
                    "assets/js/report-back.min.js": [ "assets/js/report-back.js" ]
                }
            },
            libs: {
                files: {
                    "assets/js/dependencies.js": [ "assets/js/jquery.base64.js", "assets/js/html2canvas.js", "bootstrap.js" ]
                }
            },
            beautify: {
                options: {
                    beautify: {
                        width: 80,
                        beautify: !0,
                        comments: !0,
                        semicolons: !0,
                        max_line_len: 80
                    }
                },
                files: {
                    "assets/js/report-back.beauty.js": [ "assets/js/report-back.js" ],
                    "Gruntfile.js": [ "Gruntfile.js" ]
                }
            }
        },
        "html-prettyprinter": {
            single: {
                src: "index.html",
                dest: "indexclean.html"
            }
        },
        cssmin: {
            options: {
                keepSpecialComments: 0
            },
            libs: {
                src: [ "assets/css/bootstrap.min.css", "assets/css/jquery.ui.css" ],
                dest: "assets/css/deps.css"
            }
        },
        jshint: {
            options: {
                asi: !0,
                smarttabs: !0
            },
            all: [ "Gruntfile.js", "assets/js/report-back.js", "assets/js/html2canvas.js" ]
        }
    }), e.registerTask("default", [ "jshint", "uglify", "html-prettyprinter" ]);
};