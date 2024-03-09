var wordList = words;
var inputArray = [];
var tryhard = false;

//Listen for tryhard mode
document.addEventListener('DOMContentLoaded', function () {
    var checkbox = document.querySelector('input[type="checkbox"]#tryhardSwitch');
    checkbox.addEventListener('change', function () {
      if (checkbox.checked) {
        //tryhardmode turned on - rewrites recomendation
        tryhard = true;
        if(wordList[0] != "crane") {
            wordList.filter(word => word != "crane")
            wordList.unshift("crane")
        }
        currentRec = querryWords(null); 
        $("#output").text(currentRec);
        $("#recBlurb").text(`I'm sure you should try`);
      } else {
        //tryhardmode turned off - rewrites recomendation
        tryhard = false;
        currentRec = querryWords(null);
        $("#output").text(currentRec);
        writeCertainty();
      }
    });
  });

function querryWords (input) {
    //takes Array containing 5 letter word & results like:
    // [["W",0],["O",1],["R",0],["D",2],["S",0]]
    // 0 -> wrong, 1 -> almost, 2 -> right
    //pushes it to inputArray
    if (input != null) {
        return shortenWordList(input)[0];
    } else if (input == null && tryhard == false) {
        //if no array was given & tryhard mode is off, returns random word
        return getRandomWord();
    } else {
        //else (tryhard mode is on) returns best recomdendation
        return wordList[0];
    }
}

function shortenWordList (input) {
    //Reduce word list by all words that can be excluded based on input
    for (let i = 0; i < input.length; i++) {
        //Check if letter at i is wrong (0) and input doesn't contain an instance where it's right (2)
        if (input[i][1] == 0 && !input.some(function(e) {return e.includes(input[i][0]) && e.includes(2)})) {
            wordList = wordList.filter(function(value, index, arr){
                return !value.includes(input[i][0].toLowerCase());
            });
        } else if (input[i][1] == 1) {
            wordList = wordList.filter(function(value, index, arr){ 
                return ((value[0] == input[i][0].toLowerCase() 
                || value[1] == input[i][0].toLowerCase()
                || value[2] == input[i][0].toLowerCase() 
                || value[3] == input[i][0].toLowerCase()
                || value[4] == input[i][0].toLowerCase())
                && value[i] != input[i][0].toLowerCase());
            });
        } else if (input[i][1] == 2) {
            wordList = wordList.filter(function(value, index, arr){
                return value[i] == input[i][0].toLowerCase();
            });
        }
    }
    return wordList;
}

function getRandomWord () {
    return words[Math.floor(Math.random()*wordList.length)];
}

function getcertainty () {
    if (wordList.length == 0) return 0;
    return Math.round((1 / wordList.length * 100) * 1000) / 1000;
}

function pushWordToBack () {
    wordList.push(wordList.shift());
}

function writeCertainty() {
    debugger
    let certainty = getcertainty();
    if (certainty != 0) {
        $("#recBlurb").text(`I'm ${certainty}% sure you should try`);
    } else {
        impossibleWord();
    }
}

function impossibleWord() {
    $("#recBlurb").text(`The word you are looking for does not seem to exist. Did you enter something incorrectly? Please reload the page and try again.`);
    $("#recBlurb").toggleClass('falseInput');
    $("#output").text('???');
    $("#output").toggleClass('falseInput');
    throw new Error("Impossibe input. Reload Page")
}