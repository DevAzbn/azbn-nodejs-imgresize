module.exports = {
	__param : {},
	__argv : {},
	__mdl : {},
	__event : {},
	__is_dev : false,
	
	name : 'AzbNode',
	
	isDev : function(dev) {
		this.__is_dev = dev || true;
	},
	
	echo : function(text, tag) {
		console.log(this.formattime() + ': ' + (tag||this.name) + ': ' + text);
	},
	
	echo_dev : function(text, tag) {
		if(this.__is_dev) {
			this.echo(text, tag);
		}
	},
	
	len :function(arr) {
		if(this.is_def(arr) && !this.is_null(arr)) {
			return arr.length;
		} else {
			return 0;
		}
	},
	
	
	/* --------- Параметры объекта --------- */
	setParams : function(obj) {
		this.__param = obj;
		return this;
	},
	
	set : function(name, value) {
		this.__param[name] = value;
		return this;
	},
	
	get : function(name) {
		return this.__param[name];
	},
	/* --------- /Параметры объекта --------- */
	
	
	
	
	
	
	
	/* --------- Проверка на существование переменных и значений --------- */
	is_def : function(v) {
		if(v == undefined || typeof v == "undefined") {
			return false;
		} else {
			return true;
		}
	},
	
	is_null : function(v) {
		if(v == null) {
			return true;
		} else {
			return false;
		}
	},
	
	is_func : function(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	},
	/* --------- /Проверка на существование переменных и значений --------- */
	
	
	
	/* --------- Функции времени --------- */
	now : function() {
		return new Date().getTime();
	},
	
	formattime : function(m) {
		m = m || this.now();
		var x = new Date(m);
		var d = {
			Y	: x.getFullYear(),
			m	: (x.getMonth() + 1),
			d	: x.getDate(),
			H	: x.getHours(),
			i	: x.getMinutes(),
			s	: x.getSeconds(),
			ms	: x.getMilliseconds(),
		};
		var D = {};
		for(var n in d) {
			D[n] = (parseInt(d[n], 10) < 10 ) ? ('0' + d[n]) : (d[n]);
		}
		D.ms = (parseInt(D.ms, 10) < 100 ) ? ('0' + D.ms) : (D.ms);
		var z = '' + D.Y + D.m + D.d + '.' + D.H + D.i + D.s + '.' + D.ms;
		return z;
	},
	
	sleep : function(milliSeconds) {
		var startTime = this.now();
		while (this.now() < startTime + milliSeconds);
	},
	/* --------- /Функции времени --------- */
	
	
	/* --------- Параметры командной строки --------- */
	parseArgv : function(sym) {
		for (var i = 0; i < process.argv.length; i++) {
			var arr = process.argv[i].split(sym||"=");
			this.__argv[arr[0]] = arr[1];
		}
	},
	
	getArgv : function(name) {
		return this.__argv[name];
	},
	/* --------- /Параметры командной строки --------- */
	
	
	/* --------- Модули --------- */
	load : function(name, mdl) {
		this.__mdl[name] = mdl;
		/*
		if(!this.is_def(this.__mdl[name].azbn) || this.is_null(this.__mdl[name].azbn)) {
			this.__mdl[name].azbn = this;
		}
		*/
		return this;
	},
	
	unload : function(name) {
		this.__mdl[name] = null;
		delete this.__mdl[name];
		return this.is_def(this.__mdl[name]);
	},
	
	mdl : function(name) {
		return this.__mdl[name];
	},
	/* --------- /Модули --------- */
	
	
	/* --------- События --------- */
	
	regEvent : function(name, uid, fnc) {
		if(this.is_def(this.__event[name])) {
			
		} else {
			this.__event[name] = {};
		}
		//return this.__event[name].push(fnc);
		this.__event[name][uid] = fnc;
		return this.len(this.__event[name]);
	},
	event : function(name, prm) {
		if(this.is_def(this.__event[name])) {
			/*
			for (var i = 0; i < this.len(this.__event[name]); i++) {
				var code = this.__event[name][i];
				code(prm);
			}
			*/
			/*
			this.__event[name].forEach(function(code, i, functions){
				code(prm);
			});
			*/
			for(var uid in this.__event[name]) {
				if(this.is_func(this.__event[name][uid])) {
					this.__event[name][uid](prm);
				}
			}
		}
	},
	unregEvent : function(name, uid) {
		if(this.is_def(this.__event[name][uid]) && !this.is_null(this.__event[name][uid])) {
			delete this.__event[name][uid];
		}
	},
	clearEvent : function(name) {
		this.__event[name] = [];
	}
	
	/* --------- /События --------- */
	
	
	
};