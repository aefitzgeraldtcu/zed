const popup = document.getElementById("welcomePopup");
const closeBtn = document.getElementById("closePopup");

popup.showModal();

closeBtn.onclick = () => popup.close();

popup.addEventListener("click", e => {
  if (e.target === popup) popup.close();
});