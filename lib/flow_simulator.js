var par = require("parseq").par;
var _ = require('underscore')._;

var build_library = require('./builder.js');
var builder = new build_library();
var seq = require("parseq").seq;

var process_def = [
  {
    name:'First step',
    setup: builder.build_setup_standard(0.5,5000,1000,20000)
  },
  {
    name:'Second step',
    setup: builder.build_setup_standard(0.5,5000,1000,20000)
  },
  {
    name:'Third step',
    setup: builder.build_setup_standard(0.5,5000,1000,20000)
  },
  {
    name:'Fourth step',
    setup: builder.build_setup_loop(0.5,5000,1000,20000,0.5,1)
  },
  {
    name:'Fifth step',
    setup: builder.build_setup_standard(0.5,5000,1000,20000)
  }
];
var FlowSimulator = function() {
  this.process = [];
  this.process_definition = process_def;
}

FlowSimulator.prototype.getProcessDefinition = function(){
  return this.process_definition;
}
FlowSimulator.prototype.setProcessDefinition = function(definition){
  this.process_definition = definition;
}
FlowSimulator.prototype.config = function(instances,socket){
  var report = function(value){
    current_instance = value.activity.replace(/Instance\s/,'').replace(/\s\-\s.*/,'')
    current_step = value.activity.replace(/Instance\s\d+\s\-\s/,'')
    current_duration = value.duration
    output = {
      instance:current_instance,
      step:current_step,
      duration:current_duration
    };
    if(socket){
      socket.emit("report",output);
    }
    // else{
    //   console.log(output);
    // }
  }
  var results = function(results){
    result_data = _.map(results,function(value){
      val = _.first(value);
      current_instance = val.activity.replace(/Instance\s/,'').replace(/\s\-\s.*/,'');
      t_duration = _.reduce(value,function(acum,obj){
        return acum + obj.duration;
      },0);
      return {
        instance:current_instance,
        steps:value.length,
        duration:t_duration
      }
    });
    t_instances = result_data.length;
    longest = _.max(result_data,function(obj){
      return obj.duration;
    });
    shortest = _.min(result_data,function(obj){
      return obj.duration;
    });
    average = _.reduce(result_data,function(acum,obj){
      return acum + obj.duration;
    },0)/t_instances;

    output = {
      total_instances:t_instances,
      longest_instance:longest,
      shortest_instance:shortest,
      average_duration:average
    }

    if(socket){
      socket.emit("conclude",output);
    }
    // else{
    //   console.log(output);
    // }
  }
  this.process = require("./process.js")(this.process_definition,instances,report,results);

}
FlowSimulator.prototype.start = function(){
  par.apply(null,this.process)
}

module.exports = FlowSimulator;
