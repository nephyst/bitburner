import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog("sleep");
    ns.disableLog("getServerMoneyAvailable");

    let spent = new Array(4).fill(0);

    while (true) {
        let bought = false;
        let numNodes = ns.hacknet.numNodes();
        let costMulti = (2 * numNodes) + 1;

        for (let i = 0; i <= numNodes; i++) {

            if (i == numNodes) {
                let money = ns.getServerMoneyAvailable("home");
                let cost = ns.hacknet.getPurchaseNodeCost();
                if (money > cost * costMulti) {
                    ns.printf("Buying %s $%s", i, ns.formatNumber(cost, "0.000a"));
                    ns.hacknet.purchaseNode();
                    bought = true;
                    spent[0] += cost;
                }

            } else {

                var money = ns.getServerMoneyAvailable("home");
                var cost = ns.hacknet.getLevelUpgradeCost(i);
                if (money > cost * costMulti) {
                    ns.printf("Level %s $%s", i, ns.formatNumber(cost, "0.000a"));
                    ns.hacknet.upgradeLevel(i);
                    bought = true;
                    spent[1] += cost;
                }

                money = ns.getServerMoneyAvailable("home");
                cost = ns.hacknet.getRamUpgradeCost(i);
                if (money > cost * costMulti) {
                    ns.printf("RAM %s $%s", i, ns.formatNumber(cost, "0.000a"));
                    ns.hacknet.upgradeRam(i);
                    bought = true;
                    spent[2] += cost;
                }

                money = ns.getServerMoneyAvailable("home");
                cost = ns.hacknet.getCoreUpgradeCost(i);
                if (money > cost * costMulti) {
                    ns.printf("Core %s $%s", i, ns.formatNumber(cost, "0.000a"));
                    ns.hacknet.upgradeCore(i);
                    bought = true;
                    spent[3] += cost;
                }
            }
        }

        if (!bought) {

            if (spent[0]) {
                ns.toast(sprintf("+ $%s;  ", ns.formatNumber(spent[0], "0.000a")), "info", 10000);
                spent[0] = 0;
            }
            if (spent[1]) {
                ns.toast(sprintf("▲L $%s;  ", ns.formatNumber(spent[1], "0.000a")), "info", 10000);
                spent[1] = 0;
            }
            if (spent[2]) {
                ns.toast(sprintf("▲R $%s;  ", ns.formatNumber(spent[2], "0.000a")), "info", 10000);
                spent[2] = 0;
            }
            if (spent[3]) {
                ns.toast(sprintf("▲C $%s;  ", ns.formatNumber(spent[3], "0.000a")), "info", 10000);
                spent[3] = 0;
            }

            await ns.sleep(5000);
        }

    }
}