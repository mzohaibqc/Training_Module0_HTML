
var menu1 = $("#menu1 li");
var menu2 = $("#menu2 li");

for(var i=0; i< menu1.length; i++){

	$( menu1[i] ).hover(

	  function() {
	  	console.log(this)
	      $(this).css('color', 'rgb(37, 0, 0)');
	  }, function() {
	    $( this ).find( "span:last" ).remove();
	});
}
