
var cfg = {
	path : {
		azbnode : './azbnode',
	},
};

var fs = require('fs');
var path = require('path');
var argv = require('optimist').argv;
//var imager = require('imagemagick');
var vow = require('vow');

var	Queue = require('vow-queue'),
	queue = new Queue({ weightLimit : 3 });

var azbn = require(cfg.path.azbnode + '/azbnode');
//var imager = require('lwip');

azbn.load('imager', require('imagemagick'));

azbn.load('azbnodeevents', new require(cfg.path.azbnode + '/azbnodeevents')(azbn));
azbn.load('resizer.queue', new require(cfg.path.azbnode + '/azbnodecodestream')(azbn));

azbn.event('loaded_azbnode', azbn);


if(argv.help) {
	console.log('\t--maxw="2048"\t\t\tМаксимальная ширина, пикс.'); // argv.maxw
	//console.log('\t--maxh="2048"\t\tМаксимальная высота, пикс.'); // argv.maxh
	console.log('\t--maxsize="1024"\t\tМаксимальный размер файла, кБайт'); // argv.maxh
	console.log('\t--dir="строка"\t\t\tДиректория поиска (по умолчанию ./)'); // argv.dir
	console.log('\t--action="resize|find"\t\t\tДействие с найденным (по умолчанию resize)'); // argv.dir
	//console.log('\t--set="строка"\t\tЗаменять на (по умолчанию не заменяет)'); // argv.set
	//console.log('\t--fmask="строка"\tПоиск только в файлах, в имени которых есть данная строка'); // argv.fmask
	//console.log('\t--help\t\t\tВывод этой справки'); // argv.help
	process.exit(0);
}


var		root = argv.dir ? argv.dir : './',
		maxw = argv.maxw ? parseInt(argv.maxw) : 2048,
		//maxh = argv.maxh ? parseInt(argv.maxh) : 2048,
		maxsize = argv.maxsize ? (parseInt(argv.maxsize) * 1024) : (1024 * 1024),
		action = argv.action ? argv.action : 'resize',
		//re_search = new RegExp('(' + argv.search + ')', 'ig'),
		fmask = argv.fmask ? new RegExp('(' + argv.fmask + ')', 'ig') : new RegExp('(.jpg|.png)', 'ig')
;

var __resize = function(type, file) {
	
	//azbn.mdl('resizer.queue')
	//	.add(function(next){
			
			console.log('Before AnalAndResize (' + type + '): ' + file);
			
			switch(type) {
				
				case 'PNG' : {
					
					azbn.mdl('imager').resize({
						srcPath : path,
						dstPath : path,//+ '.resize.png'
						width : maxw,
						//height : maxh,
						format : type,//.format,
						//quality : 1,
						//progressive : true,
					}, function(___err, stdout, stderr){
						
						if (___err) {
							console.log(___err);
						}
						
						//console.log(path);
						console.log('Resized: ' + file);
						
						//next();
						
					});
					
				}
				break;
				
				case 'JPEG' : {
					
					azbn.mdl('imager').resize({
						srcPath : path,
						dstPath : path,//+ '.resize.jpg',
						width : maxw,
						//height : maxh,
						format : type,//.format,
						quality : 1,
						progressive : true,
					}, function(___err, stdout, stderr){
						
						if (___err) {
							console.log(___err);
						}
						
						//console.log(path);
						console.log('Resized: ' + file);
						
						//next();
						
					});
					
				}
				break;
				
				default : {
					
					//next();
					
				}
				break;
				
			}
			
	//	next();
	//	
	//}, 333)
	//;
	
};

var AnalAndResize = function(path) {
	
	azbn.mdl('imager').identify(['-format', '%m', path], function(__err, info){
		
		if (__err) {
			
			console.log(__err);
			return;
			
		} else {
			
			__resize(info, path);
			
		}
		
		// { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
	});
	
	//next();
	
};

var walk = function(dir, done) {
	
	var results = [];
	
	fs.readdir(dir, function(err, list) {
		
		if (err) return done(err);
		
		var pending = list.length;
		
		if (!pending) return done(null, results);
		
		list.forEach(function(file) {
			
			var in_masked = 0;
			
			if(fmask != false) {
				in_masked = file.search(fmask);//fmask.test(file);
			}
			
			var _file = path.normalize(path.resolve(dir, file));
			//console.log(':' + _file);
			
			fs.stat(_file, function(_err, stat) {
				
				if (stat && stat.isDirectory()) {
					
					walk(_file, function(_err, res) {
						results = results.concat(res);
						if (!--pending) done(null, results);
					});
					
				} else if(stat && stat.isFile()) {//in_masked > -1 && 
					
					//results.push(file);
					//console.log(stat);
					
					//searchInFile(_file, re_search, argv.set);
					
					if(stat.size > maxsize) {
						
						switch(action) {
							
							case 'resize' : {
								//console.log('Before insert to queue ' + _file);
								
								queue.enqueue(function() { // function returns a promise
									
									azbn.mdl('imager').identify(['-format', '%m', _file], function(__err, info){
										
										if (__err) {
											
											console.log(__err);
											return;
											
										} else {
											
											__resize(info, _file);
											
										}
										
										// { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
									});
									
									return promise;
								});
								
							}
							break;
							
							case 'find' : {
								console.log(_file);
							}
							break;
							
							default : {
								
							}
							break;
							
						}
						
					}
					
					if (!--pending) done(null, results);
					
				}
				
			});
			
		});
		
	});
	
};

queue.start();

walk(root, function(err, res){
	if(err) {
		console.log(err);
	} else {
		
	}
});
