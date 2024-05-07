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
function moveHelpBox(idTarget, text, helpB = helpBox) {
    const target = document.getElementById(idTarget);
    // Ensure the target element exists
    if (!target) {
        console.error('Target element' + idTarget +'not found.');
        return;
        }

    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

    if (helpB) {
        setTimeout(x => {
          helpB.style.display = 'block';
          helpB.innerHTML = text;
          helpB.style.position = 'absolute';
          helpB.classList.add("show");
          const rect = target.getBoundingClientRect();
          //Change position for mobile / desktop
          let helpBoxLeft;
          let helpBoxTop;
          if (vw > 1200) {
              helpBoxLeft = rect.left + window.scrollX - helpB.offsetWidth - 20;
              helpBoxTop = rect.top + window.scrollY;
              helpB.style.left = `${helpBoxLeft}px`;
          } else {
              helpBoxLeft = 0;
              helpBoxTop = rect.top + window.scrollY + rect.height + 20  ;
          }
          helpB.style.top = `${helpBoxTop}px`;
        },1000);
    } else {
      console.error('helpBox element not found.');
    }
}

function centerHelpBox(text, helpB = helpBox) {
  let vw = window.innerWidth
  let vh = window.innerHeight

  if (helpB) {
      setTimeout(x => {
        helpB.style.display = 'block';
        helpB.innerHTML = text;
        helpB.style.position = 'absolute';
        helpB.classList.add("show");
        helpB.classList.add("helpboxNoArrow");
        //Change position for mobile / desktop
        let helpBoxLeft;
        let helpBoxTop;
        helpBoxLeft = vw / 2 - helpB.offsetWidth / 2;
        helpBoxTop = vh / 2 - helpB.offsetHeight / 2;
        helpB.style.left = `${helpBoxLeft}px`;
        helpB.style.top = `${helpBoxTop}px`;
      },1000);
  } else {
    console.error('helpBox element not found.');
  }
}

  function hideHelpBox(helpB = helpBox){
    const helpBox = document.getElementById('helpBox');
    helpB.classList.remove("show");
    helpB.classList.remove("helpboxNoArrow");
  }