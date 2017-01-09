/*
приложение вконтакте
*/
var util = require('util'),
	EventEmitter = require('events').EventEmitter;

var CS = function(){
	this.o = this;
};

util.inherits(CS, EventEmitter);

function AzbNodeCodeStream(azbn) {
	
	var log_name = 'azbnodecodestream';
	
	//var ctrl = this;
	
	var	tasks = [];
	
	var stream = new CS();
	
	stream.in_action = false;
	
	stream.add = function(t, __sleep_time) {
		tasks.push({task : t, sleep_time : __sleep_time || 100});
		stream.emit('task:add');
		return stream;
	}
	
	stream.run = function(task) {
		stream.emit('task:start');
		var ok = function(msg) {
			if(msg) {
				console.log(msg);
			}
			stream.emit('task:end');
		};
		azbn.sleep(task.sleep_time);
		task.task(ok);
	}
	
	stream.on('task:add', function(){
		if(tasks.length) {
			while(stream.in_action) {
				
			}
			stream.run(tasks.shift());
		}
	});
	stream.on('task:start', function(){
		stream.in_action = true;
	});
	stream.on('task:end', function(){
		stream.in_action = false;
	});
	
	return stream;
}

module.exports = AzbNodeCodeStream;
