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

        if (!(server in servers) && server !== "home" && !server.startsWith("pserv")) {
            servers[server] = depth;
            contracts[server] = ns.ls(server, ".cct");
            for (var potentialServer of ns.scan(server)) {
                serversToScan.unshift({ name: potentialServer, depth: depth + 1 });
            }
        }
    }

    var output = "Servers:\n";
    for (const [key, value] of Object.entries(servers)) {
        let server = ns.getServer(key);
        
        let root = ns.hasRootAccess(key) ? "🔓" : "";
        let backdoor = server.backdoorInstalled ? "🚪" : "";

        let hasRam = server.maxRam;
        let hasContracts = contracts[key].length > 0;
        
        let properties = "";
        if (hasRam || hasContracts) {
            properties += "(";

            if (hasRam) {
                properties += server.maxRam + " GB";
            }

            if (hasRam && hasContracts) {
                properties += "; "
            }

            if (hasContracts) {
                properties += contracts[key].length + " contracts";
            }

            properties += ")";
        }

        output = output.concat(sprintf("%s%s%s%s %s\n", "-".repeat(value), key, root, backdoor, properties));
    }
    ns.tprint(output);

}