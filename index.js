
var cfg = {
	path : {
		azbnode : './azbnode',
	},
};

var files = [];

var fs = require('fs');
var path = require('path');
var argv = require('optimist').argv;
//var imager = require('imagemagick');

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
		fmask = argv.fmask ? new RegExp('(' + argv.fmask + ')', 'ig') : new RegExp('(post-big)', 'ig')
;

var AnalAndResize = function(path) {
	
	azbn.mdl('imager').identify(['-format', '%m.%w.%h', path], function(__err, info){
		
		if (__err) {
			
			azbn.echo(__err);
			return;
			
		} else {
			
			var __p = info.split('.');
			
			if(1) {//__p[1] > maxw
			//for(var j = 1; j < 10; j++) {
				
				//__p[0] = 'JPEG';
				
				var args = {
					srcPath : path,
					dstPath : path,
					width : maxw,
					//height : maxh,
					format : __p[0],//.format,
				};
				
				if(__p[1] < maxw) {
					args.width = __p[1];
				}
				
				switch(__p[0]) {
					
					case 'JPEG' : {
						args.quality = 0.85;
						args.progressive = true;
					}
					break;
					
					case 'PNG' : {
						//args.quality = 1;
						//args.progressive = true;
					}
					break;
					
					default : {
						
					}
					break;
					
				}
				
				azbn.mdl('resizer.queue')
					.add(function(next){
						
						azbn.echo('Set queue-item (' + __p[0] + '): ' + path);
						
						azbn.mdl('imager').resize(args, function(___err, stdout, stderr){
							
							if (___err) {
								console.log(___err);
							} else {
								azbn.echo('Resized: ' + path);
							}
							
						});
						
						next();
						
					}, 169)
				;
				
			}
			
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
					
				} else if(in_masked == -1 && stat && stat.isFile()) {//in_masked > -1 && 
					
					//results.push(file);
					//console.log(stat);
					
					//searchInFile(_file, re_search, argv.set);
					
					if(stat.size > maxsize) {
						
						switch(action) {
							
							case 'resize' : {
								//console.log('Before insert to queue ' + _file);
								
								//AnalAndResize(_file);
								files.push(_file);
								
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

walk(root, function(err, res){
	
	if(err) {
		
		console.log(err);
		
	} else {
		
		if(files.length) {
			
			for(var i = 0; i < files.length; i++) {
				
				AnalAndResize(files[i]);
				
			}
			
		}
		
	}
	
});
