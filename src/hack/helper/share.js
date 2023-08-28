import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {
    while (true) {
        await ns.share(ns.args[0]);
    }
}