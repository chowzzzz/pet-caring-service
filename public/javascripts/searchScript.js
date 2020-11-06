function toggleOptional(event) {
  var div = document.getElementById("optional");
  var button = document.getElementById("toggler");
  if (div.style.display === "none") {
    div.style.display = "block";
    button.innerHTML = "Remove Filters";
  } else {
    div.style.display = "none";
    button.innerHTML = "Add Filters";
  }
}

function getDates() {
  document.getElementById("form2").action += "&start="
    + document.getElementById('start').value + "&end="
    + document.getElementById('end').value;
  return true;
}

function setDefaultDates() {
  document.getElementById('start').defaultValue = new Date().toISOString().slice(0, 10);
  document.getElementById('end').defaultValue = new Date().toISOString().slice(0, 10);
} s