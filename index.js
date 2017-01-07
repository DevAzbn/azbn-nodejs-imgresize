

var fs = require('fs');
var path = require('path');
var argv = require('optimist').argv;
var imager = require('imagemagick');
//var imager = require('lwip');


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

var AnalAndResize = function(path) {
	
	imager.identify(['-format', '%m', path], function(err, info){
		if (err) {
			console.log(err);
			return;
		}
		
		//console.log(info);
		console.log(path);
		
		switch(info) {
			
			case 'PNG' : {
				
				imager.resize({
					srcPath : path,
					dstPath : path,//+ '.resize.png'
					width : maxw,
					//height : maxh,
					format : info.format,
					quality : 1,
					//progressive : true,
				}, function(_err, stdout, stderr){
					if (_err) throw _err;
				});
				
			}
			break;
			
			case 'JPEG' : {
				
				imager.resize({
					srcPath : path,
					dstPath : path,//+ '.resize.jpg',
					width : maxw,
					//height : maxh,
					format : info.format,
					quality : 1,
					progressive : true,
				}, function(_err, stdout, stderr){
					if (_err) throw _err;
				});
				
			}
			break;
			
			default : {
				
			}
			break;
			
		}
		
		// { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
	});
	
}

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
			
			fs.stat(_file, function(err, stat) {
				
				if (stat && stat.isDirectory()) {
					
					walk(_file, function(err, res) {
						results = results.concat(res);
						if (!--pending) done(null, results);
					});
					
				} else if(in_masked > -1 && stat && stat.isFile()) {
					
					//results.push(file);
					//console.log(stat);
					
					//searchInFile(_file, re_search, argv.set);
					
					if(stat.size > maxsize) {
						
						switch(action) {
							
							case 'resize' : {
								AnalAndResize(_file);
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
		
	}
});
