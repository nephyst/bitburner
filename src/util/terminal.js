import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {
    let command = "export async function main(ns) {\n";
    for (let arg of ns.args) {
        command += arg;
        command += " ";
    }
    command += "\n}";
    await ns.write("/tmp/runfile.js", command, "w");
    ns.tprint(ns.exec("/tmp/runfile.js", "home"));
}