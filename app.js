var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const {mongoose} = require("mongoose");

var app = express();

viewEngineSetup();
handleRoutes();
observerApi();
handleMongooseConnect();

module.exports = app;


/////////////////////////////////////
/////////// funcations  /////////////
////////////////////////////////////

function handleRoutes() {
  app.use('/api/admin', require('./routes/user/Admin'))
  app.use('/api/supervisor', require('./routes/user/Supervisor'))
  app.use('/api/surveyor', require('./routes/user/Surveyors'))

  // report
  app.use('/api/report', require('./routes/report/reportRouter'))
  
  //settings 
  app.use('/api/settings/checkEmail', require('./routes/settings/checkEmail/CheckEmailRoutes'))
  app.use('/api/settings/changePassword', require('./routes/settings/resertPassword/ResertPasswordRoutes'))
  app.use('/api/link', require('./routes/link/shinLink'))
}

function handleMongooseConnect() {
  mongoose.connect("mongodb+srv://mohammedmansour4009:qEJyk5bFLnKWzyUn@cluster0.kukyo7j.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true, useUnifiedTopology: true,
  }).then(() => {
    app.listen(3000, function () {
      console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
    });
  })
}

function viewEngineSetup() {
// view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
}



function observerApi() {
// // catch 404 and forward to error handler
//   app.use(function (req, res, next) {
//     console.log("ssss")
//     next(createError(404));
//   });

// error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
}