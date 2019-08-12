//==============================================
//===========Algoritmo de Levenshtain===========
//==============================================

let weights = [];
let MaxPercentWord = [];
//Position 0 : Percent ------- Position 1: Word


entries = [{
    value: 'AGENCIA CAYMA',
    synonym: ['AGENCIA CAYMA']
}, {
    value: 'AGENCIA BUSTAMANTE Y RIVERO',
    synonym: ['AGENCIA BUSTAMANTE Y RIVERO']
}]

const compareStrings = (strg1, callback) => {
    console.log("recibi la palabraÑ ", strg1);
    var k = 0;
    for (let i = 0; i < entries.length; i++) {
        for (let j = 0; j < entries[i].synonym.length; j++) {
            weights[k] = similarity(strg1, entries[i].synonym[j]);
            if (k == 0) {
                MaxPercentWord[0] = weights[k];
                MaxPercentWord[1] = entries[i].value;
            } else if (weights[k] > MaxPercentWord[0]) {
                MaxPercentWord[0] = weights[k];
                MaxPercentWord[1] = entries[i].value;
            }
            k = k + 1;
        }
    }
    console.log(`Palabra encontrada: ${MaxPercentWord}`);
    callback(MaxPercentWord[1]);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i < s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return (costs[s2.length]);
}

function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    let percent = (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    //console.log(s1 + ' y ' + s2 + ' es:               ' + percent);
    return percent;
}


module.exports = {
    compareStrings
}