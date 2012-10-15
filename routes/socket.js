var simulator_lib = require('../lib/flow_simulator.js');
var simulation = new simulator_lib();
module.exports = function(socket){
  socket.emit('init',simulation.getProcessDefinition());;
  socket.on('start_simulation',function(data){
    if(data.definition){
      simulation.setProcessDefinition(data.definition);
    }
    simulation.config(data.instances,socket);
    simulation.start();
  });
}