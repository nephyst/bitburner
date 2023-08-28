import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    let servers = {};
    let contracts = {};
    let serversToScan = [];

    for (var server of ns.scan("home")) {
        serversToScan.push({ name: server, depth: 1 });
    }

    while (serversToScan.length > 0) {
        let toScan = serversToScan.shift();
        let server = toScan.name;
        let depth = toScan.depth;

        if (!(server in servers) && server !== "home") {
            servers[server] = depth;
            contracts[server] = ns.ls(server, ".cct").join(", ");
            for (var potentialServer of ns.scan(server)) {
                serversToScan.unshift({ name: potentialServer, depth: depth + 1 });
            }
        }
    }

    var output = "Servers:\n";
    for (const [key, value] of Object.entries(servers)) {
        let c = "";
        if (contracts[key].length > 0) {
            c = "[" + contracts[key].join(", ") + "]";
        }
        output = output.concat(sprintf("%s%s %s\n", " ".repeat(value), key, c));
    }
    ns.tprint(output);

}