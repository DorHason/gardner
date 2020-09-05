window.addEventListener('load', (loadEvent) => {
	console.log('Document has been loaded', loadEvent);
	
	async function fetchSession(operation, projectId){
		let response = await fetch(`${window.location.href}/projects/${projectId}/${operation}`, {
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       },
		credentials: 'include'
    });

		if (response.ok) { // if HTTP-status is 200-299
		  // get the response body (the method explained below)
		  // let json = await response.json();
			return;
		} else {
		  alert("HTTP-Error: " + response.status);
		}
		// console.log(json);
		// return json;
		return;
	}
	
	const startSessions = document.getElementsByClassName("continueSession");
	Array.from(startSessions).forEach(function(startSession) {
      startSession.addEventListener('click', clickEvent => {
		console.log('startSession button has been clicked', clickEvent);
		fetchSession('start', startSession.attributes.value.value).then("here" + console.log);
		startSession.innerText = "Stop";
		startSession.className = "btn btn-xs btn-dark stopSession";
		return;
	  });
    });
	
	const stopSessions = document.getElementsByClassName("stopSession");
	Array.from(stopSessions).forEach(function(stopSession) {
      stopSession.addEventListener('click', clickEvent => {
		console.log('stopSession button has been clicked', clickEvent);
		fetchSession('stop', stopSession.attributes.value.value).then("here" + console.log);
		stopSession.innerText = "Start";
		stopSession.className = "btn btn-xs btn-success continueSession";
		return;
	  });
    });
})