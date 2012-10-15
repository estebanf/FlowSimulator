var prob_check = function(probability){
  return Math.random() <= probability
}
var random_number = function(min,max){
  return Math.floor(min + (1+max-min)*Math.random())
}
var build_activity = function(name,setup,callback){
  if(!setup) setup = {};
  if(!setup.prob_standard_duration) setup.prob_standard_duration = 0.5;
  if(!setup.standard_duration) setup.standard_duration = 3000; // 3 secs average
  if(!setup.min_duration) setup.min_duration = 1000; // 1 secs
  if(!setup.max_duration) setup.max_duration = 10000; // 30 secs
  if(!setup.loop){
    setup.loop = false; //default to no loop
  }
  else{
    if(!setup.loop_target) throw "Bad setup - Missing loop_target";
    if(!setup.prob_loop) setup.prob_loop = 0.5;
  }
  var activity = function(err,value){
    duration = prob_check(setup.prob_standard_duration) ? setup.standard_duration : random_number(setup.min_duration,setup.max_duration);
    startTime = new Date();
    var self = this;
    setTimeout(function(){
      endTime = new Date();
      elapsed = Math.round((endTime.getTime() - startTime.getTime()));
      if(!value){
        value = []
      };
      results = {
        activity:name,
        start:startTime,
        end:endTime,
        duration:elapsed
      };
      value.push(results);
      if(callback){
        callback(results);
      }
      if(!setup.loop){
        self(err,value);
      }
      else{
        self.loop(function(){
          return prob_check(setup.prob_loop);
        },setup.loop_target,value);
      }
    },duration);    
  }
  return activity;
}
var build_setup_standard = function(prob_standard,standard,min,max){
  return{
    prob_standard_duration:prob_standard,
    standard_duration:standard,
    min_duration:min,
    max_duration:max
  };
}
var build_setup_loop = function(prob_standard,standard,min,max,loop_prob,target){
  setup = build_setup_standard(prob_standard,standard,min,max);
  setup.loop = true;
  setup.loop_target = target;
  setup.prob_loop = loop_prob;
  return setup;
}
var build_setup_conditional = function(prob_standard,standard,min,max,cond_prob,target_true,target_false){
  setup = build_setup_standard(prob_standard,standard,min,max);
  setup.conditional = true;
  setup.conditional_target_true = target_true;
  setup.conditional_target_false = target_false;
  setup.prob_conditional = cond_prob;
  return setup;
}

function FlowBuilder(){
  this.build_activity = build_activity;
  this.build_setup_standard = build_setup_standard;
  this.build_setup_loop = build_setup_loop;
  this.build_setup_conditional = build_setup_conditional;
}

module.exports = FlowBuilder;