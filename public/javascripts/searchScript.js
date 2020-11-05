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
