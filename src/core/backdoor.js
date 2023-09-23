import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog("getHackingLevel");
    ns.disableLog("scan");
    ns.disableLog("sleep");
    ns.disableLog("getServerRequiredHackingLevel");
    ns.disableLog("singularity.connect");

    let start = Date.now();

    let didPrintStart = false;

    let loop = ns.args[0] == "loop";
    let hack = ns.getHackingLevel();
    hack -= (hack % 10);
    let delta = 0;
    do {
        await backdoor("home");
        if (didPrintStart) {
            let secondsSinceStart = (Date.now() - start)/1000;
            let scriptTime = secondsToHms(secondsSinceStart);
            ns.tprintf("└--%s--", scriptTime);
            didPrintStart = false;
        }

        if (!loop) {
            break;
        }

        while (delta < 10) {
            await ns.sleep(10000);
            delta = ns.getHackingLevel() - hack;
        }
        hack = ns.getHackingLevel();
        delta = 0;
        await ns.sleep(1000);
    } while (true);

    async function backdoor(server, parent = "") {
        //ns.printf("Connecting to %s", server);
        ns.singularity.connect(server);
        await ns.sleep(12);
        if (ns.hasRootAccess(server)
            && server !== "home"
            && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
            && !ns.getServer(server).backdoorInstalled
        ) {
            if (!didPrintStart) {
                let secondsSinceStart = (Date.now() - start)/1000;
                let scriptTime = secondsToHms(secondsSinceStart);
                ns.tprintf("┌--Backdoor--%s--", scriptTime);
                didPrintStart = true;
            }
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
                //ns.printf("Backtracking to %s", server);
                ns.singularity.connect(server);
                await ns.sleep(12);
            }
        }
    }

    function secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var m0 = m < 10 ? "0" : "";
        var s = Math.floor(d % 3600 % 60);
        var s0 = s < 10 ? "0" : "";    

        var hDisplay = h > 0 ? h + ":" : "";
        return sprintf("%s%s%s:%s%s", hDisplay, m0, m, s0, s);
    }

}