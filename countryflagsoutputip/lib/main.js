
exports.main = function() {
	var widgets = require("sdk/widget");
	var tabs = require("sdk/tabs");
	var tmr = require('sdk/timers');
	var Request = require("sdk/request").Request;
	var data = require("sdk/self").data;
	var lastrequest = new Date().getTime();
	var lastrequestTor = new Date().getTime();
	var ss = require("sdk/simple-storage");
	
	var panelIP = require("sdk/panel").Panel({
	  width: 180,
	  height: 180,
	  contentURL: data.url('panel/popup.html')
	});

	

	const interval = 10000;
	require("sdk/tabs").on("ready", logURL);
	function logURL(tab) {
  		fetchIP();
	}


	function fetchTorNodeList(ip)
	{
		Request({
		  url: "http://torstatus.blutmagie.de/ip_list_exit.php/Tor_ip_list_EXIT.csv",
		  onComplete: function (response) {
		  	console.log("TOR header :" + response.status + " " + response.statusText);
		  	//console.log("TOR full text :" + response.text);
		  	console.log("last TOR timestamp :" + lastrequestTor);
		  	var now = new Date().getTime();
		  	var diff = now - lastrequestTor
		  	console.log("diff TOR time: " + diff);
		  	if (response.status == 200 && diff > interval) {
		  		
		  		let { has } = require('sdk/util/array');
		  		lastrequestTor = now;
		  		ss.storage.TorExitNodeArray = response.text.split("\n");		  		
		  		var isTorExit = has(ss.storage.TorExitNodeArray, ip)
		  		console.log("IS TOR NODE EXIT : " + isTorExit);
		  		console.log("COUNT TOR NODE EXIT IN SS: " + ss.storage.TorExitNodeArray.length);
		  		if (isTorExit) {
		  			widg.tooltip = widg.tooltip + " | " + "Tor Exit Node" + " | " + ip;
		  		} else {
		  			widg.tooltip = "";
		  		}

		  	}

		  }
		}).get();
		
	}

	function fetchIP(){
		Request({
		  url: "http://freegeoip.net/json/",
		  onComplete: function (response) {
		  	console.log("full text :" + response.status + " " + response.statusText);
		  	console.log("full json :" + response.text);
		  	console.log("last timestamp :" + lastrequest);
		  	var now = new Date().getTime();
		  	var diff = now - lastrequest
		  	console.log("diff time: " + diff);
		  	if (response.status == 200 && diff > interval) {
		  		lastrequest = now;
		  		var IPLocation = response.json;
			    console.log("IP: " + IPLocation.ip);
			    fetchTorNodeList(IPLocation.ip);
			    console.log("Coutry code: " + IPLocation.country_code);
			    var flag = IPLocation.country_code.toLowerCase() + ".png";
			    var currentFlag = widg.contentURL.split('/').pop();
			    console.log("Coutry code Flag: " + currentFlag);
			    console.log("Typeof currentFlag: " + typeof currentFlag);
			    console.log("Typeof flag: " + typeof flag);
			    console.log("URL : " + this.url);
			    console.log("Coutry Name: " + IPLocation.country_name);	    
			    if ( flag != currentFlag) {
			    	console.log("IP Changed ... from " + currentFlag + " to " + flag);
			    	//changeIcon(data.url('png/' + flag));
			    	widg.contentURL = data.url('png/' + flag);			  
			    }
			    widg.tooltip = IPLocation.country_name;
		  	}

		  }
		}).get();
	}

	var widg = widgets.Widget({
	  id: "exit-ip",
	  label: "Je sors d'où ?",
	  contentURL: data.url('png/question.png'),
	  panel: panelIP,
	  onClick: function() {
		fetchIP();
	  },
	  onAttach: function() {
	  	console.log("Chaque seconde compte !");
	  	fetchIP();
	  	tmr.setInterval(fetchIP, 60000);
	  }
	});

	
	//necessary for correct 
	function changeIcon(cURL){
	        var oldWidgetId         = widg.id;
	        var oldWidgetLabel      = widg.label;
	        var oldWidgetcontentURL = widg.contentURL;
	        
	       
	        widg.destroy();
	        widg = require("sdk/widget").Widget({
	          id: oldWidgetId,
	          label: oldWidgetLabel,
	          contentURL: cURL,
	          onAttach: function() {
	           
	            console.log("Chaque seconde compte 2 !");
	  			tmr.setInterval(checkIP, 5000);
	          }
	        });
	    }
	
	

}