
let validExpressions = {};

function allValidExpressions(ns, expression, target) {

    let key = target + "=" + expression;
    if (key in validExpressions) {
        return validExpressions[key];
    }

    let solutions = [];

    if (eval(expression) == target) {
        solutions.push(expression);
    }

    for (let i = 1; i < expression.length; i++) {
        let leftSide = expression.slice(0, i);
        let rightSide = expression.slice(i);
        let leftSideTotal = eval(leftSide);

        allValidExpressions(ns, rightSide, target - leftSideTotal).forEach((s) => {
            solutions.push(leftSide + "+" + s);
        })

        allValidExpressions(ns, rightSide, leftSideTotal - target).forEach((s) => {
            solutions.push(leftSide + "-" + s);
        });

        let multiplyTarget = target / leftSide;
        if (Math.floor(multiplyTarget) === multiplyTarget) {
            allValidExpressions(ns, rightSide, multiplyTarget).forEach((s) => {
                solutions.push(leftSide + "*" + s);
            });
        }
    }

    validExpressions[key] = solutions;
    return solutions;
}
console.log(allValidExpressions(null, "218585865255", -78));
//console.log(allValidExpressions(null, "1234", 24));