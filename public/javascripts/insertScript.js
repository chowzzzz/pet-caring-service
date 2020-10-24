function check(event) {
	// Get Values
	var matric  = document.getElementById('matric' ).value;
	var name    = document.getElementById('name'   ).value;
	var faculty = document.getElementById('faculty').value;
	
	// Simple Check
	if(matric.length != 9) {
		alert("Invalid matric number");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(name.length == 0) {
		alert("Invalid name");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(faculty.length != 3) {
		alert("Invalid faculty code");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}