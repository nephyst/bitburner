import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog("getHackingLevel");
    ns.disableLog("scan");
    ns.disableLog("getServerRequiredHackingLevel");

    async function backdoor(server, parent = "") {
        ns.printf("Connecting to %s", server);
        ns.singularity.connect(server);
        if (ns.hasRootAccess(server)
            && server !== "home"
            && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
            && !ns.getServer(server).backdoorInstalled
        ) {
            ns.tprintf("Backdooring %s", server);
            await ns.singularity.installBackdoor();
        }
        let servers = ns.scan(server)
        for (let nextServer of servers) {
            if (nextServer == parent) {
                continue;
            }
            if (!nextServer.startsWith("pserv")) {
                await backdoor(nextServer, server);
                ns.printf("Backtracking to %s", server);
                ns.singularity.connect(server);
            }
        }

    }

    await backdoor("home");
    ns.tprint("Backdoor Complete");

}