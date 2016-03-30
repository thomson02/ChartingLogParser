var fs = require('fs');
var lineByLine = require('n-readlines');
var Canvas = require('canvas');
var Chart = require('nchart');
var _ = require('underscore');

var onError = function(err) {
	console.log(err);
};

var STRING_TO_FIND  = "";
var dirName = process.argv[2] || 'logs';

fs.readdir("./" + dirName, function(err, filenames) {
    
	if (err) {
      onError(err);
      return;
    }
	
	var datasets = {};
	
    filenames.forEach(function(filename) {
      
	  var liner = new lineByLine("./" + dirName + "/" + filename);
	  
	  var line;
	  var lineNumber = 0;
	  while (line = liner.next()) {
			
			line = line.toString('ascii');
			
			if (line.indexOf(STRING_TO_FIND) >= 0) {
				
				var date = line.substring(0, line.indexOf(' '));
				var timeDate = line.substring(0, line.indexOf('\t'));
				var seconds = line.substring(line.indexOf('duration') + 9, line.indexOf(' seconds', line.indexOf('duration') + 7));
				
				if (!datasets[date]) {
					datasets[date] = { labels: [], data: [] };
				}
				
				datasets[date].labels.push(timeDate);
				datasets[date].data.push(seconds);				
			}
			
			lineNumber++;
	  }
    });
	
	
	_.each(datasets, function(value, key){
		
		var canvas = new Canvas(909, 455);
		var ctx = canvas.getContext('2d');
			
		var data = { 
			labels: value.labels,
			datasets: [{
					label: dirName + ' - ' + key,
					fillColor: "rgba(151,187,205,0.2)",
					strokeColor: "rgba(151,187,205,1)",
					pointColor: "rgba(151,187,205,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(151,187,205,1)",
					data: value.data
				}]
		};
		
		var options = {
			scaleOverride : true,
			scaleSteps : 7,
			scaleStepWidth : 500,
			scaleStartValue : 0				
		};
		
		new Chart(ctx).Line(data, options);
		
		canvas.toBuffer(function (err, buf) {
		  if (err) { throw err; }
		  fs.writeFile(__dirname + '/' + dirName + '-' + key.replace(/\//g, '.') + '.png', buf);
		});
				
	});
});
