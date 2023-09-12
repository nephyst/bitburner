import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog("getHackingLevel");
    ns.disableLog("scan");
    ns.disableLog("getServerRequiredHackingLevel");

    async function backdoor(server, parent = "") {
        if (server.startsWith("pserv")) {
            return;
        }
        ns.singularity.connect(server);
        if (ns.hasRootAccess(server)
                && server !== "home"
                && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
                && !ns.getServer(server).backdoorInstalled
        ) {
            await ns.singularity.installBackdoor();
            ns.tprintf("Backdoor Successful: %s", server);
        }
        let servers = ns.scan(server)
        for (let nextServer of servers) {
            if (nextServer == parent) {
                continue;
            }
            await backdoor(nextServer, server);
            ns.singularity.connect(server);
        }

    }

    await backdoor("home");
    ns.tprint("Backdoor Complete");

}