//Calc Age
const today = new Date();
const birth = new Date("1996-03-18");
let age = today.getFullYear() - birth.getFullYear();
const monthDifference = today.getMonth() - birth.getMonth();
if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age--;
}
document.getElementById('detailsAtaglance').innerText = "Name: Leon\u00A0Rasner | Age:\u00A0" + age + " | Nationality: AT | City\u00A0of\u00A0residence: Vienna";

document.addEventListener("DOMContentLoaded", function (event) {
    var workXpExtended = false;
    var XpExtendedEle = document.querySelectorAll(".XpExtended");
    var buttonWorkXP = document.querySelector('#buttonWorkXP');

    // Append aditional WorkXP

    buttonWorkXP.addEventListener('click', function () {
        if (workXpExtended) {
            for (var i = 0; i < XpExtendedEle.length; i++) {
                XpExtendedEle[i].classList.remove('show');
                setTimeout(function (ele) {
                    ele.style.display = "none";
                }, 500, XpExtendedEle[i]); // 500ms delay to match transition
            }
            workXpExtended = false;
            buttonWorkXP.innerHTML = "Show more ▼";
        } else {
            for (var i = 0; i < XpExtendedEle.length; i++) {
                XpExtendedEle[i].style.display = "flex";
                XpExtendedEle[i].classList.add('animate-show');
                // Add a slight delay before the element becomes visible
                setTimeout(function (ele) {
                    ele.classList.add('show');
                }, 100 * i, XpExtendedEle[i]); // 100ms delay per element
            }
            workXpExtended = true;
            buttonWorkXP.innerHTML = "Show less ▲";
        }
    });

    // Append Skill details

    // Select all .fullSkill elements
    let fullSkills = document.querySelectorAll('.fullSkill');

    // Add a click event listener to each .fullSkill element
    fullSkills.forEach((skill, index) => {
        skill.addEventListener('click', function () {
            // Select the associated .skillExtend element
            let skillExtend = document.querySelectorAll('.skillExtend')[index];
            let skillArrow = document.querySelectorAll('.skillArrowDown')[index];
            // Toggle the display of the .skillExtend element
            if (!skillExtend.classList.contains("show")) {
                skillExtend.classList.add("show")
                animateAll();
                skillArrow.innerHTML = "▲";
                // setTimeout(() => {
                //     window.scrollTo({
                //     top: skillExtend.offsetTop,
                //     behavior: 'smooth'
                //     });
                // }, 500)
            } else {
                skillExtend.classList.remove("show")
                resetAll();
                skillArrow.innerHTML = "▼";
            }
        });
    });

    // Skill Circle
    // Grab all Skill Circles
    let circles = Array.from(document.querySelectorAll('.progress-ring')).map(animateCircle);

    function animateCircle(svg) {
        let progress = parseFloat(svg.dataset.progress); // Get progress from data attribute
        let circle = svg.querySelector('.progress-ring__circle-progress');
        let radius = circle.r.baseVal.value;
        let circumference = 2 * Math.PI * radius;

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;

        let progressPercent = progress * 100;
        let progressStep = 0;

        function setProgress(percent) {
            const offset = circumference - percent / 100 * circumference;
            circle.style.strokeDashoffset = offset;
        }

        function animateProgress() {
            if (progressStep <= progressPercent) {
                setProgress(progressStep);
                progressStep += 3;
                requestAnimationFrame(animateProgress);
            } else {
                setProgress(progressPercent);  // Ensure we reach the exact final progress
            }
        }

        svg.resetProgress = function () {
            circle.style.strokeDashoffset = `${circumference}`;
            progressStep = 0;
        }

        svg.animateProgress = animateProgress;

        return svg;
    }

    // Function to animate all circles
    function animateAll() {
        for (let circle of circles) {
            circle.animateProgress();
        }
    }

    // Function to reset all circles
    function resetAll() {
        for (let circle of circles) {
            circle.resetProgress();
        }
    }

    //Trigger when viewport intersects ID
    // Create an Intersection Observer instance
    let observer = new IntersectionObserver((entries, observer) => {
        // Loop through all entries
        for (let entry of entries) {
            // If the element is visible in the viewport
            if (entry.isIntersecting) {
                // Trigger animations
                animateAll();
                // Stop observing the element
                observer.unobserve(entry.target);
            }
        }
    }, {
        threshold: 0.7 // Percentage of the observed element which is visible before the callback is run
    });

    // Grab the element you want to observe
    let target = document.querySelector('#SkillsSection');

    // Start observing the element
    observer.observe(target);


});