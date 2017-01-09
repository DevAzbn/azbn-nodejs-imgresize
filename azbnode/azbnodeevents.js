/*
события AzbNode
*/

function AzbNodeEvents(azbn) {
	this.name = 'AzbNodeEvents';
	var log_name = this.name;
	
	//azbn.echo('Created', this.name);

	azbn.regEvent('loaded_azbnode', 'azbnodeevents', function(prm){
		azbn.echo('loaded_azbnode', log_name);
	});
	azbn.regEvent('loaded_mdls', 'azbnodeevents', function(prm){
		azbn.echo('loaded_mdls', log_name);
	});
	azbn.regEvent('parsed_argv', 'azbnodeevents', function(prm){
		azbn.echo('parsed_argv', log_name);
	});
	azbn.regEvent('eval_script', 'azbnodeevents', function(prm){
		azbn.echo('eval_script', log_name);
	});
}

module.exports = AzbNodeEvents;