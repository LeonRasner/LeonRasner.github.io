var currentRow = 1;
var lastClicked = "cell-1-1";
var lastClickedTemp;
var currentRec = getRandomWord();
var autofill = false;

$(document).ready(function () {
    //TODO: i won button
    //TODO: Instructions & Help Section

    //Asign 5 letter word as Recomendation
    currentRec = querryWords(null);
    $("#output").text(currentRec);


    //Select container by click
    $("#inputContainer").on('click', '.clickable', function (e) {
        if (lastClicked != null) { $(`#${lastClicked}`).removeClass("selected") }
        lastClicked = e.target.id;
        if ($(e.target).hasClass("clickable")) { $(`#${lastClicked}`).addClass("selected"); }
    });

    //Virtual Keyboard
    $(".key").click(function (el) {
        let key = $(this).attr("data-key");
        if (key.match(/[a-z]/i) && lastClicked !== null) {
            $(`#${lastClicked}`).text(key);
            selectNext();
        };
        checkRowSelected();
    })

    //Real Keypress
    $(document).keyup(function (e) {
        //Input Letter
        if (e.which > 64 && e.which < 91) {
            let key = e.key.toUpperCase();
            if (key.match(/[a-z]/i) && lastClicked !== null) {
                $(`#${lastClicked}`).text(key);
                selectNext();
            };
            checkRowSelected();
        //Enter
        } else if (e.which == 13 && checkRowSelectedALT()) {
            enterWord();
        } else if (e.which == 13 && checkClickableNext()) {
            finishRow();
        //Backspace
        } else if (e.which == 8) {
            //Delete Cell content & selct previous cell
            selectPrevious()
            checkRowSelected()
        }
    });
    
    //Button Press (Enter)
    $("#inputContainer").on('click', `.btnClickable`, function (e) {
        enterWord();
    });

    //Virtual keybaord Enter
    $("#keyboardContainer").on('click', `#enterKey`, function (e) {
        if (checkRowSelectedALT()) {
            enterWord();
        } else if (checkClickableNext()) {
            finishRow();
        }
    });

    //Virtual keybaord Backspace
    $("#keyboardContainer").on('click', `#backspaceKey`, function (e) {
        selectPrevious()
        checkRowSelected()
    });

    $("#inputContainer").on('click', `.btnClickableNext`, function (e) {
        finishRow();
    });
     
    //Listen for btnAnother
    $("#outputContainer").on('click', '#btnAnother', function (e) {
    console.log("a")
    if ($(".btnClickableNext").length == 0 && $(".btnWait").length == 0) {
        console.log("B")
        anotherRec();
        
    }
});
});

//Listen for autofill mode
document.addEventListener('DOMContentLoaded', function () {
    var checkbox = document.querySelector('input[type="checkbox"]#autofillSwitch');
    checkbox.addEventListener('change', function () {
      if (checkbox.checked) {
        //autofill turned on
        autofill = true;
        autofillRec(currentRec);
      } else {
        //autofill turned off
        autofill = false;
      }
    });
  });

//Listen for btnAnother
document.addEventListener('DOMContentLoaded', function () {
    var button = document.querySelector('button[type="button"]#btnAnother');
    button.addEventListener('click', function () {
        if ($(".btnClickableNext").length == 0 && $(".btnWait").length == 0) {
            anotherRec();
            if(autofill) {
                autofillRec(currentRec);
            }
        }
    });
  });

function inputResults() {
    for (let i = 1; i < 6; i++) {
        $(`#cell-${i}-${currentRow}`).addClass("clickableResult");
        $(`#cell-${i}-${currentRow}`).addClass("clickableResultEmpty");
    }
    let lettersInput = 0;
    $("#inputContainer").on('click', '.clickableResult', function (e) {
        let target = e.target;
        if ($(target).hasClass("clickableResultEmpty")) {
            $(target).removeClass("clickableResultEmpty")
            $(target).addClass("clickableResultNo")
            lettersInput = lettersInput + 1;
        } else if ($(target).hasClass("clickableResultNo")) {
            $(target).removeClass("clickableResultNo")
            $(target).addClass("clickableResultAlmost")
        } else if ($(target).hasClass("clickableResultAlmost")) {
            $(target).removeClass("clickableResultAlmost")
            $(target).addClass("clickableResultYes")
        } else {
            $(target).removeClass("clickableResultYes")
            $(target).addClass("clickableResultNo")
        }
        if (lettersInput > 4) {
            $(`#btnRow${currentRow}`).removeClass("btnWait");
            $(`#btnRow${currentRow}`).addClass("btnClickableNext");
            lettersInput = 0;
        }
    });

}

