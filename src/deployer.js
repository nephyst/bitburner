import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    const WEAKEN_TIME_MS = (15 * 60 * 1000);

    while (true) {
        ns.print("\n┌-- Beging Loop ---\n");
        let targets = [];

        let servers = [];
        let serversToScan = ns.scan("home");

        while (serversToScan.length > 0) {
            let server = serversToScan.shift();
            ns.printf("\n ┌-- Scanning %s --", server);
            if (!servers.includes(server) && server !== "home") {
                servers.push(server);
                serversToScan = serversToScan.concat(ns.scan(server));

                if (ns.getServerMaxMoney(server) > 1000 && ns.getWeakenTime(server) < WEAKEN_TIME_MS) {
                    targets.push(server);
                }

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

                if (ns.hasRootAccess(server) && !ns.fileExists("/shared/hack.js", server)) {
                    await ns.scp([
                        "/util/weaken.js",
                        "/util/grow.js",
                        "/util/hack.js"
                    ], server);
                }

            }
            ns.printf(" └-- %s Scanned -- %i remaining --", server, serversToScan.length);
        }

        ns.printf("├---%s targets ---", targets.length);


        let i = 0;
        let sleepTime = 3000;

        for (let server of servers) {
            if (!ns.hasRootAccess(server)) {
                continue;
            }

            ns.printf("\n ┌-- Running %s --", server);

            let target
            do {
                target = targets[i++ % targets.length];
            } while (!ns.hasRootAccess(target));

            let moneyThresh = ns.getServerMaxMoney(target) * 0.75;
            let securityThresh = ns.getServerMinSecurityLevel(target) + 5;
            let ramPerThread = ns.getScriptRam("/shared/weaken.js");

            let ramAvailable = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
            let threads = Math.floor(ramAvailable / ramPerThread);

            let script = "nothing";
            if (threads > 0) {
                if (ns.getServerSecurityLevel(target) > securityThresh) {
                    sleepTime = Math.max(sleepTime, ns.getWeakenTime(target));
                    script = "/shared/weaken.js";
                } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
                    sleepTime = Math.max(sleepTime, ns.getGrowTime(target));
                    script = "/shared/grow.js";
                } else {
                    sleepTime = Math.max(sleepTime, ns.getHackTime(target));
                    script = "/shared/hack.js";
                }
                ns.toast(sprintf("%s using %s on %s with %i threads for %i seconds", server, script, target, threads, ns.formatNumber(sleepTime / 1000.0, 3)), "info", 10000);
                ns.exec(script, server, threads, target);
            }

            ns.printf(" └-- %s Updated --", server);
        }

        ns.printf("\n└-- End Loop --- %i targets\n", targets.length);
        //ns.toast(sprintf("Refreshed instances with %i targets. %j", targets.length, targets),"info", 30000);
        await ns.sleep(5000);

    }
}