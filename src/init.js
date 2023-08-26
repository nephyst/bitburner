import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.run("deployer.js", 1);
    ns.run("pservers.js", 1, 1024);

    let ramPerThread = ns.getScriptRam("/util/share.js");
    let ramAvailable = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    let threads = Math.floor(ramAvailable / ramPerThread);

    ns.run("/util/share.js", threads);
}