'use strict';
var app = angular.module('FlowSimulator',[]);

app.factory('socket',function ($rootScope){
  var socket = io.connect();
  return{
    on:function(eventName,callback){
      socket.on(eventName,function(){
        var args = arguments;
        $rootScope.$apply(function(){
          callback.apply(socket,args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

function SimulatorController($scope,socket){
  $scope.showConfig = true
  $scope.currentAction = "Add new step";
  $scope.instances = [];
  socket.on('init',function(data){
    $scope.definitions = data;
  })
  socket.on('report',function(data){
    $scope.instances[data.instance] = data;
  })
  socket.on('conclude',function(data){
    $scope.status = 'Ready';
    $scope.results = data;
    $scope.showConfig = true
  })
  $scope.start = function(){
    $scope.showConfig = false
    $scope.instances = new Array($scope.instanceCount);
    socket.emit('start_simulation',{definition:$scope.definitions,instances:$scope.instanceCount})
  }
  $scope.delete = function(index){
    if($scope.definitions[index]){
        $scope.definitions.splice(index,1);
    }
  }
  $scope.edit_definition = function(index){
    if($scope.definitions[index]){
      $scope.current_definition = $scope.definitions[index];
      $scope.currentAction = "Edit step " + index;
      $scope.currentIndex = index;

    }
  }
  $scope.done = function(){
    if(!$scope.currentIndex){
      $scope.definitions.push($scope.current_definition);
    }
    $scope.current_definition = {}
    $scope.currentAction = 'Add new step';
    $scope.currentIndex = null;
  }
}