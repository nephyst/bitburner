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
        let properties = [];

        let server = ns.getServer(key);

        let root = ns.hasRootAccess(key) ? "🔓" : "";
        let backdoor = server.backdoorInstalled ? "🚪" : "";

        if (server.maxRam) {
            properties = properties.concat(server.maxRam + " GB");
        }
        if (contracts[key].length > 0) {
            properties = properties.concat(contracts[key].length + " contracts");
        }
        if (!root || !backdoor) {
            properties = properties.concat(ns.getServerRequiredHackingLevel(key) + " hacking");
        }

        let propertiesString = "";
        if (properties.length > 0) {
            propertiesString = "(" + properties.join(", ") + ")";
        }

        output = output.concat(sprintf("%s%s%s%s %s\n", "-".repeat(value), key, root, backdoor, propertiesString));
    }
    ns.tprint(output);

}