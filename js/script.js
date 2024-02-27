var numAccents = 5;
var trackerAccent = [];
var trackerEnabled = true;

document.addEventListener("DOMContentLoaded", function (event) {
    //Create Accent elements for Mouse-Tracker effect to array
    if (trackerEnabled) {
        var element = document.getElementById("trackerAccentContainer");
    
        for (let i = 1; i <= numAccents; i++) {
            let accent = document.createElement("div");
            accent.id = 'trackerAccent' + i;
            element.appendChild(accent);
        }
        //Save Accent elements to trackerAccent array
        for (let i = 1; i <= numAccents; i++) {
            trackerAccent[i] = document.getElementById('trackerAccent' + i);
        }
        //Set starting position of Accents
        setInitialPosition();
    }


});

if (trackerEnabled) {
    const onMouseMove = (e) => {
        //On mouse move shift divs
        for (let i = 0; i < numAccents; i++) {
            trackerAccent[i + 1].style.left = e.pageX + 'px';
            trackerAccent[i + 1].style.top = e.pageY + 'px';
            trackerAccent[i + 1].style.transition = i * 0.15 + "s";
        }
    }
    document.addEventListener('mousemove', onMouseMove);
    
    //On window resize, reset divs position
    window.onresize = (event) => {
        setTimeout(function(){
            setInitialPosition();
        }, 100);
    };
    
    //Set startin position
    function setInitialPosition() {
        let posX = window.innerWidth / 2 + window.innerWidth * 0.07
        let posY = window.innerHeight / 2 + window.innerHeight * 0.16
        for (let i = 0; i < numAccents; i++) {
            trackerAccent[i + 1].style.left = posX + 'px';
            trackerAccent[i + 1].style.top = posY + 'px';
        }
    
    }
}

function portfolioLocked() {
    document.getElementById("buttonPortfolio").classList.add("animatedBG");
    document.getElementById("h2Portfolio").innerText = "LOCKED LOCKED";
    setTimeout(x => {
        portfolioReset();
            showPortfolioInfo();
    },3000);
}

function portfolioReset() {
    document.getElementById("buttonPortfolio").classList.remove("animatedBG");
    document.getElementById("h2Portfolio").innerText = "PORT-FOLIO"
}

function showPortfolioInfo() {
    if(document.getElementById("intrestedBubble").style.display == "block") {
        document.getElementById("intrestedBubble").classList.add("shake");
        setTimeout(x => {
            portfolioReset();
            document.getElementById("intrestedBubble").classList.remove("shake");
        },3000);
    } else {
        document.getElementById("intrestedBubble").style.display = "block";
        setTimeout(x => {
                document.getElementById("intrestedBubble").classList.add("show");
        },300);
    }
}


