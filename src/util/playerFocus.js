import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog("sleep");
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");

    loop: while (true) {
        await ns.sleep(5000);
        ns.print("\n");

        // Try Creating Scripts
        await createScript("BruteSSH.exe", 50);
        await createScript("FTPCrack.exe", 100);
        await createScript("relaySMTP.exe", 250);
        await createScript("HTTPWorm.exe", 500);
        await createScript("SQLInject.exe", 750);

        {
            // Get hacking level to 250
            let work = ns.singularity.getCurrentWork();
            if (ns.getHackingLevel() <= 250) {
                if (!work || work.type !== "CRIME" || work.crimeType !== "Rob Store") {
                    ns.singularity.commitCrime("Rob Store", ns.singularity.isFocused());
                }
                continue;
            }
        }

        let player = ns.getPlayer();
        let playerAugs = ns.singularity.getOwnedAugmentations(true);

        // Stay in Sector-12 for CashRoot Starter Kit
        // TDH for Neuroreceptor Management Implant Augmentation
        let needSector12 = needsRepForAugment("Sector-12") && !player.factions.includes("Sector-12");
        let needsTDH = needsRepForAugment("Tian Di Hui") && !player.factions.includes("Tian Di Hui");
        if (needsTDH && !needSector12 && player.city !== "New Tokyo") {
            ns.singularity.travelToCity("New Tokyo");
        }

        // Join factions
        faction: for (let faction of ns.singularity.checkFactionInvitations()) {
            for (let aug of ns.singularity.getAugmentationsFromFaction(faction)) {
                if (!playerAugs.includes(aug)) {
                    ns.toast(sprintf("Joining %s due to missing %s", faction, aug), "info", 10000);
                    ns.singularity.joinFaction(faction);
                    continue faction;
                }
            }
        }

        //ns.printf("Factions with augments:");
        // Filter out factions where reputation is high enough to afford all augmentations
        let factionsToGrind = player.factions
            .reverse()
            .filter((faction) => {
                let gang = !ns.gang.inGang() || ns.gang.getGangInformation()?.faction !== faction
                if (!gang) {
                    ns.printf(" %s [gang]", faction);
                }
                return gang;
            })
            .filter((faction) => {
                let needsRep = needsRepForAugment(faction, true);
                if (!needsRep) {
                    ns.printf(" %s [complete]", faction);
                }
                return needsRep;
            });

        //ns.printf("Grind faction rep:");
        // Grind Faction Rep
        let doingWork = false;
        for (let shouldGrindReputation of [
            //purchasableAugs(1),
            favorTo(33),
            purchasableAugs(4),
            favorTo(75),
            favorTo(150),
            attemptToDonate()
        ]) {
            for (let faction of factionsToGrind) {
                var grindRep = shouldGrindReputation(faction);
                if (grindRep) {
                    let work = ns.singularity.getCurrentWork();
                    if (work && work.factionName == faction) {
                        ns.printf("%s: continue working", faction);
                        continue loop;
                    }

                    let hacking = ns.singularity.workForFaction(faction, "hacking", ns.singularity.isFocused());
                    if (hacking) {
                        ns.printf(" %s: hacking", faction);
                        continue loop;
                    }
                    let fieldWork = ns.singularity.workForFaction(faction, "field", ns.singularity.isFocused());
                    if (fieldWork) {
                        ns.printf(" %s: field work", faction);
                        continue loop;
                    }

                    let securityWork = ns.singularity.workForFaction(faction, "security", ns.singularity.isFocused());
                    if (securityWork) {
                        ns.printf(" %s: security work", faction);
                        continue loop;
                    }
                    ns.printf("%s: failed all work types");
                }
            }
        }

        // Default to Homicide to lower karma
        if (!doingWork) {
            let work = ns.singularity.getCurrentWork();
            if (ns.heart.break() > -54000) {
                if (!work || work.type !== "CRIME" || work.crimeType !== "Homicide") {
                    ns.singularity.commitCrime("Homicide", ns.singularity.isFocused());
                }
            } else {
                if (!work || work.type !== "CRIME" || work.crimeType !== "Heist") {
                    ns.singularity.commitCrime("Heist", ns.singularity.isFocused());
                }
            }
        }
    }

    function purchasableAugs(n) {
        return (faction) => {
            let playerAugs = ns.singularity.getOwnedAugmentations(true);
            let factionRep = ns.singularity.getFactionRep(faction);

            let augsForSale = ns.singularity.getAugmentationsFromFaction(faction)
                .filter((aug) => !playerAugs.includes(aug));
            let affordableAugs = augsForSale.filter((aug) => ns.singularity.getAugmentationRepReq(aug) < factionRep);
            if (n > augsForSale.length) {
                n = augsForSale.length;
            }

            let hasNPurchasableAugs = affordableAugs.length < n;

            ns.printf(" %s [%s/%s augs]", faction, affordableAugs.length, n);

            return hasNPurchasableAugs;
        }
    }

    function favorTo(favorTarget) {
        return (faction) => {
            let favor = ns.singularity.getFactionFavor(faction);
            let favorGain = ns.singularity.getFactionFavorGain(faction);
            let isFavorBelow = favor + favorGain < favorTarget
            ns.printf(" %s [favor %s < %s] %s", faction, ns.formatNumber(favor + favorGain, 2), favorTarget, isFavorBelow);
            return isFavorBelow;
        }
    }

    function attemptToDonate() {
        return (faction) => {
            let money = ns.getServerMoneyAvailable("home");
            if (ns.singularity.getFactionFavor(faction) > 150 && money > 1e9) {
                ns.singularity.donateToFaction(faction, money);
            }
            return true;
        }
    }

    function needsRepForAugment(faction, debug = false) {
        let playerAugs = ns.singularity.getOwnedAugmentations(true);
        let factionRep = ns.singularity.getFactionRep(faction);

        let factionAugs = ns.singularity.getAugmentationsFromFaction(faction)
            .filter((aug) => !playerAugs.includes(aug));

        // Why this no work?
        let sorted = factionAugs.sort((a, b) => {
            let left = ns.singularity.getAugmentationRepReq(a);
            let right = ns.singularity.getAugmentationRepReq(b);
            return left - right;
        });
        for (let aug of sorted) {
            let augRepCost = ns.singularity.getAugmentationRepReq(aug);
            if (augRepCost > factionRep) {
                if (debug) {
                    ns.printf(" %s [%s / %s rep] %s", faction, ns.formatNumber(factionRep, 2), ns.formatNumber(augRepCost, 2), aug);
                }
                return true;
            }
        }
        return false;

    }

    // Helper function to manually create a script
    async function createScript(file, hackingLevel) {
        if (ns.getHackingLevel() < hackingLevel) {
            return;
        }

        while (!ns.fileExists(file)) {
            let work = ns.singularity.getCurrentWork();
            if (!work || work.type !== "CREATE_PROGRAM" || work.programName !== file) {
                ns.singularity.createProgram(file, ns.singularity.isFocused());
            }
            await ns.sleep(10000);
        }
    }
}
