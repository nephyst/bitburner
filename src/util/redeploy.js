import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    let servers = [];
    let serversToScan = ns.scan("home");

    while (serversToScan.length > 0) {
        let server = serversToScan.shift();
        ns.printf("\n ┌-- Scanning %s --", server);
        if (!servers.includes(server) && server !== "home") {
            servers.push(server);
            serversToScan = serversToScan.concat(ns.scan(server));

            if (!ns.hasRootAccess(server)) {
                let openPorts = 0;
                if (ns.fileExists("BruteSSH.exe")) {
                    ns.brutessh(server);
                    openPorts++;
                }
                if (ns.fileExists("FTPCrack.exe")) {
                    ns.ftpcrack(server);
                    openPorts++;
                }
                if (ns.fileExists("RelaySMTP.exe")) {
                    ns.relaysmtp(server);
                    openPorts++;
                }
                if (ns.fileExists("HTTPWorm.exe")) {
                    ns.httpworm(server);
                    openPorts++;
                }
                if (ns.fileExists("SQLInject.exe")) {
                    ns.sqlinject(server);
                    openPorts++;
                }
                if (ns.getServerNumPortsRequired(server) <= openPorts) {
                    ns.nuke(server);
                }
            }

            if (ns.hasRootAccess(server)) {
                await ns.scp([
                    "/hack/helper/weaken.js",
                    "/hack/helper/grow.js",
                    "/hack/helper/hack.js"
                ], server);
            }

        }
        ns.printf(" └-- %s Scanned -- %i remaining --", server, serversToScan.length);
    }
}