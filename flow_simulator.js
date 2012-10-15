var seq = require("parseq").seq;
var par = require("parseq").par;

var build_library = require('./builder.js');
var builder = new build_library();

var activity1 = builder.build_activity("One");
var activity2 = builder.build_activity("Two");
var activity3 = builder.build_activity("Three",builder.build_setup_standard(0.7,5000,1000,20000));
var activity4 = builder.build_activity("Four",builder.build_setup_loop(0.5,3000,1000,5000,0.5,1));
var activity5 = function(err,value){
  return value;
}
var seq_activities = [activity1,activity2,activity3,activity4,activity5];

var done = function(err,value){
  console.log(value);
}
var parallel_wrapper = function(){
  var self = this;
  seq.apply(null,[activity1,activity2,activity3,activity4,activity5,function(err,value){
    self(null,value);
  }]).start();
}

var par_activities = [];
for(i = 0;i<1000;i++){
  par_activities.push(parallel_wrapper);
}
par_activities.push(done);
par.apply(null,par_activities);

// par(function(){
//   var self = this;
//   seq(activity1,activity2,activity3,activity4,function(err,value){
//     self(null,value);
//   }).start();
// },function(){
//   var self = this;
//   seq(activity1,activity2,activity3,activity4,function(err,value){
//     self(null,value);
//   }).start();
// },done);
