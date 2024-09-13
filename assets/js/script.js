function myFunction() {
  document.getElementById("demo").innerHTML = "Hello World";
}
console.log("hello");

// Hämta elementet
const box = document.getElementById("box");

// Lägg till en klickhändelse
box.addEventListener("click", function () {
  // Lägg till/ta bort klassen 'active' vid varje klick
  box.classList.toggle("active");
});

console.log("hejhej");
