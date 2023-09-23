import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    while (true) {

        if (ns.singularity.getUpgradeHomeRamCost() < ns.getServerMoneyAvailable("home")) {
            ns.singularity.upgradeHomeRam();
        }

        await ns.sleep(10000);
    }

}