function buildResultArray() {
    let result = [];
    for (let i = 1; i < 6; i++) {
        if ($(`#cell-${i}-${currentRow}`).hasClass("clickableResultNo")) {
            result.push([$(`#cell-${i}-${currentRow}`).text(), 0]);
        } else if ($(`#cell-${i}-${currentRow}`).hasClass("clickableResultAlmost")) {
            result.push([$(`#cell-${i}-${currentRow}`).text(), 1]);
        } else if ($(`#cell-${i}-${currentRow}`).hasClass("clickableResultYes")) {
            result.push([$(`#cell-${i}-${currentRow}`).text(), 2]);
        }
    }
    return result;
}

//Itterates lastSelected & selected one to the rigth or, if at last letter, to first letter of next row.
function selectNext() {
    if (lastClicked.slice(5, 6) != "5") {
        $(`#${lastClicked}`).removeClass("selected")
        lastClicked = lastClicked.slice(0, 5) + (parseInt(lastClicked.slice(5, 6)) + 1) + lastClicked.slice(6, 8);
        $(`#${lastClicked}`).addClass("selected");
    }
}

//Itterates lastSelected & selected one to the left except if first letter & deletes last typed letter.
function selectPrevious() {
    if (lastClicked.slice(5, 6) == "5" && $(`#${lastClicked}`).text() != "") {
        $(`#${lastClicked}`).text("");
    }
    else if (lastClicked.slice(5, 6) != "1") {
        $(`#${lastClicked}`).removeClass("selected")
        lastClicked = lastClicked.slice(0, 5) + (parseInt(lastClicked.slice(5, 6)) - 1) + lastClicked.slice(6, 8);
        $(`#${lastClicked}`).addClass("selected");
        $(`#${lastClicked}`).text("");
    }
}

function selectNextline() {
    lastClicked = lastClickedTemp.slice(0, 5) + "1" + lastClickedTemp.slice(6, 7) + (parseInt(lastClickedTemp.slice(7, 8)) + 1);
    $(`#${lastClicked}`).addClass("selected");
} 

function enterWord() {
    if (checkBtnClickable()) {
        $(`#btnRow${currentRow}`).removeClass("btnClickable")
        //lock previous row
        for (let i = 1; i < 6; i++) {
            $(`.selected`).removeClass("selected")
            $(`#cell-${i}-${currentRow}`).removeClass("clickable");
        }
        if (lastClicked != null) { lastClickedTemp = lastClicked };
        lastClicked = null;
        $(`#btnRow${currentRow}`).addClass("btnWait")
        //Input Results & Unlock .btnClickableNext
        inputResults()
    }
}

function finishRow () {
    //Lock result inputs
    $("#inputContainer").off('click', '.clickableResult');
    for (let i = 1; i < 6; i++) {
        $(`#cell-${i}-${currentRow}`).removeClass("clickableResult");
    }
    //Querry Result
    currentRec = querryWords(buildResultArray());

    //Rewrite recomendation
    $("#output").text(currentRec);
    $("#recBlurb").text(`I'm ${getcertainty()}% sure you should try`);

    //Lock Button
    $(`#btnRow${currentRow}`).removeClass("btnClickableNext");
    //unlock next row
    currentRow = currentRow + 1;
    for (let i = 1; i < 6; i++) {
        $(`#cell-${i}-${currentRow}`).addClass("clickable");
    }
    //Autofill Result
    if(autofill) {
        autofillRec(currentRec);
    }
    selectNextline();
}

function anotherRec() {
        //push currrent rec to back of list
        pushWordToBack ();
        //give new rec
        currentRec = querryWords(null);
        //Rewrite recomendation
        $("#output").text(currentRec);
        //Rewrite blurb
        $("#recBlurb").text(`I'm ${getcertainty()}% sure you should try`);
}

function autofillRec(recomendation) {
    for (let i = 0; i < 5; i++) {
        $(`#cell-${i+1}-${currentRow}`).text(recomendation[i].toUpperCase());
    }
    $(`#btnRow${currentRow}`).removeClass("btnWait");
    $(`#btnRow${currentRow}`).removeClass("btnClickableNext");
    $(`#btnRow${currentRow}`).addClass("btnClickable");
}

function checkRowSelected() {
    if ($(".clickable:empty").length == 0 && $(".btnClickableNext").length == 0 && $(".btnWait").length == 0 ) {
        $(`#btnRow${currentRow}`).addClass("btnClickable");
        return true;
    } else {
        $(`#btnRow${currentRow}`).removeClass("btnClickable");
        return false;
    }
};

function checkRowSelectedALT() {
    if ($(".clickable:empty").length == 0 && $(".btnClickableNext").length == 0) {
        return true;
    } else return false;
};

function checkClickableNext() {
    if ($(".btnClickableNext").length != 0) {
        return true;
    } else return false;
};

function checkBtnClickable () {
    if ($(".btnClickable").length != 0) return true;
    else return false;
}