document.querySelector('.nav-btn').onclick = function(e) {
   e.preventDefault();
   this.classList.toggle('is-on');
   document.getElementsByClassName("nav-list")[0].classList.toggle("is-on");
};
