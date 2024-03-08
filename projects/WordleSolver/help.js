function setHelpBox(idTarget, text) {
    const target = document.getElementById(idTarget);
    // Ensure the target element exists
    if (!target) {
        console.error('Target element' + idTarget +'not found.');
        return;
        }
    // Get the bounding rectangle of the target
    const helpBox = document.getElementById('helpBox');
    helpBox.style.display = 'block';
    helpBox.innerHTML = text;

    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)


    if (helpBox) {
        helpBox.style.position = 'absolute';
        helpBox.classList.add("show");
        const rect = target.getBoundingClientRect();
        //Change position for mobile / desktop
        if (vw > 1200) {
            const helpBoxLeft = rect.left + window.scrollX - helpBox.offsetWidth - 20;
            const helpBoxTop = rect.top + window.scrollY + 12;
            helpBox.style.left = `${helpBoxLeft}px`;
            helpBox.style.top = `${helpBoxTop}px`;
        } else {
            const helpBoxLeft = rect.left + window.scrollX;
            const helpBoxTop = rect.top + window.scrollY + rect.height + 22; 
            
            helpBox.style.left = `${helpBoxLeft}px`;
            helpBox.style.top = `${helpBoxTop}px`;
        }
    } else {
      console.error('helpBox element not found.');
    }
}

  function hideHelpBox(){
    const helpBox = document.getElementById('helpBox');
    helpBox.classList.remove("show");
  }