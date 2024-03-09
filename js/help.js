let helpBox;

/**
 * Defines helpBox to be manipulated by other functions
 * @param {string} idHelpBox - ID of the Element to be set as HelpBox
 */
function defineHelpBox(idHelpBox) {
  helpBox = document.getElementById(idHelpBox);
}

/**
 * Moves HelpBox to the left or bottom of idTarget object 
 * @param {string} idHelpBox - ID of the Element to be set as HelpBox
 * @param {string} text - Text to be displayed inside helpBox
 */
function moveHelpBox(idTarget, text) {
    const target = document.getElementById(idTarget);
    // Ensure the target element exists
    if (!target) {
        console.error('Target element' + idTarget +'not found.');
        return;
        }

    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

    if (helpBox) {
        setTimeout(x => {
          helpBox.style.display = 'block';
          helpBox.innerHTML = text;
          helpBox.style.position = 'absolute';
          helpBox.classList.add("show");
          const rect = target.getBoundingClientRect();
          //Change position for mobile / desktop
          let helpBoxLeft;
          let helpBoxTop;
          if (vw > 1200) {
              helpBoxLeft = rect.left + window.scrollX - helpBox.offsetWidth - 20;
              helpBoxTop = rect.top + window.scrollY;
              helpBox.style.left = `${helpBoxLeft}px`;
          } else {
              helpBoxLeft = 0;
              helpBoxTop = rect.top + window.scrollY + rect.height + 20  ;
          }
          helpBox.style.top = `${helpBoxTop}px`;
        },1000);
    } else {
      console.error('helpBox element not found.');
    }
}

  function hideHelpBox(){
    const helpBox = document.getElementById('helpBox');
    helpBox.classList.remove("show");
  }