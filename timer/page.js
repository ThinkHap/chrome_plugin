chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if ($(request.qs)){
		borderAll($(request.qs));
		sendResponse({obj: $(request.qs).toString(), length: $(request.qs).length});
		console.log($(request.qs));
	 }
    else{
      sendResponse({}); // snub them.
	 }
	 
	 function borderAll(els){
		$(els).css('border','1px red solid');
		window.setTimeout(function(){
			$(els).css('border','0px red solid');
		},700)
		window.setTimeout(function(){
			$(els).css('border','1px red solid');
		},1400)
		window.setTimeout(function(){
			$(els).css('border','0px red solid');
		},2100)

	 }
	 
  });