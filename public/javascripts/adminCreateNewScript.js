function check(event) {
	// Get Values
	var username  = document.getElementById('username').value.trim();
	var name = document.getElementById('name').value.trim();
	var email = document.getElementById('email').value.trim();
	var password = document.getElementById('password').value.trim();

	if (username.length > 20) {
		alert("Username can only have up to 20 characters!");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (username.length == 0) {
		alert("Invalid username!");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (name.length == 0) {
		alert("Invalid name!");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (email.length == 0 || !email.includes("@")) {
		alert("Invalid email!");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (password.length > 0 && password.length < 8) {
		alert("Password must consist of at least 8 characters!");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (password.length == 0) {
		alert("Invalid password!");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}