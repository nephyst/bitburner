import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog("sleep");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("gang.setMemberTask");
    ns.disableLog("gang.setTerritoryWarfare");
    ns.disableLog("gang.purchaseEquipment");

    while (!ns.gang.inGang()) {
        ns.sleep(60000);
    }

    let gang = ns.gang.getGangInformation();

    let equipment = ns.gang.getEquipmentNames().map((equip) => {
        return { name: equip, cost: ns.gang.getEquipmentCost(equip) }
    })
        .filter((equip) => {
            let type = ns.gang.getEquipmentType(equip.name);
            return type === "Augmentation"
                || (gang.isHacking && type === "Rootkit")
                || (!gang.isHacking && ["Weapon", "Armor", "Vehicle"].includes(type));
        })
        .sort((a, b) => a.cost > b.cost);


    let lastTick = 0;
    let lastTickLength = 19700;
    let lastGangStats = getPowers(ns);
    let lastClashChance = 0;
    let lastIsTickNear = false;

    while (true) {

        let now = Date.now();
        let gangStats = getPowers(ns);

        let isTickNear = lastTickLength > 0 && (now - lastTick + 500 > lastTickLength);

        let tickHappened = false;
        var i = gangStats.length;
        while (i--) {
            if (gangStats[i].power !== lastGangStats[i].power) {
                tickHappened = true;
                break;
            }
        }

        if (tickHappened) {

            let debug = "[";
            let clashChance = 100;

            if (lastGangStats.length > 0) {
                for (let j = 0; j < lastGangStats.length; j++) {
                    let name = gangStats[j].name;
                    let isCurrentGang = name == ns.gang.getGangInformation().faction;
                    let power = gangStats[j].power;
                    let territory = gangStats[j].territory;
                    let lastPower = lastGangStats[j].power;

                    let delta = ns.formatNumber(power - lastPower)
                    if (isCurrentGang) {
                        debug = debug.concat("(").concat(delta).concat("), ");
                    } else {
                        debug = debug.concat(delta).concat(", ");
                    }
                    let chance = ns.gang.getChanceToWinClash(name) * 100;
                    if (territory > 0 && chance < clashChance && !isCurrentGang) {
                        clashChance = chance;
                    }
                }
                let delta = ns.formatNumber(clashChance - lastClashChance, 5);
                if (!delta.startsWith("-")) {
                    delta = " ".concat(delta);
                }
                debug = debug.slice(0, -2).concat("] ").concat(delta).concat("%");

                ns.print(debug);
            }

            lastGangStats = gangStats;
            lastClashChance = clashChance;
            if (lastTick > 0) {
                lastTickLength = now - lastTick;
            }
            lastTick = now;
            isTickNear = false;
        }

        assign(ns, gang.isHacking, isTickNear);
        recruit(ns);
        ascend(ns, gang.isHacking);
        equip(ns, equipment);
        clash(ns);

        lastIsTickNear = isTickNear;
        await ns.sleep(200);
    }

}

function getPowers(ns) {
    let gangs = ns.gang.getOtherGangInformation();
    let powers = [];
    for (let gang of Object.entries(gangs)) {
        powers.push({ "name": gang[0], "power": gang[1].power, "territory": gang[1].territory });
    }
    return powers;
}

let justice = false;
function assign(ns, isHacking, isTickNear) {
    let wantedPenalty = ns.gang.getGangInformation().wantedPenalty;
    let territory = ns.gang.getGangInformation().territory;

    ns.gang.getMemberNames().forEach((name) => {
        if (isTickNear && territory < 1) {
            ns.gang.setMemberTask(name, "Territory Warfare");
        } else if (wantedPenalty < 0.98) {
            justice = true;
            ns.gang.setMemberTask(name, "Vigilante Justice");
        // } else if (name == "BizarreReaper") {
        //     //ns.gang.setMemberTask(name, "Traffick Illegal Arms");
        //     ns.gang.setMemberTask(name, "Terrorism");
        } else if (justice && wantedPenalty < 0.995) {
            ns.gang.setMemberTask(name, "Vigilante Justice");
        } else if (isHacking) {
            justice = false;
            if (ns.gang.getMemberInformation(name).hack < 150) {
                ns.gang.setMemberTask(name, "Train Hacking");
            } else {
                // TODO: What jobs should a hacking gang do?
                ns.gang.setMemberTask(name, "Strongarm Civilians");
            }
        } else {
            justice = false;
            if (ns.gang.getMemberInformation(name).str < 150) {
                ns.gang.setMemberTask(name, "Train Combat");
            } else {
                //ns.gang.setMemberTask(name, "Traffick Illegal Arms");
                ns.gang.setMemberTask(name, "Terrorism");
            }
        }
    });

}

let recruitCount = 0;
function recruit(ns) {
    if (ns.gang.canRecruitMember()) {
        let name = "BizarreReaper";
        if (ns.gang.getMemberNames().includes(name)) {
            name = "elixias";
        }
        while (ns.gang.getMemberNames().includes(name)) {
            name = "Thug Thuggly " + convertToRoman(++recruitCount);
        }
        ns.toast(sprintf("Recruiting %s", name), "info", 5000);
        ns.gang.recruitMember(name);
    }
}

function ascend(ns, isHacking) {
    ns.gang.getMemberNames().forEach((name) => {
        let ascensionResult = ns.gang.getAscensionResult(name);
        if (ascensionResult == undefined) {
            return;
        }
        if ((isHacking && ascensionResult.hack > 2)
            || (!isHacking && ascensionResult.str > 2)) {
            ns.toast(sprintf("Ascending %s", name), "info", 5000);
            ns.gang.ascendMember(name);
        }
    });
}

function equip(ns, equipment) {
    for (let name of ns.gang.getMemberNames()) {
        let member = ns.gang.getMemberInformation(name);

        equipment.some((equip) => {
            if (member.upgrades.includes(equip.name)) {
                return false;
            }
            if (ns.getServerMoneyAvailable("home") > equip.cost) {
                ns.gang.purchaseEquipment(name, equip.name);
            }
            return true;
        })
    }
}

function clash(ns) {
    let clash = true;
    for (let gang of Object.entries(ns.gang.getOtherGangInformation())) {
        if (gang[0] == ns.gang.getGangInformation().name) {
            continue;
        }
        if (gang[1].territory > 0 && ns.gang.getChanceToWinClash(gang[0]) < 0.5) {
            clash = false;
        }
    }
    ns.gang.setTerritoryWarfare(clash);
}

var romanMatrix = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
];

function convertToRoman(num) {
    if (num === 0) {
        return '';
    }
    for (var i = 0; i < romanMatrix.length; i++) {
        if (num >= romanMatrix[i][0]) {
            return romanMatrix[i][1] + convertToRoman(num - romanMatrix[i][0]);
        }
    }
}
