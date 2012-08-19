var startCounter = function(){
	$("#countdown").countDown({
			targetDate: {
				 'day'   : 12,
				 'month' : 01,
				 'year'  : 2013,
				 'hour'  : 08,
				 'min'   : 00,
				 'sec'   : 00
			 },		
			omitWeeks: true
	});  
}
