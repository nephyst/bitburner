import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.run("/hack/pservers.js", 1, 1024);
    ns.run("/hack/deployer.js", 1);
    ns.run("/gang/gang.js", 1);
    ns.run("/hacknet/hacknet.js", 1);

    let ramPerThread = ns.getScriptRam("/hack/helper/share.js");
    let ramAvailable = 0.9 * (ns.getServerMaxRam("home") - ns.getServerUsedRam("home"));
    let threads = Math.floor(ramAvailable / ramPerThread);

    ns.run("/hack/helper/share.js", threads);
}