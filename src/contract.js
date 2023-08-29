import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    getServers(ns).forEach(server => {
        let hostname = server.name;

        ns.ls(hostname, ".cct").forEach(contract => {
            let answer = solveContract(ns, hostname, contract);
            let type = ns.codingcontract.getContractType(contract, hostname);
            if (answer !== null) {
                let result = ns.codingcontract.attempt(answer, contract, hostname);
                ns.tprintf("%s - %s: %s", hostname, type, result);
            } else {
                ns.tprintf("Solver needed for %s on %s", type, hostname);
            }
        });

    });

}

function solveContract(ns, hostname, contract) {
    let type = ns.codingcontract.getContractType(contract, hostname);
    let data = ns.codingcontract.getData(contract, hostname);

    let results;

    switch (type) {
        case "Find Largest Prime Factor":
            let factor = 2;
            let n = data;
            while (n > factor) {
                if (n % factor === 0) {
                    n = Math.round(n / factor);
                    factor = 2;
                } else {
                    ++factor;
                }
            }
            return factor;
        case "Subarray with Maximum Sum":
            let nums = data.slice();
            for (let i = 1; i < nums.length; i++) {
                nums[i] = Math.max(nums[i], nums[i] + nums[i - 1]);
            }

            return Math.max(...nums);
        case "Total Ways to Sum":
            let ways = [1];
            ways.length = data + 1;
            ways.fill(0, 1);
            for (let i = 1; i < data; ++i) {
                for (let j = i; j <= data; ++j) {
                    ways[j] += ways[j - i];
                }
            }
            return ways[data];
        case "Spiralize Matrix":
            results = [];

            while (data.length > 0) {
                results = results.concat(data.shift());
                if (data.length === 0) {
                    break;
                }

                for (let i = 0; i < data.length; i++) {
                    results.push(data[i].pop());
                }

                results = results.concat(data.pop().reverse());
                if (data.length === 0) {
                    break;
                }

                for (let i = data.length; i > 0; i--) {
                    results.push(data[i - 1].shift());
                }
            }

            return results;
        case "Array Jumping Game":
            return null;
        case "Merge Overlapping Intervals":
            return null;
        case "Generate IP Addresses":
            return null;
        case "Algorithmic Stock Trader I":
            return ast(ns, 1, data);
        case "Algorithmic Stock Trader II":
            return ast(ns, null, data);
        case "Algorithmic Stock Trader III":
            return null;
        case "Algorithmic Stock Trader IV":
            return ast(ns, data[0], data[1]);
        case "Minimum Path Sum in a Triangle":
            return null;
        case "Unique Paths in a Grid I":
            return null;
        case "Unique Paths in a Grid II":
            return null;
        case "Sanitize Parentheses in Expression":
            let left = 0; //number of ( to remove
            let right = 0; //number of ) to remove

            for (let i = 0; i < data.length; ++i) {
                if (data[i] === '(') {
                    ++left;
                } else if (data[i] === ')') {
                    (left > 0) ? --left : ++right;
                }
            }

            results = new Set();
            sph(data, results, left, right, 0, 0, "");

            return Array.from(results);
        case "Find All Valid Math Expressions":
            return allValidExpressions(ns, data[0], data[1]).toString();
        default:
            return null;

    }
}

