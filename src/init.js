import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.singularity.installAugmentations()

    ns.singularity.commitCrime("Rob Store", false);

    ns.run("/hack/pservers.js");
    ns.run("/hack/deployer.js");
    ns.run("/hacknet/hacknet.js");
    ns.run("/util/tor.js");
    ns.run("/util/playerFocus.js");
    ns.run("/gang/gang.js");

    let ramPerThread = ns.getScriptRam("/hack/helper/share.js");
    let ramAvailable = 0.95 * (ns.getServerMaxRam("home") - ns.getServerUsedRam("home"));
    let threads = Math.floor(ramAvailable / ramPerThread);

    if (threads > 0) {
        ns.run("/hack/helper/share.js", threads);
    }
}