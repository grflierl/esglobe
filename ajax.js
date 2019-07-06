function getAjax(url, success) {
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new
  ActiveXObject('Microsoft.XMLHTTP'); 
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState>3 && xhr.status==200) success(xhr.responseText);
  }; 
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send();
  return xhr;
}

function logit(s){
//  console.log(s);
}
var ajax = {
    "get":function (url, success) {
	var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new
	ActiveXObject('Microsoft.XMLHTTP'); 
	xhr.open('GET', url);
	xhr.onreadystatechange = function() {
	    if (xhr.readyState>3 && xhr.status==200) success(xhr.responseText);
	}; 
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xhr.send();
	return xhr;
    },
    logit: function(s){
	console.log(s);
    }
};

