import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {
    let maxRam = ns.getPurchasedServerMaxRam();
    if (ns.args.length > 0) {
        maxRam = ns.args[0];
    }
    ns.printf("maxRam: %i", maxRam);

    ns.disableLog("sleep");
    ns.disableLog("getServerMoneyAvailable");

    let ram = 4;

    while (true) {
        let servers = ns.getPurchasedServers();
        let serverLimit = ns.getPurchasedServerLimit();
        let atServerLimit = (servers.length == serverLimit);

        for (let i = 0; i < serverLimit; i++) {
            let prevServer = ns.sprintf("pserv%i-%i", i, ram / 2);
            let server = ns.sprintf("pserv%i-%i", i, ram);

            if (!atServerLimit) {
                if (!servers.includes(server)) {
                    await doPurchase(server, ram);
                }
            } else if (servers.includes(prevServer)) {
                await doUpgrade(prevServer, server, ram);
            } else {
                ns.printf("Ø %s", server, prevServer);
            }
        }

        ram *= 2;
        if (maxRam > 0 && ram > maxRam) {
            ns.toast(sprintf("%s / %s", ram, maxRam));
            break;
        }
        await ns.sleep(100);
    }

    async function doPurchase(server, ram) {
        ns.print("purchase %s %s", server, ram)
        let money = ns.getServerMoneyAvailable("home");
        let cost = ns.getPurchasedServerCost(ram);

        while (money < cost) {
            ns.printf("$ %s: $%s / $%s", server, ns.formatNumber(money, "0.000a"), ns.formatNumber(cost, "0.000a"));
            await ns.sleep(5000);
            money = ns.getServerMoneyAvailable("home");
        }

        let servers = ns.getPurchasedServers();
        while (!servers.includes(server)) {
            ns.purchaseServer(server, ram);
            ns.printf("$ %s: $%s", server, ns.formatNumber(cost, "0.000a"));
            ns.toast(sprintf("$ %s: $%s", server, ns.formatNumber(cost, "0.000a")), "info", 20000);
            await ns.sleep(5000);
            servers = ns.getPurchasedServers();
        }
    }

    async function doUpgrade(prevServer, server, ram) {
        let serverRam = ns.getServer(prevServer).ram;
        if (serverRam >= ram) {
            return;
        }

        let money = ns.getServerMoneyAvailable("home");
        let cost = ns.getPurchasedServerUpgradeCost(prevServer, ram);

        while (money < cost) {
            ns.printf("▲ %s: $%s / $%s", server, ns.formatNumber(money, "0.000a"), ns.formatNumber(cost, "0.000a"));
            await ns.sleep(5000);
            money = ns.getServerMoneyAvailable("home");
        }

        let servers = ns.getPurchasedServers();
        while (!servers.includes(server)) {
            ns.upgradePurchasedServer(prevServer, ram);
            ns.renamePurchasedServer(prevServer, server);
            ns.printf("▲ %s ⇒ %s: $%s", prevServer, server, ns.formatNumber(cost, "0.000a"));
            ns.toast(sprintf("▲ %s ⇒ %s: $%s", prevServer, server, ns.formatNumber(cost, "0.000a")), "info", 20000);
            servers = ns.getPurchasedServers();
            if (!servers.includes(server)) {
                await ns.sleep(5000);
                servers = ns.getPurchasedServers();
            }
        }
    }
}