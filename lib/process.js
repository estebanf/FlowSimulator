var build_library = require('./builder.js');
var builder = new build_library();
var seq = require("parseq").seq;

var build_seq = function(process,prefix,callback){
  var seq_activities = []
  for(step in process) {
    name = process[step].name;
    if(prefix) name = prefix + " - " +name;
    setup = process[step].setup;
    seq_activities.push(builder.build_activity(name,setup,callback))
  }
  return seq_activities;
}
var build_par_fn = function(process,id,callback){
  var activities = build_seq(process,"Instance " + id,callback);
  return function(){
    var self = this;
    activities.push(function(err,value){
      self(null,value);
    });
    seq.apply(null,activities).start();
  };
}
module.exports = function(process,instances,report_callback,end_callback){
  var par_activities = [];
  for(i=0; i < instances; i++){
    par_activities.push(build_par_fn(process,i,report_callback));
  }
  par_activities.push(function(err,results){
    if(end_callback){
      end_callback(results);
    }
  })
  return par_activities;
}
