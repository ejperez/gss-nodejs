this.onmessage = function(event) {
	var response = {};
	response.sheets = [];							
	var ctr = 1;
	event.data.forEach(function(element, index){
		response.sheets.push({
			id: ctr++,
			title: element.title
		});
	});
	postMessage(response);
	self.close();
};
