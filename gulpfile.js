const argv = require('minimist')(process.argv.slice(2));

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const streamify = require('gulp-streamify');
const source = require('vinyl-source-stream');

const budo = require('budo');
const browserify = require('browserify');
const resetCSS = require('node-reset-scss').includePath
const glslify = require('glslify');
const babelify = require('babelify').configure({
  presets: ['es2015']
});

const entry = './src/js/index.js';
const libraryEntry = './src/js/SanZigen/legacy.js';

const outfile = 'bundle.js';
const outputFoldername = 'src01';
const inlinesource = require('gulp-inline-source');
const aliasify = require('aliasify').configure({
    aliases: {
        "SanZigen": "./src/js/SanZigen"
    },
    verbose: false
});



//the development task
gulp.task('watch', function(cb) {
  //dev server
  budo(entry, {
    serve: 'bundle.js',     // end point for our <script> tag
    stream: process.stdout, // pretty-print requests
    live: true,             // live reload & CSS injection
    dir: 'app',             // directory to serve
    open: argv.open,        // whether to open the browser
    browserify: {
      transform:[
          babelify,
          glslify,
          aliasify
      ]
    }
  }).on('exit', cb);
});

//the distribution bundle task
gulp.task('bundle', function() {
  var bundler = browserify(entry, { transform: [babelify, glslify, aliasify] }).bundle();

  if(argv.public){
       bundler
        .pipe(source('index.js'))
        .pipe(streamify(uglify()))
        .pipe(rename(outfile))
        .pipe(gulp.dest('./app'));

       var output =  './public/' + outputFoldername;
       gulp.src('./app/index.html')
          .pipe(inlinesource())
          .pipe(gulp.dest(output));

       gulp.src('./app/bundle.js')
          .pipe(gulp.dest(output));

      return;
  }else{
      return bundler
        .pipe(source('index.js'))
        // .pipe(streamify(uglify()))
        .pipe(rename(outfile))
        .pipe(gulp.dest('./app'));

  }
});

gulp.task('library', function(){
    var bundler = browserify(libraryEntry, { transform: [babelify, glslify, aliasify] }).bundle();

    bundler.pipe(source('index.js'))
        .pipe(rename('SanZigenGL2.js'))
        .pipe(gulp.dest('./dest'));
})



