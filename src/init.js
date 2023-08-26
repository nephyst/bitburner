import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.run("deployer.js", 1);
    ns.run("pservers.js", 1);
    ns.run("/util/share.js", 8000);
}