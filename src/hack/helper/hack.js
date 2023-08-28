import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {
    let money = await ns.hack(ns.args[0]);
    //let hostname = ns.getHostname();
    let type = "error";
    if (money > 0) {
        type = "success";
    }
    //ns.toast(sprintf("%s: $%i from %s", hostname, money, ns.args[0]), type, 5000);
}