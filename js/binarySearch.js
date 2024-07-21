let size;
    let arr;
    let target;

    let left;
    let right;
    let middle;

    let reset = false;

    window.onload = (event) => {
        newRandomBinarySearch();
        document.getElementById("resetRandomBtn").addEventListener("click", function (e) {
            reset = true;
            newRandomBinarySearch();
        })
    };

    function newRandomBinarySearch() {
        size = Math.floor(Math.random() * 100) +5
        arr = createRandomOrderedNumArray(size);
        target = arr[Math.floor(Math.random() * size)];

        left = 0;
        right = size - 1;
        middle = Math.floor(size / 2);
        mainLoop();
    }

    function mainLoop() {
        reset = false;
        drawArrayToViz();
        if (binarySearchStep()) {
            drawArrayToViz();
            return;
        }
        setTimeout(() => {
            if (!reset) mainLoop();
        }, 700);
    }

    function binarySearchStep() {
        if (arr[middle] == target) {
            return true;
        }
        if (target > arr[middle]) {
            left = middle + 1;
        } else if (target < arr[middle]) {
            right = middle - 1;
        } else {
            console.error("target not in array")
            return true;
        }
        middle = Math.floor((right - left) / 2 + left);
        return false;
    }

    function createRandomOrderedNumArray(size) {
        let arr = Array(size);
        let current = 1;

        arr[0] = current;
        for (let i = 1; i < size; i++) {
            current = current + Math.floor(Math.random() * 10 + 1);
            arr[i] = current;
        }
        return arr.sort(function(a, b){return a - b});
    }
    function drawArrayToViz() {
        const container = document.getElementById("binarysearchviz");
        const leftEl = document.getElementById("left");
        const middleEl = document.getElementById("middle");
        const rightEl = document.getElementById("right");
        const targetEl = document.getElementById("target");
        container.innerHTML = '';
        for (let i = 0; i < arr.length; i++) {
            const div = document.createElement("div");
            div.classList.add("arrayCell");
            div.setAttribute("data-index", i);
            div.append(arr[i]);
            if (arr[i] == target) {
                div.classList.add("targetCell");
            }
            if (i == left) {
                div.classList.add("leftCell");
            }
            if (i == right) {
                div.classList.add("rightCell");
            }
            if (i == middle) {
                if (arr[i] == target) {
                    div.classList.add("animatedBG");
                } else {
                    div.classList.add("middleCell");
                }
            }
            container.append(div)
        }
        
        leftEl.innerHTML = (left)
        middleEl.innerHTML = (middle);
        rightEl.innerHTML = (right);
        targetEl.innerHTML = (target);

    }