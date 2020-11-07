function check(event) {
  var start = document.getElementById('leave').value;

  if (start <= new Date().toISOString().slice(0, 10)) {
    alert("Leave date must be later than today's date");
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}