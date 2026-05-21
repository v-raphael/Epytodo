document
  .getElementById("btn-primary")
  .addEventListener("click", function () {
    const section4 = document.getElementById("sec1");
    const headerOffset = 90;
    const targetPosition = section4.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(targetPosition, 0),
      behavior: "smooth"
    });
});