/*** Helpers for Algorithmic Stock Traders

*/
function ast(ns, k, data) {
    ns.tprint("k:" + k);
    ns.tprint(data);

    let delta = [];

    let runningDelta = 0;
    for (let i = 1; i < data.length; i++) {
        let currentDelta = data[i] - data[i - 1];
        if (oppositeSigns(runningDelta, currentDelta)) {
            delta.push(runningDelta);
            runningDelta = currentDelta;
        } else {
            runningDelta = runningDelta + currentDelta;
        }
    }
    if (runningDelta !== 0) {
        delta.push(runningDelta);
    }

    //Trim and check if there are no profits.
    if (delta.length && delta[delta.length - 1] < 0) {
        delta.pop();
    }
    if (delta.length && delta[0] < 0) {
        delta.shift();
    }

    if (!delta.length) {
        return 0;
    }

    ns.tprint(delta);

    //while the number of positive delas is larger than K, try to reduce two adjacent values
    //This would mean combining the negative value with the two positivies around them
    //You want to use the smallest negative number (closest to 0), because this gives the most gain.
    //if the gain is less than the k+1th , you would be losing value to reduce any further.
    let count = 0;
    while (delta.filter(n => n > 0).length > k && count++ < 10) {
        let possibleGain = delta.filter(n => n > 0).sort((a, b) => b - a)[k];
        //ns.tprint("possible gain:" + possibleGain);

        let smallestNegative = 0;
        let smallestNegativeI = null;

        for (let i = 1; i < delta.length - 1; i++) {
            let current = delta[i];
            if (current < 0) {
                if (!smallestNegative || current > smallestNegative) {
                    if (delta[i - 1] > -current && delta[i + 1] > -current) {
                        smallestNegative = delta[i];
                        smallestNegativeI = i;
                    }
                }
            }
        }

        //ns.tprint("i:" + smallestNegativeI + " cost:" + -smallestNegative + " gain:" + possibleGain)
        if (smallestNegativeI && -smallestNegative < possibleGain) {
            let i = smallestNegativeI;

            delta[i - 1] = delta[i - 1] + delta[i] + delta[i + 1];
            delta.splice(i, 2);
        } else {
            break;
        }
    }

    ns.tprint(delta);

    delta = delta.filter(n => n > 0);
    delta.sort((a, b) => b - a);
    ns.tprint(delta);
    if (k && k < delta.length) {
        delta = delta.slice(0, k);
    }
    delta = delta.reduce((a, b) => a + b, 0);

    ns.tprint(delta);

    return delta;
}


/*** Recursive helper for "Sanitize Parentheses in Expression"
data: contract data
results: array to store valid results
left: number of ( to remove
right: number of ) to remove
index: current index in data
pairs: running count of unfinished pairs
solution: stores current partial solution
*/
function sph(data, results, left, right, i, pairs, solution) {
    //base case
    if (i === data.length) {
        if (left === 0 && right === 0 && pairs === 0) {
            results.add(solution);
        }
        return;
    }

    let c = data[i]
    switch (c) {
        case '(':
            //If there are ('s to remove, attempt to solve by removing
            if (left > 0) {
                sph(data, results, left - 1, right, i + 1, pairs, solution);
            }
            //Attempt to solve without removing
            sph(data, results, left, right, i + 1, pairs + 1, solution + c);
            break;
        case ')':
            //If there are )'s to remove, attempt to solve by removing
            if (right > 0) {
                sph(data, results, left, right - 1, i + 1, pairs, solution);
            }
            //If there are unfinished pairs, attempt to solve without removing
            if (pairs > 0) {
                sph(data, results, left, right, i + 1, pairs - 1, solution + c);
            }
            break;
        default:
            //Keep any extra characters
            sph(data, results, left, right, i + 1, pairs, solution + c);
            break;
    }
}

function oppositeSigns(x, y) {
    if (x === 0 || y === 0) {
        return false;
    }
    return ((x ^ y) < 0);
}

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

function getServers(ns) {

    let result = [];
    let visited = { 'home': 1 };
    let queue = Object.keys(visited);

    let name;
    while (name = queue.pop()) {
        let server = {};

        server.name = name;
        server.depth = visited[name];

        result.push(server);
        let scanRes = ns.scan(name);
        for (let i = scanRes.length; i >= 0; i--) {
            if (!visited[scanRes[i]]) {
                queue.push(scanRes[i]);
                visited[scanRes[i]] = server.depth + 1;
            }
        }
    }
    return result;
}