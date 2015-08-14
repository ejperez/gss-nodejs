this.onmessage = function(event) {	
	if (event.data.hasOwnProperty('rows')){
		var response = [];
	
		var prefix = 'gsx:';
		
		event.data.rows.forEach(function(row){
			var xml = row._xml;
			var obj = {};
			
			// Remove tags that do not have prefix
			var firstIndex = xml.indexOf(prefix);
			var sub = xml.substring(firstIndex - 1);	
			
			// Find all tag names with prefix
			while (sub.indexOf(prefix) != -1){
				var openingTagIndex = sub.indexOf('<' + prefix);
				var closingTagIndex = sub.indexOf('>');
				
				var tagName = sub.substring(openingTagIndex + 1, closingTagIndex).replace(prefix, '');
				
				var closingTagIdx = sub.indexOf('</' + prefix + tagName);
				var tagValue = sub.substring(openingTagIndex + prefix.length + tagName.length + 2, closingTagIdx);
				
				obj[tagName] = tagValue;
				
				sub = sub.substring(closingTagIdx + + prefix.length + tagName.length + 3);
			}
			
			response.push(obj);
		});
		
		postMessage(response);
	} else {
		postMessage(null);
	}	
	
	self.close();	
};