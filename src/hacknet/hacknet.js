import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog("sleep");
    ns.disableLog("getServerMoneyAvailable");


    let symbols = ["+ ", "▲L ", "▲R ", "▲C "]
    let spent = new Array(4).fill(0);

    while (true) {
        let bought = false;
        let numNodes = ns.hacknet.numNodes();
        let costMulti = (3 * numNodes) + 1;

        for (let i = 0; i <= numNodes; i++) {

            if (i == numNodes) {
                let money = ns.getServerMoneyAvailable("home");
                let cost = ns.hacknet.getPurchaseNodeCost();
                if (money > cost * costMulti) {
                    ns.printf("Buying node%s $%s", i, ns.formatNumber(cost, "0.000a"));
                    ns.hacknet.purchaseNode();
                    bought = true;
                    spent[0] += cost;
                }

            } else {

                var money = ns.getServerMoneyAvailable("home");
                var cost = ns.hacknet.getLevelUpgradeCost(i);
                if (money > cost * costMulti) {
                    ns.printf("Level node%s $%s", i, ns.formatNumber(cost, "0.000a"));
                    ns.hacknet.upgradeLevel(i);
                    bought = true;
                    spent[1] += cost;
                }

                money = ns.getServerMoneyAvailable("home");
                cost = ns.hacknet.getRamUpgradeCost(i);
                if (money > cost * costMulti) {
                    ns.printf("RAM node%s $%s", i, ns.formatNumber(cost, "0.000a"));
                    ns.hacknet.upgradeRam(i);
                    bought = true;
                    spent[2] += cost;
                }

                money = ns.getServerMoneyAvailable("home");
                cost = ns.hacknet.getCoreUpgradeCost(i);
                if (money > cost * costMulti) {
                    ns.printf("Core node%s $%s", i, ns.formatNumber(cost, "0.000a"));
                    ns.hacknet.upgradeCore(i);
                    bought = true;
                    spent[3] += cost;
                }
            }
        }

        if (!bought) {

            for (let i = 0; i < 4; i++) {
                if (spent[i]) {
                    ns.toast(sprintf("%s$%s", symbols[i], ns.formatNumber(spent[i], "0.000a")), "info", 10000);
                    spent[i] = 0;
                }
            }

            await ns.sleep(5000);
        }

    }
}