"use strict";

window.onload = function() {
var p = document.getElementsByTagName("p")[0];
var orig = p.textContent;

var step = 0;
var last = 0;

function update(time) {
    if (time - last > 50) {
        last = time;

        var copy = "";

        for (var i = 0; i < step; ++i) {
            copy += orig[i];
        }

        for (var i = step; i < orig.length; ++i) {
            var letter = String.fromCharCode(33 + Math.floor(Math.random() * 94));
            if (letter == " ")
                letter = "\xa0";
            copy += letter;
        }

        p.textContent = copy;

        if (step < orig.length)
            step += 1;
        else
            return;
    }

    window.requestAnimationFrame(update);
};
window.requestAnimationFrame(update);
};
