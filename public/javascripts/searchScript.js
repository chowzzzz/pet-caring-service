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
  let list = document.getElementsByClassName("form2");
  for (let form of list) {
    form.action += "&start="
      + document.getElementById('start').value + "&end="
      + document.getElementById('end').value;
  }
  return true;
}

function setDefaultDates() {
  let date = new Date();
  date.setDate(date.getDate() + 1);
  document.getElementById('start').defaultValue = date.toISOString().slice(0, 10);
  date.setDate(date.getDate() + 1);
  document.getElementById('end').defaultValue = date.toISOString().slice(0, 10);
}

function check(event) {
  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;

  if (start >= end) {
    alert("Start date must be earlier than end date");
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  if (start <= new Date().toISOString().slice(0, 10)) {
    alert("Start date must be later than today's date");
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}