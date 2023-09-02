import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog("sleep");
    ns.disableLog("getServerMoneyAvailable");

    let maxNodes = 9;

    while (true) {
        let bought = false;
        for (let i = 0; i < maxNodes; i++) {

            if (ns.hacknet.numNodes() < i + 1) {

                let money = ns.getServerMoneyAvailable("home");
                let cost = ns.hacknet.getPurchaseNodeCost();
                if (money > cost * 10) {
                    ns.printf("Buying %s $%s", i, ns.formatNumber(cost));
                    ns.hacknet.purchaseNode();
                    bought = true;
                }

            } else {

                var money = ns.getServerMoneyAvailable("home");
                var cost = ns.hacknet.getLevelUpgradeCost(i);
                if (money > cost * 10) {
                    ns.printf("Level %s $%s", i, ns.formatNumber(cost));
                    ns.hacknet.upgradeLevel(i);
                    bought = true;
                }

                money = ns.getServerMoneyAvailable("home");
                cost = ns.hacknet.getRamUpgradeCost(i);
                if (money > cost * 10) {
                    ns.printf("RAM %s $%s", i, ns.formatNumber(cost));
                    ns.hacknet.upgradeRam(i);
                    bought = true;
                }

                money = ns.getServerMoneyAvailable("home");
                cost = ns.hacknet.getCoreUpgradeCost(i);
                if (money > cost * 10) {
                    ns.printf("Core %s $%s", i, ns.formatNumber(cost));
                    ns.hacknet.upgradeCore(i);
                    bought = true;
                }
            }
        }
        if (!bought) {
            await ns.sleep(5000);
        }
    }
}