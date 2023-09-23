

function allValidExpressions(ns, digits, target) {
    let solutions = [];
    allValidExpressionsHelper(ns, digits, digits[0], target, 1, digits.length, solutions, 0, 0);
    return solutions;
}

function allValidExpressionsHelper(ns, digits, expression, target, pos, len, solutions, calculated) {
    if (pos === len) {
        if (calculated == target) {
            solutions.push(expression);
        }
        return;
    }

    let digit = parseInt(digits[pos]);

    if (expression[expression.length] !== 0) {
        allValidExpressionsHelper(ns, digits, expression + digit, target, pos + 1, len, solutions, ??);
    }

    allValidExpressionsHelper(ns, digits, expression + '+' + digit, target, pos + 1, len, solutions, calculated + digit);
    allValidExpressionsHelper(ns, digits, expression + '-' + digit, target, pos + 1, len, solutions, calculated - digit);
    allValidExpressionsHelper(ns, digits, expression + '*' + digit, target, pos + 1, len, solutions, calculated * digit);

    return solutions;
}
console.log(allValidExpressions(null, "65098394138", 6));

//6+50+9+8+3-94*1+3*8

//9+8+3-94*1
//console.log(allValidExpressions(null, "98394138", -50));


// console.log(allValidExpressions(null, "123", 6));
// console.log(allValidExpressions(null, "1234", 24));
// console.log(allValidExpressions(null, "11052", 1));